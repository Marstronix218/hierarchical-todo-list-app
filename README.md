# Hierarchical Todo List Application

A full-stack web application that allows users to create and manage hierarchical todo lists with multiple levels of nested tasks. Built with React frontend and Flask backend with SQLAlchemy ORM.

## Demo Video

**[INSERT YOUR SCREEN RECORDING LINK HERE]**

Please record a 3-5 minute screen recording demonstrating all features of the application. Use [Loom](https://loom.com/) or any screen recording tool, and ensure the link is publicly viewable.

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
   - Tasks support infinite nesting (task → subtask → sub-subtask → ...)
   - Visual indication of completed tasks

3. **Collapse/Expand Functionality**
   - Hide or show subtasks for any task
   - Helps users focus on important tasks
   - State is preserved in the database

4. **Move Tasks & Reparenting**
   - Move any task or subtask to any list
   - Reparent to another task or to the top level using the Move action
   - Subtrees maintain integrity; moving across lists updates the entire subtree

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

## Installation

To run this application, follow these steps exactly as specified:

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm

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
cd hierarchical_todo_list_app/frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

**Alternative:** From the project root directory, you can also run:
```bash
npm install
npm start
```
This uses npm workspaces to install and start the frontend.

### UI Notes

- Lists display in two columns on desktop for roomier cards.
- Tasks can be nested without a depth limit. Deep trees will indent progressively; text remains visible and wraps as needed.
- Drag and drop: drag a task onto another task to make it a subtask; drag a task into a list's dashed "Drop here" zone to make it top-level in that list. Cross-list moves are supported.
- The "↔️" Move action is also available as a precise alternative to drag-and-drop.
- Reordering: use ⬆️ and ⬇️ buttons on any task to move it up or down among its siblings.

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
   - You can nest tasks without a depth limit

5. **Manage Tasks**
   - **Complete**: Click the checkbox to mark complete
   - **Collapse**: Click the ▼ button to hide subtasks
   - **Reorder**: Use ⬆️ / ⬇️ buttons to change task order
   - **Move**: Click "↔️" to transfer to another list or parent
   - **Drag & Drop**: Drag tasks onto other tasks or into list drop zones
   - **Delete**: Click "🗑️" to remove the task and all subtasks

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
- `PUT /api/tasks/:id/move` - Move a task to another list and/or under another task. Body: `{ list_id?: number, parent_id?: number | null }`
- `PUT /api/tasks/:id/reorder` - Reorder task among siblings. Body: `{ direction: 'up' | 'down' }`
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

- Tasks cascade delete (deleting a task deletes all subtasks)
- Tasks can be moved across lists or reparented; cycles (moving under your own descendant) are prevented server-side
- Collapsed state is saved per-task in the database
- JWT tokens expire after 7 days

## Extensions Implemented

1. ✅ **Infinite Nesting (Extension #1)**: Tasks can be nested without depth limit. The UI handles deep nesting with progressive indentation and text wrapping.

2. ✅ **Arbitrary Task Movement (Extension #2)**: 
   - Move any task or subtask to any list
   - Reparent tasks (change parent or move to top level)
   - Drag-and-drop support for moving tasks
   - Reorder tasks among siblings with ⬆️⬇️ buttons

3. ✅ **Comprehensive Testing (Extension #3)**:
   - 50 backend unit tests with pytest
   - 5 frontend component tests with React Testing Library
   - Tests cover authentication, authorization, CRUD operations, security, and edge cases
   - All tests passing

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

### Manual Testing

Test all MVP features:
1. Create multiple user accounts and verify each user only sees their own lists
2. Create lists and tasks with multiple levels of nesting
3. Mark tasks as complete/incomplete
4. Collapse/expand tasks to hide/show subtasks
5. Move top-level tasks between lists
6. Delete tasks and lists
7. Log out and log back in to verify data persistence

### Automated Tests (Extension #3)

This project includes comprehensive unit tests covering:
- **Backend tests** (50 tests): Authentication, authorization, list/task CRUD, security, edge cases, infinite nesting, cycle prevention
- **Frontend tests** (5 tests): Component rendering, user interactions, recursive task display

#### Running Backend Tests

```bash
# Ensure backend is running in another terminal (python3 app.py)
cd hierarchical_todo_list_app
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
pytest -v
```

All 50 backend tests should pass, covering:
- User authentication (registration, login, JWT tokens)
- Authorization (protected routes, token validation)
- Cross-user isolation (users cannot access others' data)
- List operations (create, read, update, delete)
- Task operations (create, update, complete, collapse, move, delete)
- Hierarchical structure (infinite nesting, cascade deletes)
- Move operations (including cycle prevention)
- Reordering tasks
- Input validation and error handling
- Security (special characters, SQL injection prevention)

#### Running Frontend Tests

```bash
cd hierarchical_todo_list_app/frontend
npm test -- --watchAll=false
```

Frontend tests verify:
- 5-level nested task tree rendering
- Drag-and-drop functionality
- Authentication components
- TodoApp component functionality

**Note:** Backend tests require the Flask server to be running on http://localhost:5000.

## Project Structure

```
hierarchical_todo_list_app/
├── app.py                     # Flask backend (553 lines)
├── requirements.txt           # Python dependencies
├── pytest.ini                 # Pytest configuration
├── package.json               # Root npm config (workspaces)
├── README.md                  # This file
├── .gitignore                 # Git ignore rules
├── test_api.py                # Manual API test script
├── tests/                     # Backend test suite
│   ├── test_comprehensive.py  # Auth, CRUD, edge cases (29 tests)
│   ├── test_security.py       # Security & isolation (19 tests)
│   ├── test_backend_move.py   # Move & nesting (1 test)
│   └── test_reorder.py        # Task reordering (1 test)
└── frontend/
    ├── package.json           # Node dependencies
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        ├── Auth.test.js       # Auth component tests
        ├── TodoApp.test.js    # TodoApp component tests
        ├── TaskItem.test.js   # Task rendering tests
        ├── dragDrop.test.js   # Drag-and-drop tests
        └── components/
            ├── Auth.js        # Login/register
            ├── TodoApp.js     # Main container
            ├── TodoList.js    # List display
            └── TaskItem.js    # Recursive task component
```

## Submission Checklist

Before submitting your zip file:

1. ✅ Test that all features work
2. ✅ Record demo video (3-5 minutes)
3. ✅ Add demo video link to README.md
4. ✅ Run automated tests to verify they pass
5. ⚠️ **Delete these before zipping:**
   - `venv/` folder
   - `frontend/node_modules/` folder
   - `todo_app.db` file
   - `__pycache__/` folders
   - `.git/` folder (if present)
6. ✅ Test installation on fresh setup with commands above

## Technologies Used

- **Backend**: Flask 3.0, SQLAlchemy 3.1, Flask-CORS, PyJWT, SQLite
- **Frontend**: React 18, Axios, dnd-kit (drag-and-drop)
- **Testing**: pytest 8.2, React Testing Library
- **Authentication**: JWT tokens (7-day expiration)
- **Database**: SQLite with cascade deletes for data integrity

## Created for CS162 Web Development Course
