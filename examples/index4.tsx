import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import SharedReducer from '../src/index';

// 嵌套+条件渲染

interface Action {
  type: 'add';
}

type State = number;

const [mapState, dispatch] = SharedReducer((state: State = 1, action: Action) => {
  switch (action.type) {
    case 'add':
      return state + 1;
    default:
      return state;
  }
});

const useCounter = mapState((x) => x);
function addCounter() {
  dispatch({ type: 'add' });
}

function CompD() {
  const counter = useCounter();
  console.log('render CompD');
  return (
    <div>
      <h2>CompD: {counter}</h2>
    </div>
  );
}

function CompB() {
  const counter = useCounter();
  console.log('render CompB');
  return (
    <div>
      <h2>CompB: {counter}</h2>
      <CompD />
    </div>
  );
}

function CompA() {
  const counter = useCounter();
  const [showB, setShowB] = useState(false);
  console.log('render CompA');
  return (
    <div>
      <h2>CompA: {counter}</h2>
      {showB && <CompB />}
      <button onClick={() => setShowB(!showB)}>toggle B</button>
    </div>
  );
}

function CompC() {
  const counter = useCounter();
  console.log('render CompC');
  return (
    <div>
      <h2>CompC: {counter}</h2>
    </div>
  );
}

function App() {
  console.log('render App');
  return (
    <div>
      <h1>App</h1>
      <CompA />
      <CompC />
      <hr />
      <button onClick={addCounter}>add</button>
    </div>
  );
}

setTimeout(addCounter, 4000);

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'app');
document.body.appendChild(appContainer);

render(<App />, appContainer);
