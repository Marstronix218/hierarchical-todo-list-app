# Quick Setup Guide

This document provides step-by-step instructions to get your Hierarchical Todo List App running.

## Prerequisites Check

Before starting, verify you have:
- Python 3.8+ installed: `python3 --version`
- Node.js 14+ installed: `node --version`
- npm installed: `npm --version`

## Step 1: Backend Setup

### macOS/Linux:

```bash
# 1. Open Terminal and navigate to the project directory
cd /path/to/hierarchical_todo_list_app

# 2. Create a Python virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
source venv/bin/activate

# 4. Install Python dependencies
pip3 install -r requirements.txt

# 5. Start the Flask backend
python3 app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal window open!** The backend needs to keep running.

### Windows:

```bash
# 1. Open Command Prompt and navigate to the project directory
cd C:\path\to\hierarchical_todo_list_app

# 2. Create a Python virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
venv\Scripts\activate.bat

# 4. Install Python dependencies
pip3 install -r requirements.txt

# 5. Start the Flask backend
python3 app.py
```

## Step 2: Frontend Setup

### Open a NEW terminal window (don't close the backend terminal!)

```bash
# 1. Navigate to the frontend directory
cd /path/to/hierarchical_todo_list_app/frontend

# 2. Install Node.js dependencies (this may take a few minutes)
npm install

# 3. Start the React development server
npm start
```

Your browser should automatically open to `http://localhost:3000`

If it doesn't, manually open your browser and go to: **http://localhost:3000**

## Step 3: Using the Application

1. **Register a new account**
   - Click "Register" 
   - Enter a username and password
   - Click "Register" button

2. **Create your first list**
   - Enter a list name (e.g., "My Tasks")
   - Click "Create List"

3. **Add tasks**
   - Type a task in the input field
   - Click "Add"
   - Add more tasks!

4. **Add subtasks**
   - Click the "+Sub" button on any task
   - Enter the subtask name
   - Click "Add"

5. **Try other features**
   - Check the checkbox to mark tasks complete
   - Click ▼ to collapse/expand subtasks
   - Click "Move" to move tasks between lists
   - Click "Delete" to remove tasks

## Troubleshooting

### Backend won't start

**Error: "Address already in use"**
- Solution: Another program is using port 5000. 
- Change port in `app.py` line 415 to `app.run(debug=True, port=5001)`

**Error: "No module named flask"**
- Solution: Make sure you activated the virtual environment
- Run: `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate.bat` (Windows)

**Error: "Permission denied"**
- Solution: You may need to use `pip` instead of `pip3`

### Frontend won't start

**Error: "Cannot find module"**
- Solution: Delete `node_modules` folder and run `npm install` again

**Error: "Port 3000 already in use"**
- Solution: React will ask if you want to use a different port. Type 'y' and press Enter.

**Error: "Failed to compile"**
- Solution: Make sure all files are in the correct location (check Project Structure in README.md)

### Can't connect to backend

**Error: "Network Error" in browser console**
- Make sure the backend is running (check the first terminal)
- Backend should be on http://localhost:5000
- Frontend should be on http://localhost:3000

## Stopping the Application

1. In the **frontend terminal**: Press `Ctrl + C`
2. In the **backend terminal**: Press `Ctrl + C`
3. Deactivate Python virtual environment: Type `deactivate` and press Enter

## Next Steps

- Read the full README.md for detailed documentation
- Create your demo video
- Test all features thoroughly
- Zip the project for submission (make sure to exclude `venv/` and `node_modules/`)

## Creating the Submission Zip

### macOS/Linux:
```bash
# Navigate to parent directory
cd /path/to/parent/directory

# Create zip (this automatically excludes venv and node_modules)
zip -r hierarchical_todo_list_app.zip hierarchical_todo_list_app \
  -x "*/venv/*" "*/node_modules/*" "*/.git/*" "*/__pycache__/*" "*.pyc" "*.db"
```

### Windows (PowerShell):
```powershell
# Use Windows Explorer to:
# 1. Copy the hierarchical_todo_list_app folder
# 2. Delete the venv/ and frontend/node_modules/ folders from the copy
# 3. Right-click the folder and select "Send to > Compressed (zipped) folder"
```

Or use PowerShell:
```powershell
Compress-Archive -Path hierarchical_todo_list_app -DestinationPath hierarchical_todo_list_app.zip
```

**Important**: Before zipping, delete these folders:
- `venv/`
- `frontend/node_modules/`
- `todo_app.db` (if it exists)

Your grader will recreate these using the installation instructions.
