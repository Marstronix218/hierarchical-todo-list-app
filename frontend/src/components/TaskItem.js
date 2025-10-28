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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

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
   * Move task to a different list (only for top-level tasks)
   */
  const handleMoveTask = async () => {
    if (selectedListId === task.list_id) {
      setShowMoveModal(false);
      return;
    }

    try {
      await axios.put(`/api/tasks/${task.id}/move`, {
        list_id: selectedListId
      });
      setShowMoveModal(false);
      // Refresh both the old and new lists
      onRefresh(task.list_id);
      onRefresh(selectedListId);
    } catch (error) {
      console.error('Error moving task:', error);
      alert(error.response?.data?.error || 'Failed to move task');
    }
  };

  const hasChildren = task.children && task.children.length > 0;
  const canMove = !task.parent_id; // Only top-level tasks can be moved

  return (
    <div className="task-item">
      <div className={`task-content ${task.completed ? 'completed' : ''}`}>
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
        />
        
        {isEditing ? (
          <form onSubmit={handleEditTask} style={{ flex: 1, display: 'flex', gap: '0.3rem' }}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              style={{ flex: 1, padding: '0.3rem', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn-success btn-small">
              Save
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary btn-small">
              Cancel
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

        <div className="task-buttons">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-primary btn-small"
            >
              Edit
            </button>
          )}
          
          {hasChildren && (
            <button 
              onClick={handleToggleCollapse}
              className="collapse-btn btn-small"
            >
              {task.collapsed ? '▶' : '▼'}
            </button>
          )}
          
          {depth < 2 && (
            <button 
              onClick={() => setShowAddSubtask(!showAddSubtask)}
              className="add-subtask-btn btn-small"
            >
              +Sub
            </button>
          )}
          
          {canMove && allLists.length > 1 && (
            <button 
              onClick={() => setShowMoveModal(true)}
              className="btn-primary btn-small"
            >
              Move
            </button>
          )}
          
          <button 
            onClick={handleDelete}
            className="btn-danger btn-small"
          >
            Delete
          </button>
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
        <div className="subtasks">
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
            <p>Select a list to move this task to:</p>
            <select 
              value={selectedListId} 
              onChange={(e) => setSelectedListId(parseInt(e.target.value))}
            >
              {allLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} {list.id === task.list_id ? '(current)' : ''}
                </option>
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
