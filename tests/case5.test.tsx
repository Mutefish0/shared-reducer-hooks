import React, { useState } from 'react';
import SharedReducer from '../src/index';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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
let initialShowA = true;
let initialShowB = true;
let toggleA;
let toggleB;

function A() {
  const counter = useCounter();
  const [showB, setShowB] = useState(initialShowB);
  toggleB = setShowB;
  renderingLogs.push({ component: 'A', counter });

  return <div>{showB && <B />}</div>;
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
            | ?                     |  
            |                       |  
            v                       v  
          +---+                   +---+
          | A |                   | C |
          +---+                   +---+
            |
            | ?                         
            |                          
            v                         
          +---+                        
          | B |                       
          +---+                        
*/

function App() {
  const [showA, setShowA] = useState(initialShowA);
  toggleA = setShowA;
  return (
    <div>
      {showA && <A />}
      <C />
    </div>
  );
}

describe('conditional rendering in nested componnets', () => {
  test('toggle component B, initial show component B', () => {
    initialShowA = true;
    initialShowB = true;
    render(<App />);

    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 2 },
      { component: 'B', counter: 2 },
      { component: 'C', counter: 2 },
    ]);

    act(() => toggleB(false));
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 3 },
      { component: 'C', counter: 3 },
    ]);

    act(() => toggleB(true));
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 4 },
      { component: 'B', counter: 4 },
      { component: 'C', counter: 4 },
    ]);
  });

  test('toggle component B, initial not show component B', () => {
    initialShowA = true;
    initialShowB = false;
    render(<App />);

    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 5 },
      { component: 'C', counter: 5 },
    ]);

    act(() => toggleB(true));
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 6 },
      { component: 'B', counter: 6 },
      { component: 'C', counter: 6 },
    ]);
  });

  test('toggle component A, initial show component A', () => {
    initialShowA = true;
    initialShowB = true;
    render(<App />);

    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'A', counter: 7 },
      { component: 'B', counter: 7 },
      { component: 'C', counter: 7 },
    ]);

    act(() => toggleA(false));
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([{ component: 'C', counter: 8 }]);

    act(() => toggleA(true));

    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'C', counter: 9 },
      { component: 'A', counter: 9 },
      { component: 'B', counter: 9 },
    ]);
  });

  test('toggle component A, initial not show component A', () => {
    initialShowA = false;
    initialShowB = true;
    render(<App />);

    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([{ component: 'C', counter: 10 }]);

    act(() => toggleA(true));
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'C', counter: 11 },
      { component: 'A', counter: 11 },
      { component: 'B', counter: 11 },
    ]);
  });
});
