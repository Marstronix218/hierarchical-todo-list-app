import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoApp from './components/TodoApp';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));
import axios from 'axios';

describe('TodoApp Component', () => {
  const mockToken = 'test-token';
  const mockUsername = 'testuser';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders username and logout button', () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('loads lists on mount', async () => {
    const mockLists = [
      { id: 1, name: 'Work', tasks: [] },
      { id: 2, name: 'Personal', tasks: [] }
    ];

    axios.get.mockResolvedValue({ data: mockLists });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/lists', {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });
  });

  test('creates a new list', async () => {
    const mockNewList = { id: 3, name: 'New List', tasks: [] };

    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: mockNewList });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    const input = screen.getByPlaceholderText(/new list name/i);
    const createButton = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'New List' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/lists',
        { name: 'New List' },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
  });

  test('displays empty state when no lists', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/create your first list/i)).toBeInTheDocument();
    });
  });

  test('handles logout', () => {
    const mockOnLogout = jest.fn();
    axios.get.mockResolvedValue({ data: [] });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('displays error message on failed load', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/error.*load/i)).toBeInTheDocument();
    });
  });

  test('prevents creating list with empty name', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    const createButton = screen.getByRole('button', { name: /create list/i });
    fireEvent.click(createButton);

    // Should not call axios.post
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('clears input after creating list', async () => {
    const mockNewList = { id: 1, name: 'New List', tasks: [] };

    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: mockNewList });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    const input = screen.getByPlaceholderText(/new list name/i);
    const createButton = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'New List' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  test('refreshes lists after operations', async () => {
    const initialLists = [{ id: 1, name: 'List 1', tasks: [] }];
    const updatedLists = [
      { id: 1, name: 'List 1', tasks: [] },
      { id: 2, name: 'List 2', tasks: [] }
    ];

    axios.get
      .mockResolvedValueOnce({ data: initialLists })
      .mockResolvedValueOnce({ data: updatedLists });

    axios.post.mockResolvedValue({ data: { id: 2, name: 'List 2', tasks: [] } });

    render(<TodoApp token={mockToken} username={mockUsername} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('List 1')).toBeInTheDocument();
    });

    // Create a new list
    const input = screen.getByPlaceholderText(/new list name/i);
    const createButton = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'List 2' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });
  });
});
