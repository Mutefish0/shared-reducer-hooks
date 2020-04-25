import React from 'react';
import SharedReducer from '../src/index';
import { render } from '@testing-library/react';

import './suppressWarn';

type State = number;
interface Action {
  type: 'increase';
}

const [mapState, dispatch] = SharedReducer((state: State = 1, action: Action) => {
  switch (action.type) {
    case 'increase':
      return state + 1;
    default:
      return state;
  }
});

const useCounter = mapState((x) => x);

function increaseCounter() {
  dispatch({ type: 'increase' });
}

let renderingLogs = [];

function A() {
  const counter = useCounter();
  renderingLogs.push({ component: 'A', counter });
  return (
    <div>
      <B />
    </div>
  );
}

function B() {
  const counter = useCounter();
  renderingLogs.push({ component: 'B', counter });
  return <div></div>;
}

function C() {
  const counter = useCounter();
  renderingLogs.push({ component: 'C', counter });
  return <div></div>;
}

/*
                      +---+            
            +-------- |App|---------+  
            |         +---+         |  
            |                       |  
            |                       |  
            v                       v  
          +---+                   +---+
          | A |                   | C |
          +---+                   +---+
            |                          
            |                          
            v                          
          +---+                        
          | B |                        
          +---+                        
*/
function App() {
  return (
    <div>
      <A />
      <C />
    </div>
  );
}

describe('nested components', () => {
  test('updates in the same path should be merged', () => {
    render(<App />);
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toHaveLength(3);
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 2 },
      { component: 'B', counter: 2 },
      { component: 'C', counter: 2 },
    ]);
  });
});
