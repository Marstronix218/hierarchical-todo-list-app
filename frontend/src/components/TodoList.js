/**
 * TodoList Component
 * Displays a single list with all its tasks
 */

import React, { useState } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

function TodoList({ list, allLists, onDelete, onRefresh }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
