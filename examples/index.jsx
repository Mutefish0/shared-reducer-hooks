import React, { useState } from 'react';
import { render } from 'react-dom';
import SharedReducer from '../src/index';

/************************ reducer **************************/
const initialState = {
  todos: [],
  completed: [],
};

const [mapState, dispatch] = SharedReducer((state = initialState, action) => {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [...state.todos, { id: action.payload.id, title: action.payload.title }],
      };
    case 'delete':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
        completed: state.completed.filter((id) => id !== action.payload.id),
      };
    case 'complete':
      return {
        ...state,
        completed: [...state.completed, action.payload.id],
      };
    case 'revert':
      return {
        ...state,
        completed: state.completed.filter((id) => id !== action.payload.id),
      };
    default:
      return state;
  }
});

/****************************** actions ***************************/
let uuid = 1;
function addTodoAction(title) {
  dispatch({ type: 'add', payload: { id: uuid++, title } });
}
function deleteTodoAction(id) {
  dispatch({ type: 'delete', payload: { id } });
}
function completeTodoAction(id) {
  dispatch({ type: 'complete', payload: { id } });
}
function revertTodoAction(id) {
  dispatch({ type: 'revert', payload: { id } });
}
/***************************** map states ***************************/
const useExtendedTodos = mapState((state) => {
  return state.todos.map((todo) => ({ ...todo, completed: state.completed.includes(todo.id) }));
});

const useOverview = mapState((state) => {
  return {
    total: state.todos.length,
    completed: state.completed.length,
  };
});
/***************************** components ***************************/
function Overview() {
  const overview = useOverview();
  return (
    <div>
      <h2>Overview</h2>
      <p>
        Total: {overview.total}, completed: {overview.completed}
      </p>
    </div>
  );
}

function TodoItem({ todo }) {
  function onDelete() {
    deleteTodoAction(todo.id);
  }
  function onToggleCompletion() {
    if (todo.completed) {
      revertTodoAction(todo.id);
    } else {
      completeTodoAction(todo.id);
    }
  }
  return (
    <li>
      <input type="checkbox" defaultChecked={todo.completed} onChange={onToggleCompletion} />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</span>
      <button onClick={onDelete}>x</button>
    </li>
  );
}

function TodoList() {
  const todos = useExtendedTodos();
  return (
    <div>
      <h2>List</h2>
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}

function AddTodo() {
  const [title, setTitle] = useState('');
  function onSubmit() {
    addTodoAction(title);
    setTitle('');
  }
  return (
    <div>
      <h2>Add Todo</h2>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" onClick={onSubmit}>
        add
      </button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Overview />
      <TodoList />
      <AddTodo />
    </div>
  );
}

const appContainer = document.createElement('div');
document.body.appendChild(appContainer);

render(<App />, appContainer);
