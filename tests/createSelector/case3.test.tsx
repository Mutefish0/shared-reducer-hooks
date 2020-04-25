import React from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';

import '../suppressWarn';

interface StateA {
  counterA: number;
}

interface ActionA {
  type: 'incareseA';
}

const initialStateA: StateA = { counterA: 0 };

const [mapStateA, dispatchA] = SharedReducer((state: StateA = initialStateA, action: ActionA) => {
  switch (action.type) {
    case 'incareseA':
      return { ...state, counterA: state.counterA + 1 };
    default:
      return state;
  }
});

const useCounterA = mapStateA((x) => x.counterA);
function incareseCounterA() {
  dispatchA({ type: 'incareseA' });
}

/* another reducer */

interface StateB {
  counterB: number;
}

interface ActionB {
  type: 'incareseB';
}

const initialStateB: StateB = { counterB: 0 };

const [mapStateB, dispatchB] = SharedReducer((state: StateB = initialStateB, action: ActionB) => {
  switch (action.type) {
    case 'incareseB':
      return { ...state, counterB: state.counterB + 1 };
    default:
      return state;
  }
});

const useCounterB = mapStateB((x) => x.counterB);
function incareseCounterB() {
  dispatchB({ type: 'incareseB' });
}

/** mix togather */
const useCounterC = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  return counterA + counterB;
});

let renderingLogs = [];

function A() {
  const counterA = useCounterA();
  renderingLogs.push({ component: 'A', counterA });
  return <div></div>;
}
function B() {
  const counterB = useCounterB();
  renderingLogs.push({ component: 'B', counterB });
  return <div></div>;
}
function C() {
  const counterC = useCounterC();
  renderingLogs.push({ component: 'C', counterC });
  return <div></div>;
}

function App() {
  return (
    <div>
      <A />
      <B />
      <C />
    </div>
  );
}

describe('createSelector from two individul reducers', () => {
  test('works fine', () => {
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 0 },
      { component: 'B', counterB: 0 },
      { component: 'C', counterC: 0 },
    ]);

    renderingLogs = [];
    incareseCounterA();
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 1 },
      { component: 'C', counterC: 1 },
    ]);

    renderingLogs = [];
    incareseCounterB();
    expect(renderingLogs).toEqual([
      { component: 'B', counterB: 1 },
      { component: 'C', counterC: 2 },
    ]);
  });
});
