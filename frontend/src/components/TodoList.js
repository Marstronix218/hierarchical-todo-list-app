/**
 * TodoList Component
 * Displays a single list with all its tasks
 */

import React, { useState } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

function TodoList({ list, allLists, onDelete, onRefresh }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDropActive, setIsDropActive] = useState(false);

  /**
   * Create a new top-level task
   */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await axios.post('/api/tasks', {
        title: newTaskTitle,
        list_id: list.id
      });
      setNewTaskTitle('');
      onRefresh(list.id);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  return (
    <div className="list-card">
      <div className="list-header">
        <h3>{list.name}</h3>
        <div className="list-actions">
          <button 
            onClick={() => onDelete(list.id)} 
            className="btn-danger btn-small"
          >
            Delete List
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateTask} className="add-item-form">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="btn-success">Add</button>
      </form>

      {/* Top-level drop zone to move tasks here */}
      <div
        className={`list-drop-zone ${isDropActive ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropActive(true);
        }}
        onDragLeave={() => setIsDropActive(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDropActive(false);
          let payload = null;
          try {
            payload = JSON.parse(e.dataTransfer.getData('application/json'));
          } catch (err) {
            return;
          }
          if (!payload || !payload.taskId) return;
          try {
            await axios.put(`/api/tasks/${payload.taskId}/move`, {
              list_id: list.id,
              parent_id: null
            });
            onRefresh(list.id);
            if (payload.listId && payload.listId !== list.id) {
              onRefresh(payload.listId);
            }
          } catch (error) {
            console.error('Error moving to top-level via DnD:', error);
            alert(error.response?.data?.error || 'Failed to move task');
          }
        }}
        title="Drop here to move task to top level"
        style={{ marginBottom: '0.5rem' }}
      >
        Drop here to move to top level
      </div>

      <div className="tasks-container">
        {list.tasks && list.tasks.length > 0 ? (
          list.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              listId={list.id}
              allLists={allLists}
              onRefresh={onRefresh}
              depth={0}
            />
          ))
        ) : (
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem', padding: '1rem' }}>
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;
