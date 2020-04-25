import React from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';

import '../suppressWarn';

interface State {
  counterA: number;
  counterB: number;
}

interface Action {
  type: 'incareseA' | 'incareseB';
}

const initialState: State = { counterA: 0, counterB: 0 };

const [mapState, dispatch] = SharedReducer((state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'incareseA':
      return { ...state, counterA: state.counterA + 1 };
    case 'incareseB':
      return { ...state, counterB: state.counterB + 1 };
    default:
      return state;
  }
});

const useCounterA = mapState((x) => x.counterA);
const useCounterB = mapState((x) => x.counterB);
const useCounterTotal = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  return counterA + counterB;
});

function incareseCounterA() {
  dispatch({ type: 'incareseA' });
}
function incareseCounterB() {
  dispatch({ type: 'incareseB' });
}

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
  const counterC = useCounterTotal();
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

describe('3 sibling components', () => {
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
