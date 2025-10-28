# Quick Reference Card

## 🚀 Start the App

### Terminal 1 (Backend):
```bash
cd /Users/nori/cs162/my_assignments/hierarchical_todo_list_app
source venv/bin/activate
python3 app.py
```

### Terminal 2 (Frontend):
```bash
cd /Users/nori/cs162/my_assignments/hierarchical_todo_list_app/frontend
npm start
```

### First Time Setup?
Add these before the commands above:

**Backend (Terminal 1):**
```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

**Frontend (Terminal 2):**
```bash
npm install
```

## 🛑 Stop the App

- Frontend: Press `Ctrl+C` in Terminal 2
- Backend: Press `Ctrl+C` in Terminal 1

## 📁 File Structure

```
hierarchical_todo_list_app/
├── app.py                 # Flask backend (415 lines)
├── requirements.txt       # Python packages
├── README.md             # Main documentation
├── SETUP_GUIDE.md        # Installation guide
├── test_api.py           # Backend tests
└── frontend/
    ├── package.json      # Node packages
    └── src/
        ├── App.js        # Main React app
        ├── App.css       # All styles
        └── components/
            ├── Auth.js         # Login/Register
            ├── TodoApp.js      # Lists container
            ├── TodoList.js     # Single list
            └── TaskItem.js     # Task (recursive)
```

## ✅ Features Checklist

- ✅ User registration & login (JWT)
- ✅ Multiple lists per user
- ✅ Create/delete lists
- ✅ Create/delete tasks
- ✅ Hierarchical tasks (3 levels)
- ✅ Mark tasks complete
- ✅ Collapse/expand subtasks
- ✅ Move tasks between lists
- ✅ SQLite database persistence

## 🎬 Demo Steps (3-5 min)

1. Register account (20 sec)
2. Create 2 lists (20 sec)
3. Add tasks to lists (30 sec)
4. Add subtasks (show 3 levels) (45 sec)
5. Mark some complete (15 sec)
6. Collapse/expand (20 sec)
7. Move task between lists (25 sec)
8. Delete task and list (20 sec)

**Total: ~3.5 minutes**

## 🐛 Quick Fixes

**Backend Error?**
```bash
# Delete database and restart
rm todo_app.db
python3 app.py
```

**Frontend Error?**
```bash
# Reinstall packages
rm -rf node_modules package-lock.json
npm install
npm start
```

**Port In Use?**
- Backend: Change port in app.py line 415
- Frontend: Type 'y' when prompted

## 📦 Create Submission Zip

**FIRST: Delete these folders:**
- `venv/`
- `frontend/node_modules/`
- `todo_app.db`

**Then zip:**
```bash
cd /Users/nori/cs162/my_assignments
zip -r hierarchical_todo_list_app.zip hierarchical_todo_list_app \
  -x "*/venv/*" "*/node_modules/*" "*.db" "*/__pycache__/*"
```

**Check size:** Should be < 5MB

## 📝 Before Submitting

- [ ] Record demo video
- [ ] Add video link to README.md
- [ ] Make video publicly viewable
- [ ] Test fresh install
- [ ] Delete venv/ and node_modules/
- [ ] Create zip file
- [ ] Test zip file unzips correctly

## 🆘 Help

- Full docs: `README.md`
- Setup: `SETUP_GUIDE.md`
- Checklist: `SUBMISSION_CHECKLIST.md`
- Summary: `PROJECT_SUMMARY.md`

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 🔑 Test Credentials

Create your own when testing:
- Username: anything you want
- Password: anything you want

## 📊 Tech Stack

- **Frontend**: React 18 + Axios
- **Backend**: Flask 3 + SQLAlchemy
- **Database**: SQLite
- **Auth**: JWT (PyJWT)
- **API**: RESTful

---

**Need more info?** Check the other documentation files!
