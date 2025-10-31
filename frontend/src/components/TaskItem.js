/**
 * TaskItem Component
 * Displays a single task with its subtasks (recursive component)
 */

import React, { useState } from 'react';
import axios from 'axios';

function TaskItem({ task, listId, allLists, onRefresh, depth }) {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState(task.list_id);
  const [selectedParentId, setSelectedParentId] = useState(task.parent_id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * Toggle task completion status
   */
  const handleToggleComplete = async () => {
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  /**
   * Toggle collapse state (show/hide subtasks)
   */
  const handleToggleCollapse = async () => {
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        collapsed: !task.collapsed
      });
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  /**
   * Delete this task
   */
  const handleDelete = async () => {
    if (!window.confirm('Delete this task and all its subtasks?')) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${task.id}`);
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  /**
   * Create a subtask
   */
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await axios.post('/api/tasks', {
        title: newSubtaskTitle,
        list_id: task.list_id,
        parent_id: task.id
      });
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert('Failed to create subtask');
    }
  };

  /**
   * Edit task title
   */
  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editedTitle.trim()) {
      alert('Task title cannot be empty');
      return;
    }

    try {
      await axios.put(`/api/tasks/${task.id}`, {
        title: editedTitle
      });
      setIsEditing(false);
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  /**
   * Move task: allow moving under any parent in any list
   */
  const handleMoveTask = async () => {
    try {
      await axios.put(`/api/tasks/${task.id}/move`, {
        list_id: selectedListId,
        parent_id: selectedParentId
      });
      setShowMoveModal(false);
      // Refresh possibly affected lists
      onRefresh(task.list_id);
      if (selectedListId !== task.list_id) onRefresh(selectedListId);
    } catch (error) {
      console.error('Error moving task:', error);
      alert(error.response?.data?.error || 'Failed to move task');
    }
  };

  /**
   * Reorder task up or down among siblings
   */
  const handleReorder = async (direction) => {
    try {
      await axios.put(`/api/tasks/${task.id}/reorder`, {
        direction
      });
      onRefresh(task.list_id);
    } catch (error) {
      console.error('Error reordering task:', error);
      alert(error.response?.data?.error || 'Failed to reorder task');
    }
  };

  // Helpers to build parent selection list while preventing cycles
  const collectDescendantIds = (node) => {
    const ids = new Set();
    const stack = [...(node.children || [])];
    while (stack.length) {
      const n = stack.pop();
      ids.add(n.id);
      if (n.children) stack.push(...n.children);
    }
    return ids;
  };

  const forbiddenIds = React.useMemo(() => collectDescendantIds(task), [task]);

  const flattenTasks = (nodes, prefix = '') => {
    const result = [];
    (nodes || []).forEach((n) => {
      result.push({ id: n.id, label: `${prefix}${n.title}` });
      if (n.children && n.children.length) {
        result.push(...flattenTasks(n.children, `${prefix}— `));
      }
    });
    return result;
  };

  const selectedList = allLists.find((l) => l.id === selectedListId);
  const parentOptions = selectedList ? flattenTasks(selectedList.tasks || []) : [];

  const hasChildren = task.children && task.children.length > 0;
  const canMove = true; // Any task can be moved

  return (
    <div
      className={`task-item ${isDragOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={(e) => {
        // mark this task as the dragged source
        try {
          e.dataTransfer.setData(
            'application/json',
            JSON.stringify({ taskId: task.id, listId: task.list_id })
          );
        } catch (err) {
          // noop
        }
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        let payload = null;
        try {
          const text = e.dataTransfer.getData('application/json');
          payload = JSON.parse(text);
        } catch (err) {
          return;
        }
        if (!payload || !payload.taskId) return;
        if (payload.taskId === task.id) return; // ignore dropping onto itself
        try {
          await axios.put(`/api/tasks/${payload.taskId}/move`, {
            list_id: task.list_id,
            parent_id: task.id
          });
          // refresh affected lists
          onRefresh(task.list_id);
          if (payload.listId && payload.listId !== task.list_id) {
            onRefresh(payload.listId);
          }
        } catch (error) {
          console.error('Error moving via DnD:', error);
          alert(error.response?.data?.error || 'Failed to move task');
        }
      }}
    >
      <div className={`task-content ${task.completed ? 'completed' : ''}`}>
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
        />
        
        {hasChildren && (
          <button 
            onClick={handleToggleCollapse}
            className="collapse-btn-inline"
            title={task.collapsed ? 'Expand subtasks' : 'Collapse subtasks'}
          >
            {task.collapsed ? '▶' : '▼'}
          </button>
        )}
        
        {isEditing ? (
          <form onSubmit={handleEditTask} className="edit-form">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              className="edit-input"
            />
            <button type="submit" className="btn-success btn-small">
              ✓
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary btn-small">
              ✕
            </button>
          </form>
        ) : (
          <span 
            className={`task-text ${task.completed ? 'completed' : ''}`}
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
          >
            {task.title}
          </span>
        )}

        <div className="task-actions">
          {!isEditing && (
            <>
              <button 
                onClick={() => handleReorder('up')}
                className="action-btn"
                title="Move up"
              >
                ⬆️
              </button>
              
              <button 
                onClick={() => handleReorder('down')}
                className="action-btn"
                title="Move down"
              >
                ⬇️
              </button>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="action-btn"
                title="Edit task"
              >
                ✏️
              </button>
              
              <button 
                onClick={() => setShowAddSubtask(!showAddSubtask)}
                className="action-btn"
                title="Add subtask"
              >
                ➕
              </button>
              
              {canMove && allLists.length > 1 && (
                <button 
                  onClick={() => setShowMoveModal(true)}
                  className="action-btn"
                  title="Move to another list"
                >
                  ↔️
                </button>
              )}
              
              <button 
                onClick={handleDelete}
                className="action-btn action-btn-delete"
                title="Delete task"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add subtask form */}
      {showAddSubtask && (
        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
          <form onSubmit={handleCreateSubtask} className="add-item-form">
            <input
              type="text"
              placeholder="Subtask title..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-success btn-small">Add</button>
            <button 
              type="button" 
              onClick={() => setShowAddSubtask(false)}
              className="btn-secondary btn-small"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Subtasks */}
      {hasChildren && !task.collapsed && (
        <div className="subtasks" style={{ marginLeft: `${Math.min((depth + 1) * 16, 64)}px` }}>
          {task.children.map(child => (
            <div key={child.id} className="subtask-item">
              <TaskItem
                task={child}
                listId={task.list_id}
                allLists={allLists}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}

      {/* Move task modal */}
      {showMoveModal && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Move Task</h3>
            <p>Select a destination list and optional parent:</p>
            <select 
              value={selectedListId} 
              onChange={(e) => { setSelectedListId(parseInt(e.target.value)); setSelectedParentId(null); }}
            >
              {allLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} {list.id === task.list_id ? '(current)' : ''}
                </option>
              ))}
            </select>
            <div style={{ height: '0.5rem' }} />
            <select
              value={selectedParentId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedParentId(v === '' ? null : parseInt(v));
              }}
            >
              <option value="">(Top level)</option>
              {parentOptions.map((opt) => (
                (opt.id !== task.id && !forbiddenIds.has(opt.id)) && (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                )
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={handleMoveTask} className="btn-primary">
                Move
              </button>
              <button onClick={() => setShowMoveModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
