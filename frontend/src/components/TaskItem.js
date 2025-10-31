/**
 * TaskItem Component
 * Displays a single task with its subtasks (recursive component)
 */


import React, { useState } from 'react';
import axios from 'axios';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TaskItem({ task, listId, allLists, onRefresh, depth, parentId, index }) {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  // dnd-kit state
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

  const hasChildren = task.children && task.children.length > 0;

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: task.id });

  // dnd-kit droppable for drop indicator between tasks
  const dropZoneId = `list-${listId}-${parentId || 'root'}-dropzone-${index}`;
  const { setNodeRef: setDropZoneRef, isOver: isDropZoneOver } = useDroppable({ id: dropZoneId });

  // Style for draggable
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Drop zone before this task */}
      <div
        ref={setDropZoneRef}
        className="drop-indicator"
        style={{
          height: '10px',
          background: isDropZoneOver ? '#3498db' : 'transparent',
          margin: '2px 0',
          borderRadius: '4px',
          transition: 'background 0.15s',
        }}
      />
      <div
        ref={setNodeRef}
        className={`task-item${isDragging ? ' dragging' : ''}`}
        style={style}
      >
        <div className={`task-content ${task.completed ? 'completed' : ''}`}>
        {/* Drag handle - separate from interactive elements */}
        <div {...attributes} {...listeners} className="drag-handle" title="Drag to reorder">
          ⋮⋮
        </div>
        
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
    </div>

    {/* Subtasks with dnd-kit context */}
    {hasChildren && !task.collapsed && (
      <SortableContext
        items={task.children.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="subtasks" style={{ marginLeft: `${Math.min((depth + 1) * 16, 64)}px` }}>
          {task.children.map((child, idx) => (
            <TaskItem
              key={child.id}
              task={child}
              listId={task.list_id}
              allLists={allLists}
              onRefresh={onRefresh}
              depth={depth + 1}
              parentId={task.id}
              index={idx}
            />
          ))}
          {/* Drop zone at end of children */}
          <DropZoneAfterChildren
            listId={listId}
            parentId={task.id}
            index={task.children.length}
          />
        </div>
      </SortableContext>
    )}
  </div>
  );
}



// Drop zone after all children (for dropping at end)
function DropZoneAfterChildren({ listId, parentId, index }) {
  const dropZoneId = `list-${listId}-${parentId || 'root'}-dropzone-${index}`;
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

export default TaskItem;
