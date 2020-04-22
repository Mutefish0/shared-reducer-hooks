import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import SharedReducer, { createSelector } from '../src/index';

interface Todos {
  counter: number;

  ids: number[];
  nameEntity: { [key: number]: string };
  completeEntity: { [key: number]: boolean };
}

interface ActionAddTodo {
  type: 'add';
  id: number;
  name: string;
}

interface Action {
  type: 'delete' | 'complete' | 'reset';
  id: number;
}

interface ActionAddCounter {
  type: 'addCounter';
}

const initialState: Todos = {
  counter: 1,

  ids: [],
  nameEntity: {},
  completeEntity: {},
};

const [mapState, dispatch] = SharedReducer(
  (state: Todos = initialState, action: Action | ActionAddTodo | ActionAddCounter) => {
    switch (action.type) {
      case 'add':
        return {
          ...state,
          ids: [...state.ids, action.id],
          nameEntity: { ...state.nameEntity, [action.id]: action.name },
        };
      case 'delete':
        return {
          ...state,
          ids: state.ids.filter((id) => id !== action.id),
        };
      case 'complete':
        return {
          ...state,
          completeEntity: { ...state.completeEntity, [action.id]: true },
        };
      case 'reset':
        return {
          ...state,
          completeEntity: { ...state.completeEntity, [action.id]: false },
        };
      case 'addCounter':
        return {
          ...state,
          counter: state.counter + 1,
        };
      default:
        return state;
    }
  }
);

// map state
// const useTodoList = mapState((state) => {
//   console.log('map!');

//   return state.ids.map((id) => ({
//     id,
//     name: state.nameEntity[id],
//     completed: state.completeEntity[id],
//   }));
// });

const useTodoList = createSelector(
  [mapState((s) => s.ids), mapState((s) => s.nameEntity), mapState((s) => s.completeEntity)],
  ([ids, nameEntity, completeEntity]) => {
    return ids.map((id) => ({
      id,
      name: nameEntity[id],
      completed: completeEntity[id],
    }));
  }
);

const useCounter = mapState((state) => {
  return state.counter;
});
// actions
let uniqueId = 1;
function addTodo() {
  const id = uniqueId++;
  dispatch({ type: 'add', id, name: `todo#${id}` });
}
function deleteTodo(id: number) {
  dispatch({ type: 'delete', id });
}
function completeTodo(id: number) {
  dispatch({ type: 'complete', id });
}
function resetTodo(id: number) {
  dispatch({ type: 'reset', id });
}
function addTodoCounter() {
  dispatch({ type: 'addCounter' });
}

function App() {
  const todoList = useTodoList();
  const counter = useCounter();

  useEffect(() => {
    console.log('todo list Changed!');
  }, [todoList]);

  function onToggleTodo(todo: { id: number; completed: boolean }) {
    if (!todo.completed) {
      completeTodo(todo.id);
    } else {
      resetTodo(todo.id);
    }
  }

  return (
    <div>
      Counter: {counter} <button onClick={addTodoCounter}>add counter</button>
      <hr />
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            <input
              type="checkbox"
              defaultChecked={todo.completed}
              onChange={() => onToggleTodo(todo)}
            />
            {todo.name} <button onClick={() => deleteTodo(todo.id)}>x</button>
          </li>
        ))}
      </ul>
      <button onClick={addTodo}>Add Todo</button>
    </div>
  );
}

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'app');
document.body.appendChild(appContainer);

render(<App />, appContainer);
