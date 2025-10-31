/**
 * TodoApp Component
 * Main application component that displays all lists and handles list operations
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoList from './TodoList';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

function TodoApp({ token, user, onLogout }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Set up axios default headers
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  /**
   * Fetch all lists from the API
   */
  const fetchLists = async () => {
    try {
      const response = await axios.get('/api/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
      if (error.response?.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch lists on component mount
  useEffect(() => {
    fetchLists();
  }, []);

  /**
   * Create a new list
   */
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await axios.post('/api/lists', {
        name: newListName
      });
      setLists([...lists, response.data]);
      setNewListName('');
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    }
  };

  /**
   * Delete a list
   */
  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      await axios.delete(`/api/lists/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list');
    }
  };

  /**
   * Refresh a specific list
   */
  const handleRefreshList = async (listId) => {
    try {
      const response = await axios.get('/api/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error refreshing list:', error);
    }
  };

  /**
   * Handle drag end - supports moving tasks within and between lists
   */
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      return;
    }

    // Find which list and task is being dragged
    let sourceListId = null;
    let draggedTask = null;
    
    for (const list of lists) {
      const task = findTaskById(list.tasks, active.id);
      if (task) {
        sourceListId = list.id;
        draggedTask = task;
        break;
      }
    }

    if (!draggedTask) {
      console.error('Could not find dragged task');
      return;
    }

    // Determine target list, parent, and position
    let targetListId = null;
    let targetParentId = null;
    let targetPosition = 0;

    // Parse the drop target
    const overIdStr = over.id.toString();
    
    if (overIdStr.includes('-dropzone-')) {
      // Dropping on a drop zone: format is "list-{listId}-{parentId or 'root'}-dropzone-{position}"
      const match = overIdStr.match(/^list-(\d+)-(root|\d+)-dropzone-(\d+)$/);
      if (match) {
        targetListId = parseInt(match[1]);
        targetParentId = match[2] === 'root' ? null : parseInt(match[2]);
        targetPosition = parseInt(match[3]);
      } else {
        console.error('Could not parse drop zone ID:', overIdStr);
        return;
      }
    } else {
      // Dropping on a task - make it a child
      targetParentId = over.id;
      for (const list of lists) {
        const targetTask = findTaskById(list.tasks, over.id);
        if (targetTask) {
          targetListId = list.id;
          targetPosition = targetTask.children ? targetTask.children.length : 0;
          break;
        }
      }
    }

    if (!targetListId) {
      console.error('Could not determine target list');
      return;
    }

    try {
      await axios.put(`/api/tasks/${active.id}/move`, {
        list_id: targetListId,
        parent_id: targetParentId,
        position: targetPosition
      });
      
      // Refresh affected lists
      handleRefreshList(sourceListId);
      if (targetListId !== sourceListId) {
        handleRefreshList(targetListId);
      }
    } catch (error) {
      console.error('Error moving task:', error);
      alert(error.response?.data?.error || 'Failed to move task');
    }
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

  if (loading) {
    return (
      <div>
        <header className="app-header">
          <h1>Hierarchical Todo List</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={onLogout} className="btn-secondary">Logout</button>
          </div>
        </header>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <header className="app-header">
        <h1>Hierarchical Todo List</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="container">
        <div className="new-list-section">
          <input
            type="text"
            placeholder="New list name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button onClick={handleCreateList} className="btn-success">
            Create List
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <h3>No lists yet</h3>
            <p>Create your first list to get started!</p>
          </div>
        ) : (
          <div className="lists-container">
            <DndContext 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              {lists.map(list => (
                <TodoList
                  key={list.id}
                  list={list}
                  allLists={lists}
                  onDelete={handleDeleteList}
                  onRefresh={handleRefreshList}
                />
              ))}
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
