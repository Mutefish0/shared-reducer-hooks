# shared-reducer-hooks

A light weight, easy to use, Redux like library leveraged by React-Hooks

## Install

`$ npm install shared-reducer-hooks`

## Usage

Let's create a simple todo list demo

### Create a store

```js
import SharedReducer from 'shared-reducer-hooks';

const initialState = {
  todos: [],
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
      };
    default:
      return state;
  }
});
```

### Actions and states

```js
let uuid = 1;

function addTodoAction(title) {
  dispatch({ type: 'add', payload: { id: uuid++, title } });
}

function deleteTodoAction(id) {
  dispatch({ type: 'delete', payload: { id } });
}

const useTodos = mapState((state) => state.todos);

const useOverview = mapState((state) => {
  const total = state.todos.length;
  const current = total > 0 ? state.todos[0].title : 'none';
  return {
    total,
    current,
  };
});
```

### Components

```jsx
function Overview() {
  const overview = useOverview();
  return (
    <div>
      <h2>Overview</h2>
      <p>
        total: {overview.total}, current: {overview.current}
      </p>
    </div>
  );
}

function TodoList() {
  const todos = useTodos();

  function onDelete(id) {
    deleteTodoAction(id);
  }

  return (
    <div>
      <h2>List</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title} <button onClick={() => onDelete(todo.id)}>x</button>
          </li>
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
```

### Snapshot
![todos](https://raw.githubusercontent.com/Mutefish0/shared-reducer-hooks/master/examples/snapshot.gif)
