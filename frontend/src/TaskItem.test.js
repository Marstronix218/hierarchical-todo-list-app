import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock axios to avoid ESM transform issues and network calls in tests
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

import TaskItem from './components/TaskItem';

const noop = () => {};

function makeTree(depth) {
  let node = { id: 1, title: 'Level 1', completed: false, collapsed: false, list_id: 1, parent_id: null, children: [] };
  let curr = node;
  for (let i = 2; i <= depth; i++) {
    const child = { id: i, title: `Level ${i}`, completed: false, collapsed: false, list_id: 1, parent_id: i - 1, children: [] };
    curr.children = [child];
    curr = child;
  }
  return node;
}

test('renders 5-level nested tasks with all text visible', () => {
  const tree = makeTree(5);
  render(
    <TaskItem
      task={tree}
      listId={1}
      allLists={[{ id: 1, name: 'List', tasks: [tree] }]}
      onRefresh={noop}
      depth={0}
    />
  );

  // Assert that each level title is in the document
  for (let i = 1; i <= 5; i++) {
    expect(screen.getByText(`Level ${i}`)).toBeInTheDocument();
  }
});
