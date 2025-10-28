# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                   http://localhost:3000                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP Requests
                           │ (with JWT Token)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    React Frontend                           │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │   App.js   │─▶│  Auth.js    │  │  TodoApp.js  │        │
│  │            │  │ (Login/Reg) │  │   (Main)     │        │
│  └────────────┘  └─────────────┘  └──────┬───────┘        │
│                                           │                 │
│                         ┌─────────────────▼────┐           │
│                         │    TodoList.js       │           │
│                         │   (List Display)     │           │
│                         └──────────┬───────────┘           │
│                                    │                        │
│                         ┌──────────▼───────────┐           │
│                         │    TaskItem.js       │           │
│                         │  (Recursive Task)    │◀──┐       │
│                         └──────────────────────┘   │       │
│                                                     │       │
│                         (renders itself for kids)──┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Axios HTTP Calls
                           │ Authorization: Bearer <token>
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Flask Backend                            │
│                  http://localhost:5000                      │
│  ┌──────────────────────────────────────────────┐          │
│  │              app.py (415 lines)              │          │
│  │                                              │          │
│  │  ┌────────────────────────────────────────┐ │          │
│  │  │     Authentication Routes              │ │          │
│  │  │  POST /api/register                    │ │          │
│  │  │  POST /api/login                       │ │          │
│  │  └────────────────────────────────────────┘ │          │
│  │                                              │          │
│  │  ┌────────────────────────────────────────┐ │          │
│  │  │     List Routes (Protected)            │ │          │
│  │  │  GET    /api/lists                     │ │          │
│  │  │  POST   /api/lists                     │ │          │
│  │  │  PUT    /api/lists/:id                 │ │          │
│  │  │  DELETE /api/lists/:id                 │ │          │
│  │  └────────────────────────────────────────┘ │          │
│  │                                              │          │
│  │  ┌────────────────────────────────────────┐ │          │
│  │  │     Task Routes (Protected)            │ │          │
│  │  │  POST   /api/tasks                     │ │          │
│  │  │  PUT    /api/tasks/:id                 │ │          │
│  │  │  PUT    /api/tasks/:id/move            │ │          │
│  │  │  DELETE /api/tasks/:id                 │ │          │
│  │  └────────────────────────────────────────┘ │          │
│  │                                              │          │
│  │  ┌────────────────────────────────────────┐ │          │
│  │  │     @require_auth Decorator            │ │          │
│  │  │  - Extracts JWT from header            │ │          │
│  │  │  - Validates token                     │ │          │
│  │  │  - Sets request.current_user_id        │ │          │
│  │  └────────────────────────────────────────┘ │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                       │
│                     │ SQLAlchemy ORM                        │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SQLite Database                            │
│                    (todo_app.db)                            │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │     users     │  │  todo_lists   │  │     tasks     │  │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤  │
│  │ id            │  │ id            │  │ id            │  │
│  │ username      │  │ name          │  │ title         │  │
│  │ password_hash │  │ user_id    ───┼──│ completed     │  │
│  │ created_at    │  │ created_at    │  │ collapsed     │  │
│  └───────┬───────┘  └───────┬───────┘  │ list_id    ───┼──┘
│          │                  │          │ parent_id  ───┼──┐
│          │                  │          │ created_at    │  │
│          │                  │          └───────────────┘  │
│          │                  │                             │
│          │                  └─────────────────────────────┘
│          └────────────────────────────────────────────────
│          One-to-Many: User → TodoLists → Tasks
│          Self-Referential: Task.parent_id → Task.id
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration/Login

```
User enters credentials
        ↓
    Auth.js component
        ↓
    axios.post('/api/register' or '/api/login')
        ↓
    Flask receives request
        ↓
    Validate username/password
        ↓
    Create JWT token (expires in 7 days)
        ↓
    Return token + user info
        ↓
    Store in localStorage
        ↓
    Set axios default header: Authorization: Bearer <token>
```

### 2. Creating a Hierarchical Task

```
User types task title
        ↓
    TodoList.js or TaskItem.js
        ↓
    axios.post('/api/tasks', {
        title: "Task name",
        list_id: 123,
        parent_id: 456  // null for top-level
    })
        ↓
    Flask @require_auth decorator validates token
        ↓
    Verify list ownership via user_id
        ↓
    If parent_id provided, verify parent exists
        ↓
    Create Task in database
        ↓
    Return task with children (recursive)
        ↓
    Frontend refreshes list
        ↓
    TaskItem.js renders task
        ↓
    If task has children, TaskItem renders itself recursively
```

### 3. Collapsing/Expanding Subtasks

