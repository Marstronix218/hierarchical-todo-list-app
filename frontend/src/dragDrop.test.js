import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './components/TodoList';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn()
}));
import axios from 'axios';

const noop = () => {};

function makeList() {
  return {
    id: 1,
    name: 'List A',
    tasks: [
      {
        id: 10,
        title: 'Parent',
        completed: false,
        collapsed: false,
        list_id: 1,
        parent_id: null,
        children: [
          {
            id: 11,
            title: 'Child',
            completed: false,
            collapsed: false,
            list_id: 1,
            parent_id: 10,
            children: []
          }
        ]
      }
    ]
  };
}

// Basic DataTransfer mock for drag-n-drop
function createDataTransfer() {
  const store = {};
  return {
    setData: (type, val) => (store[type] = String(val)),
    getData: (type) => store[type] || '',
    effectAllowed: 'move',
    dropEffect: 'move',
    items: [],
    types: []
  };
}

test('drag child to top-level drop zone triggers move API', async () => {
  const list = makeList();
  render(
    <TodoList list={list} allLists={[list]} onDelete={noop} onRefresh={noop} />
  );

  const childEl = screen.getByText('Child');
  const dropZone = screen.getByText(/Drop here to move to top level/i);

  const dataTransfer = createDataTransfer();
  // simulate dragging the child
  fireEvent.dragStart(childEl.closest('.task-item'), {
    dataTransfer
  });
  // the component sets application/json
  dataTransfer.setData(
    'application/json',
    JSON.stringify({ taskId: 11, listId: 1 })
  );

  fireEvent.dragOver(dropZone, { dataTransfer });
  fireEvent.drop(dropZone, { dataTransfer });

  // Expect axios.put called with parent_id null and list_id 1 for task 11
  expect(axios.put).toHaveBeenCalled();
  const [[url, payload]] = axios.put.mock.calls;
  expect(url).toMatch(/\/api\/tasks\/11\/move$/);
  expect(payload).toEqual({ list_id: 1, parent_id: null });
});
