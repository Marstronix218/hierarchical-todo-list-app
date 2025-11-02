import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth from './components/Auth';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));
import axios from 'axios';

describe('Auth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    render(<Auth onLogin={() => {}} />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('switches to register mode', () => {
    render(<Auth onLogin={() => {}} />);
    const registerLink = screen.getByText(/register/i);
    fireEvent.click(registerLink);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockOnLogin = jest.fn();
    const mockToken = 'test-token-123';
    const mockUsername = 'testuser';

    axios.post.mockResolvedValueOnce({
      data: { token: mockToken, username: mockUsername }
    });

    render(<Auth onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: mockUsername }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/login', {
        username: mockUsername,
        password: 'password123'
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken, mockUsername);
    });
  });

  test('handles login error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    render(<Auth onLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'wronguser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const mockOnLogin = jest.fn();
    const mockToken = 'test-token-456';
    const mockUsername = 'newuser';

    axios.post.mockResolvedValueOnce({
      data: { token: mockToken, username: mockUsername }
    });

    render(<Auth onLogin={mockOnLogin} />);

    // Switch to register mode
    fireEvent.click(screen.getByText(/register/i));

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: mockUsername }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'newpass123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/register', {
        username: mockUsername,
        password: 'newpass123'
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken, mockUsername);
    });
  });

  test('handles registration error - duplicate username', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Username already exists' } }
    });

    render(<Auth onLogin={() => {}} />);

    // Switch to register mode
    fireEvent.click(screen.getByText(/register/i));

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'existinguser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });
  });

  test('requires both username and password', async () => {
    render(<Auth onLogin={() => {}} />);

    // Try to login without filling fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Should not call axios if fields are empty
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  test('clears error when switching between login and register', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    render(<Auth onLogin={() => {}} />);

    // Try to login with wrong credentials
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Switch to register - error should clear
    fireEvent.click(screen.getByText(/register/i));
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });
});
