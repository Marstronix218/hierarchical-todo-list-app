/**
 * TodoList Component
 * Displays a single list with all its tasks
 */

import React, { useState } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function TodoList({ list, allLists, onDelete, onRefresh }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  // Remove isDropActive, not needed with dnd-kit

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

  // dnd-kit move handler for this list (now handled at TodoApp level, but keep for backwards compat)
  const handleDragEnd = async (event) => {
    // This is now handled by TodoApp's global DndContext
    // Keeping this stub for potential list-specific logic
  };

  // Helper to find a task by ID in the tree
  const findTaskById = (tasks, id) => {
    for (const task of tasks || []) {
      if (task.id === id) return task;
      if (task.children) {
        const found = findTaskById(task.children, id);
        if (found) return found;
      }
    }
    return null;
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

      <SortableContext
        items={list.tasks ? list.tasks.map((t) => t.id) : []}
        strategy={verticalListSortingStrategy}
      >
        <div className="tasks-container">
          {list.tasks && list.tasks.length > 0 ? (
            list.tasks.map((task, idx) => (
              <TaskItem
                key={task.id}
                task={task}
                listId={list.id}
                allLists={allLists}
                onRefresh={onRefresh}
                depth={0}
                parentId={null}
                index={idx}
              />
            ))
          ) : (
            <div style={{ color: '#7f8c8d', fontSize: '0.9rem', padding: '1rem' }}>
              No tasks yet. Add one above!
            </div>
          )}
          {/* Drop zone at end of top-level tasks */}
          <TopLevelDropZone listId={list.id} taskCount={list.tasks ? list.tasks.length : 0} />
        </div>
      </SortableContext>
    </div>
  );
}

// Drop zone component for end of top-level tasks
function TopLevelDropZone({ listId, taskCount }) {
  const dropZoneId = `list-${listId}-root-dropzone-${taskCount}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropZoneId });
  return (
    <div
      ref={setNodeRef}
      className="drop-indicator"
      style={{
        height: '10px',
        background: isOver ? '#3498db' : 'transparent',
        margin: '2px 0',
        borderRadius: '4px',
        transition: 'background 0.15s',
      }}
    />
  );
}

export default TodoList;
