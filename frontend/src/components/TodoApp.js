/**
 * TodoApp Component
 * Main application component that displays all lists and handles list operations
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoList from './TodoList';

function TodoApp({ token, user, onLogout }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);

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
            {lists.map(list => (
              <TodoList
                key={list.id}
                list={list}
                allLists={lists}
                onDelete={handleDeleteList}
                onRefresh={handleRefreshList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
