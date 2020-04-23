import React, { useState } from 'react';
import { render } from 'react-dom';
import SharedReducer from '../src/index';

interface Counter {
  counterA: number;
  counterB: number;
}

const initialState: Counter = {
  counterA: 0,
  counterB: 0,
};

interface Action {
  type: 'addA' | 'addB';
}

// reducer
const [mapState, dispatch] = SharedReducer((state: Counter = initialState, action: Action) => {
  switch (action.type) {
    case 'addA':
      return { ...state, counterA: state.counterA + 1 };
    case 'addB':
      return { ...state, counterB: state.counterB + 1 };
    default:
      return state;
  }
});

//const useCounterA = mapState.counterA;

// states
const useCounterA = mapState((state) => {
  return state.counterA;
});

const useCounterB = mapState((state) => {
  return state.counterB;
});

const useCounterC = mapState((state) => {
  return state.counterA + state.counterB;
});

// actions
const addCounterA = () => dispatch({ type: 'addA' });
const addCounterB = () => dispatch({ type: 'addB' });

// components
function CounterA() {
  console.log('render A');
  const counterA = useCounterA();
  return (
    <div>
      <h2>CounterA {counterA}</h2>
    </div>
  );
}

function CounterB() {
  console.log('render B');
  const counterB = useCounterB();
  return (
    <div>
      <h2>CounterB {counterB}</h2>
    </div>
  );
}

function CounterC() {
  console.log('render C');
  const counterC = useCounterC();
  return (
    <div>
      <h2>CounterC {counterC}</h2>
    </div>
  );
}

function Panel() {
  console.log('render Panel');
  const counterA = useCounterA();
  const counterB = useCounterB();
  const counterC = useCounterC();
  return (
    <div>
      <h2>Panel</h2>
      <p>CounterA: {counterA}</p>
      <button onClick={addCounterA}>add counterA</button>
      <p>CounterB: {counterB}</p>
      <button onClick={addCounterB}>add counterB</button>
      <p>CounterC: {counterC}</p>
    </div>
  );
}

function App() {
  console.log('render App');
  return (
    <div>
      <Panel />
      <CounterA />
      <CounterB />
      <CounterC />
    </div>
  );
}

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'app');
document.body.appendChild(appContainer);

setInterval(addCounterA, 4000);

render(<App />, appContainer);
