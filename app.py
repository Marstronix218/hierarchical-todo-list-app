"""
Hierarchical Todo List App - Flask Backend
This application provides a REST API for managing hierarchical todo lists.
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# ==================== Models ====================

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    lists = db.relationship('TodoList', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat()
        }


class TodoList(db.Model):
    """TodoList model - each user can have multiple lists"""
    __tablename__ = 'todo_lists'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='list', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_tasks=False):
        """Convert list to dictionary"""
        result = {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat()
        }
        if include_tasks:
            # Only include top-level tasks (tasks without parent)
            top_level_tasks = [task for task in self.tasks if task.parent_id is None]
            result['tasks'] = [task.to_dict(include_children=True) for task in top_level_tasks]
        return result


class Task(db.Model):
    """Task model - hierarchical structure with parent-child relationships"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    collapsed = db.Column(db.Boolean, default=False)  # Whether subtasks are hidden
    list_id = db.Column(db.Integer, db.ForeignKey('todo_lists.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for hierarchy
    children = db.relationship('Task', backref=db.backref('parent', remote_side=[id]), 
                               lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_children=False):
        """Convert task to dictionary"""
        result = {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'collapsed': self.collapsed,
            'list_id': self.list_id,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat()
        }
        if include_children:
            result['children'] = [child.to_dict(include_children=True) for child in self.children]
        return result


# ==================== Authentication Utilities ====================

def generate_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require authentication for routes"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        try:
            token = auth_header.split(' ')[1]  # Format: "Bearer <token>"
            user_id = verify_token(token)
            if not user_id:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user to request context
            request.current_user_id = user_id
            return f(*args, **kwargs)
        except (IndexError, AttributeError):
            return jsonify({'error': 'Invalid authorization header format'}), 401
    
    return decorated_function


# ==================== Authentication Routes ====================

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # Create new user
    user = User(username=data['username'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Find user
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


# ==================== List Routes ====================

@app.route('/api/lists', methods=['GET'])
@require_auth
def get_lists():
    """Get all lists for the current user"""
    lists = TodoList.query.filter_by(user_id=request.current_user_id).all()
    return jsonify([l.to_dict(include_tasks=True) for l in lists]), 200


@app.route('/api/lists', methods=['POST'])
@require_auth
def create_list():
    """Create a new list"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'List name is required'}), 400
    
    new_list = TodoList(
        name=data['name'],
        user_id=request.current_user_id
    )
    
    db.session.add(new_list)
    db.session.commit()
    
    return jsonify(new_list.to_dict(include_tasks=True)), 201


@app.route('/api/lists/<int:list_id>', methods=['PUT'])
@require_auth
def update_list(list_id):
    """Update a list"""
    todo_list = TodoList.query.get(list_id)
    
    if not todo_list:
        return jsonify({'error': 'List not found'}), 404
    
    if todo_list.user_id != request.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    if data.get('name'):
        todo_list.name = data['name']
    
    db.session.commit()
    
    return jsonify(todo_list.to_dict(include_tasks=True)), 200


@app.route('/api/lists/<int:list_id>', methods=['DELETE'])
@require_auth
def delete_list(list_id):
    """Delete a list"""
    todo_list = TodoList.query.get(list_id)
    
    if not todo_list:
        return jsonify({'error': 'List not found'}), 404
    
    if todo_list.user_id != request.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(todo_list)
    db.session.commit()
    
    return jsonify({'message': 'List deleted successfully'}), 200


# ==================== Task Routes ====================

@app.route('/api/tasks', methods=['POST'])
@require_auth
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('list_id'):
        return jsonify({'error': 'Task title and list_id are required'}), 400
    
    # Verify list ownership
    todo_list = TodoList.query.get(data['list_id'])
    if not todo_list or todo_list.user_id != request.current_user_id:
        return jsonify({'error': 'List not found or unauthorized'}), 403
    
    # If parent_id is provided, verify it exists and belongs to the same list
    if data.get('parent_id'):
        parent = Task.query.get(data['parent_id'])
        if not parent or parent.list_id != data['list_id']:
            return jsonify({'error': 'Invalid parent task'}), 400
    
    new_task = Task(
        title=data['title'],
        list_id=data['list_id'],
        parent_id=data.get('parent_id')
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_dict(include_children=True)), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    """Update a task"""
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Verify ownership through list
    if task.list.user_id != request.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'completed' in data:
        task.completed = data['completed']
    if 'collapsed' in data:
        task.collapsed = data['collapsed']
    
    db.session.commit()
    
    return jsonify(task.to_dict(include_children=True)), 200


@app.route('/api/tasks/<int:task_id>/move', methods=['PUT'])
@require_auth
def move_task(task_id):
    """Move a task to a different list (only for top-level tasks)"""
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Verify ownership
    if task.list.user_id != request.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if task is top-level
    if task.parent_id is not None:
        return jsonify({'error': 'Only top-level tasks can be moved between lists'}), 400
    
    data = request.get_json()
    new_list_id = data.get('list_id')
    
    if not new_list_id:
        return jsonify({'error': 'New list_id is required'}), 400
    
    # Verify new list ownership
    new_list = TodoList.query.get(new_list_id)
    if not new_list or new_list.user_id != request.current_user_id:
        return jsonify({'error': 'New list not found or unauthorized'}), 403
    
    task.list_id = new_list_id
    db.session.commit()
    
    return jsonify(task.to_dict(include_children=True)), 200


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    """Delete a task (and all its children)"""
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Verify ownership
    if task.list.user_id != request.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'}), 200


# ==================== Initialize Database ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
