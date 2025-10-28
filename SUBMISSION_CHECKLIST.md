# Project Checklist

## ✅ MVP Requirements

### Multi-User Support
- [x] User registration system
- [x] User login system
- [x] JWT authentication
- [x] Each user sees only their own tasks
- [x] Users cannot modify other users' tasks

### Task Management
- [x] Create tasks
- [x] Delete tasks
- [x] Mark tasks as complete
- [x] Hierarchical structure (up to 3 levels deep)
- [x] Subtasks created under parent tasks

### Collapse/Expand
- [x] Toggle visibility of subtasks
- [x] State saved in database
- [x] Visual indicator (▼/▶)

### Move Tasks
- [x] Move top-level tasks between lists
- [x] Maintains all subtasks when moving
- [x] Modal interface for list selection

### List Management
- [x] Create multiple lists
- [x] Delete lists
- [x] Each list has unique name

### Data Persistence
- [x] SQLite database with SQLAlchemy
- [x] All data saved durably
- [x] Proper relationships and cascade deletes

## ✅ Technical Requirements

### Backend (Flask)
- [x] app.py with all routes
- [x] User model with password hashing
- [x] TodoList model
- [x] Task model with self-referential relationship
- [x] JWT authentication
- [x] CORS enabled
- [x] RESTful API endpoints
- [x] Authorization middleware

### Frontend (React)
- [x] App.js main component
- [x] Auth.js for login/register
- [x] TodoApp.js main container
- [x] TodoList.js list component
- [x] TaskItem.js recursive task component
- [x] App.css with responsive design
- [x] Axios for API calls
- [x] Token management with localStorage

### Documentation
- [x] README.md with comprehensive documentation
- [x] SETUP_GUIDE.md with step-by-step instructions
- [x] requirements.txt with Python dependencies
- [x] package.json with Node dependencies
- [x] .gitignore file
- [x] Code comments explaining functionality

## 📋 Submission Requirements

### Required Files
- [x] app.py (Flask backend)
- [x] requirements.txt (Python dependencies)
- [x] README.md (documentation)
- [x] frontend/package.json (Node dependencies)
- [x] All React components
- [x] All necessary configuration files

### Installation Should Require Only:
```bash
# Backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
pip3 install -r requirements.txt
python3 app.py

# Frontend (separate terminal)
cd frontend
npm install
npm start
```
- [x] Installation works with these commands only

### Demo Video
- [ ] Record screen recording (3-5 minutes)
- [ ] Upload to Loom or similar platform
- [ ] Add link to README.md
- [ ] Demo all features:
  - [ ] User registration/login
  - [ ] Creating lists
  - [ ] Creating tasks
  - [ ] Creating subtasks
  - [ ] Marking tasks complete
  - [ ] Collapsing/expanding tasks
  - [ ] Moving tasks between lists
  - [ ] Deleting tasks and lists
  - [ ] Multiple user isolation

## 🎯 Features to Demo

1. **User Authentication**
   - Register a new account
   - Log out
   - Log back in
   - Show that data persists

2. **Create Lists**
   - Create 2-3 different lists
   - Show multiple lists displayed

3. **Create Tasks**
   - Add several tasks to each list
   - Show tasks appearing immediately

4. **Hierarchical Structure**
   - Add subtasks to a task
   - Add sub-subtasks to a subtask
   - Show 3 levels of nesting

5. **Complete Tasks**
   - Check off some tasks
   - Show visual feedback (strikethrough, opacity)

6. **Collapse/Expand**
   - Collapse a task with subtasks
   - Show subtasks hidden
   - Expand again to show them

7. **Move Tasks**
   - Click "Move" on a top-level task
   - Select different list from modal
   - Show task now in new list

8. **Delete Operations**
   - Delete individual tasks
   - Show subtasks also deleted
   - Delete entire list

9. **Multi-User (Optional)**
   - Register second account
   - Show first user's lists not visible
   - Create different data for second user

## 🚀 Before Submission

### Testing
- [ ] Test all features work correctly
- [ ] Test on fresh installation (delete venv and node_modules, reinstall)
- [ ] Test with multiple user accounts
- [ ] Verify database persistence (restart app, data still there)

### Cleanup
- [ ] Remove todo_app.db (will be recreated on first run)
- [ ] Remove venv/ directory
- [ ] Remove frontend/node_modules/ directory
- [ ] Remove frontend/build/ if it exists
- [ ] Remove any .pyc or __pycache__ files
- [ ] Remove .DS_Store or other OS files

### Documentation
- [ ] README.md is complete and accurate
- [ ] SETUP_GUIDE.md is clear and tested
- [ ] Demo video link is in README.md
- [ ] Demo video is shared/viewable publicly
- [ ] Code has helpful comments

### Create Zip File
```bash
# Make sure you're in the parent directory
# Verify these folders are DELETED before zipping:
# - venv/
# - frontend/node_modules/
# - todo_app.db

# Create the zip
zip -r hierarchical_todo_list_app.zip hierarchical_todo_list_app
```

- [ ] Zip file created
- [ ] Zip file is reasonable size (should be < 5MB without venv/node_modules)
- [ ] Test unzipping and running installation commands

## 📝 Grading Rubric Self-Check

### Functionality (Most Important)
- [x] Multi-user with authentication
- [x] Create/delete lists
- [x] Create/delete tasks
- [x] Hierarchical tasks (nested)
- [x] Mark tasks complete
- [x] Collapse/expand functionality
- [x] Move tasks between lists
- [x] Data persistence

### Code Quality
- [x] Clean, readable code
- [x] Helpful comments
- [x] Proper file organization
- [x] No unnecessary files in submission

### Documentation
- [x] Clear README
- [x] Installation instructions work
- [x] Demo video shows all features
- [x] Code is well-commented

### Technical Implementation
- [x] React frontend
- [x] Flask backend
- [x] SQLAlchemy ORM
- [x] Proper API design
- [x] Security (password hashing, JWT)

## 🎬 Demo Script

Use this script when recording your demo:

1. **Introduction** (15 seconds)
   "Hi, this is my Hierarchical Todo List application. It allows users to create todo lists with nested tasks up to 3 levels deep."

2. **Registration** (20 seconds)
   "First, I'll register a new account... [register]... and I'm automatically logged in."

3. **Create Lists** (30 seconds)
   "I can create multiple lists... [create 2 lists]... Here's my Personal list and Work list."

4. **Create Tasks** (30 seconds)
   "I'll add some tasks... [add 2-3 tasks to each list]"

5. **Hierarchical Structure** (45 seconds)
   "Now I'll add subtasks by clicking the +Sub button... [add subtasks]... and even sub-subtasks... [add sub-subtask]... You can see the three levels of nesting."

6. **Complete Tasks** (15 seconds)
   "I can mark tasks as complete... [check a few boxes]... they get a strikethrough."

7. **Collapse/Expand** (20 seconds)
   "To focus on important tasks, I can collapse subtasks... [click collapse]... and expand them again... [click expand]"

8. **Move Tasks** (25 seconds)
   "I can move top-level tasks between lists... [click Move, select different list]... and it moves with all its subtasks."

9. **Delete** (20 seconds)
   "I can delete individual tasks... [delete a task]... and entire lists... [delete a list]"

10. **Wrap Up** (10 seconds)
    "All data is saved in a SQLite database and persists between sessions. Thanks for watching!"

**Total: ~3.5 minutes**
