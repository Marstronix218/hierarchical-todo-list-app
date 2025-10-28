# Hierarchical Todo List Application

A full-stack web application that allows users to create and manage hierarchical todo lists with multiple levels of nested tasks. Built with React frontend and Flask backend with SQLAlchemy ORM.

## Demo Video

**[INSERT YOUR SCREEN RECORDING LINK HERE]**

(Please record a 3-5 minute demo showing all features of the application)

## Features

### MVP Features ✅

1. **Multi-User Support**
   - User registration and login
   - Each user has their own isolated todo lists
   - JWT-based authentication
   - Users cannot access or modify other users' tasks

2. **Task Management**
   - Create, read, update, and delete tasks
   - Mark tasks as complete/incomplete
   - Tasks can be nested up to 3 levels deep (task → subtask → sub-subtask)
   - Visual indication of completed tasks

3. **Collapse/Expand Functionality**
   - Hide or show subtasks for any task
   - Helps users focus on important tasks
   - State is preserved in the database

4. **Move Tasks Between Lists**
   - Top-level tasks can be moved to different lists
   - Maintains all subtasks when moving
   - Simple modal interface for list selection

5. **Multiple Lists**
   - Users can create multiple todo lists
   - Each list has a unique name
   - Delete entire lists with all tasks

6. **Persistent Storage**
   - SQLite database with SQLAlchemy ORM
   - All data is saved durably
   - Hierarchical task structure using self-referential relationships

## Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-Origin Resource Sharing
- **PyJWT** - JSON Web Token authentication
- **SQLite** - Database

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
hierarchical_todo_list_app/
├── app.py                  # Flask backend application
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── todo_app.db            # SQLite database (created on first run)
└── frontend/
    ├── package.json       # Node.js dependencies
    ├── public/
    │   └── index.html     # HTML template
    └── src/
        ├── index.js       # React entry point
        ├── App.js         # Main App component
        ├── App.css        # Global styles
        └── components/
            ├── Auth.js    # Login/Register component
            ├── TodoApp.js # Main todo app container
            ├── TodoList.js # Individual list component
            └── TaskItem.js # Recursive task component
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup (Flask)

#### macOS/Linux:

```bash
# Navigate to the project directory
cd hierarchical_todo_list_app

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip3 install -r requirements.txt

# Run the Flask backend
python3 app.py
```

The backend will start on `http://localhost:5000`

#### Windows:

```bash
# Navigate to the project directory
cd hierarchical_todo_list_app

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat

# Install dependencies
pip3 install -r requirements.txt

# Run the Flask backend
python3 app.py
```

### Frontend Setup (React)

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd hierarchical_todo_list_app/frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Usage Guide

### Getting Started

1. **Register an Account**
   - Click "Register" on the login page
   - Enter a username and password
   - You'll be automatically logged in

2. **Create Your First List**
   - Enter a list name in the "New list name" input
   - Click "Create List"

3. **Add Tasks**
   - Type a task title in the "Add a task..." input
   - Click "Add" to create the task

4. **Add Subtasks**
   - Click the "+Sub" button on any task
   - Enter the subtask title and click "Add"
   - You can nest tasks up to 3 levels deep

5. **Manage Tasks**
   - **Complete**: Click the checkbox to mark complete
   - **Collapse**: Click the ▼ button to hide subtasks
   - **Move**: Click "Move" to transfer to another list (top-level only)
   - **Delete**: Click "Delete" to remove the task and all subtasks

### Key Features Demo

- **Multiple Users**: Create different accounts and verify that lists are isolated
- **Hierarchical Structure**: Create tasks with subtasks and sub-subtasks
- **Collapse/Expand**: Use the arrow button to hide/show nested tasks
- **Move Between Lists**: Create multiple lists and move tasks between them
- **Mark Complete**: Check tasks off as you complete them

## API Documentation

### Authentication Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive JWT token

### List Endpoints

- `GET /api/lists` - Get all lists for current user
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update a list name
- `DELETE /api/lists/:id` - Delete a list

### Task Endpoints

- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `PUT /api/tasks/:id/move` - Move a task to another list
- `DELETE /api/tasks/:id` - Delete a task

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Hashed password
- `created_at` - Timestamp

### TodoLists Table
- `id` - Primary key
- `name` - List name
- `user_id` - Foreign key to Users
- `created_at` - Timestamp

### Tasks Table
- `id` - Primary key
- `title` - Task title
- `completed` - Boolean completion status
- `collapsed` - Boolean collapse state
- `list_id` - Foreign key to TodoLists
- `parent_id` - Self-referential foreign key (null for top-level tasks)
- `created_at` - Timestamp

## Code Highlights

### Backend Architecture
- **Models** (`app.py` lines 24-107): SQLAlchemy models with relationships
- **Authentication** (`app.py` lines 111-148): JWT token generation and verification
- **Authorization Decorator** (`app.py` lines 125-148): Protects routes requiring login
- **Hierarchical Tasks** (`app.py` lines 80-107): Self-referential Task model with cascade delete

### Frontend Architecture
- **Authentication Flow** (`App.js`): Manages token and user state
- **Recursive Components** (`TaskItem.js`): Renders tasks and subtasks recursively
- **State Management**: Uses React hooks for local state
- **API Integration**: Axios with Bearer token authentication

## Development Notes

- The depth limit of 3 levels is enforced in the UI (see `TaskItem.js` line 124)
- Tasks cascade delete (deleting a task deletes all subtasks)
- Moving tasks only works for top-level tasks (enforced in backend)
- Collapsed state is saved per-task in the database
- JWT tokens expire after 7 days

## Known Limitations

1. Top-level tasks only can be moved between lists (as per MVP requirements)
2. Maximum nesting depth of 3 levels (task → subtask → sub-subtask)
3. No task reordering within a list
4. No task editing (title is immutable after creation)
5. No forgot password functionality

## Future Enhancements

Possible extensions beyond MVP:
- Allow infinite nesting depth with better UI/UX
- Enable moving any task to any position
- Add task due dates and priorities
- Implement task search and filtering
- Add task descriptions and notes
- Enable task reordering with drag-and-drop
- Add task editing capabilities
- Implement shared lists between users

## Troubleshooting

### Backend Issues

**Database errors**: Delete `todo_app.db` and restart the backend to recreate the database.

**Port already in use**: Change the port in `app.py` (line 415) to a different number.

**CORS errors**: Ensure Flask-CORS is installed and the backend is running.

### Frontend Issues

**Cannot connect to backend**: Verify the backend is running on port 5000.

**npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

**Port 3000 in use**: React will automatically offer to use a different port.

## Testing

To test the application:

1. Create multiple user accounts
2. Verify each user only sees their own lists
3. Create lists and tasks with multiple levels
4. Test collapse/expand functionality
5. Test moving tasks between lists
6. Test marking tasks as complete
7. Test deleting tasks and lists
8. Log out and log back in to verify data persistence

## Author

Created for CS162 Web Development Course

## License

This project is created for educational purposes.