```
User clicks ▼ button
        ↓
    TaskItem.js handleToggleCollapse()
        ↓
    axios.put('/api/tasks/123', {
        collapsed: true
    })
        ↓
    Flask updates Task.collapsed in database
        ↓
    Return updated task
        ↓
    Frontend refreshes list
        ↓
    TaskItem checks task.collapsed
        ↓
    If collapsed: don't render children
    If expanded: render children recursively
```

### 4. Moving Task Between Lists

```
User clicks "Move" button (top-level task only)
        ↓
    TaskItem.js shows modal with list selector
        ↓
    User selects new list
        ↓
    axios.put('/api/tasks/123/move', {
        list_id: 789
    })
        ↓
    Flask validates:
        - Task has no parent (parent_id is null)
        - New list belongs to current user
        ↓
    Update Task.list_id
        ↓
    Return updated task
        ↓
    Frontend refreshes BOTH lists
        ↓
    Task appears in new list with all its children
```

## Component Hierarchy

```
App.js (Auth State Management)
├── Auth.js (if not authenticated)
│   └── Login/Register Form
│
└── TodoApp.js (if authenticated)
    ├── Header (with logout)
    ├── New List Input
    └── List of TodoList components
        └── TodoList.js (for each list)
            ├── List Header (name, delete button)
            ├── New Task Input
            └── List of TaskItem components
                └── TaskItem.js (recursive)
                    ├── Checkbox (complete)
                    ├── Task Title
                    ├── Collapse Button (if has children)
                    ├── Add Subtask Button (if depth < 2)
                    ├── Move Button (if no parent)
                    ├── Delete Button
                    ├── Add Subtask Form (if active)
                    ├── Move Modal (if active)
                    └── Subtasks Container
                        └── TaskItem.js (recursive) ◀──┐
                            └── (renders itself) ──────┘
```

## Database Relationships

### User → TodoList (One-to-Many)
```sql
User.id ←─── TodoList.user_id
```
- One user has many lists
- Cascade delete: deleting user deletes all their lists

### TodoList → Task (One-to-Many)
```sql
TodoList.id ←─── Task.list_id
```
- One list has many tasks
- Cascade delete: deleting list deletes all its tasks

### Task → Task (Self-Referential, One-to-Many)
```sql
Task.id ←─── Task.parent_id
```
- One task can have many child tasks
- `parent_id = NULL` means top-level task
- Cascade delete: deleting task deletes all its subtasks

## Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│  Every Protected API Request                             │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Extract Authorization header│
         │ Format: "Bearer <token>"    │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ Decode JWT token            │
         │ Extract user_id from payload│
         └──────────┬──────────────────┘
                    │
            ┌───────┴────────┐
            │                │
    Valid Token         Invalid/Expired
            │                │
            ▼                ▼
    Continue with      Return 401
    request.           Unauthorized
    current_user_id
    set
```

## Key Design Patterns

### 1. Recursive Component (TaskItem.js)
- TaskItem renders itself for each child
- Depth tracking prevents infinite nesting
- Enables flexible hierarchy display

### 2. JWT Authentication
- Stateless authentication
- Token stored in localStorage
- Sent with every request via Axios headers

### 3. RESTful API Design
- Resources: users, lists, tasks
- HTTP verbs: GET, POST, PUT, DELETE
- Proper status codes: 200, 201, 400, 401, 403, 404

### 4. ORM (SQLAlchemy)
- Models define schema
- Relationships handle foreign keys
- Cascade deletes maintain referential integrity

### 5. Single Page Application (SPA)
- React handles all routing
- No page reloads
- Fast, responsive user experience

## Security Features

1. **Password Hashing**: Werkzeug's `generate_password_hash()`
2. **JWT Tokens**: Expire after 7 days
3. **Authorization**: `@require_auth` decorator on all protected routes
4. **Ownership Validation**: Backend verifies user owns the resource
5. **CORS**: Configured for localhost development

## File Responsibilities

| File | Lines | Purpose |
|------|-------|---------|
| app.py | 415 | Entire backend - models, routes, auth |
| App.js | 55 | Main React app, auth state |
| Auth.js | 98 | Login/register form and logic |
| TodoApp.js | 148 | Main todo interface, list management |
| TodoList.js | 73 | Single list display |
| TaskItem.js | 215 | Recursive task display (most complex) |
| App.css | 380 | All styling |

## Technology Choices

### Why Flask?
- Lightweight and flexible
- Easy to learn
- Great for APIs
- Excellent SQLAlchemy integration

### Why React?
- Component-based architecture
- Perfect for dynamic UIs
- Recursive components ideal for hierarchical data
- Large ecosystem

### Why SQLAlchemy?
- Pythonic database access
- Handles relationships elegantly
- Easy migrations
- Prevents SQL injection

### Why SQLite?
- No setup required
- Perfect for development
- File-based (easy to backup)
- Good for single-user apps

### Why JWT?
- Stateless (no session storage)
- Scalable
- Works across domains
- Industry standard
