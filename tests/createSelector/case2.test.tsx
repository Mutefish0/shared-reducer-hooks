import React from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';

import '../suppressWarn';

interface State {
  counterA: number;
  counterB: number;
  counterC: number;
}

interface Action {
  type: 'incareseA' | 'incareseB' | 'incareseC';
}

const initialState: State = { counterA: 0, counterB: 0, counterC: 0 };

const [mapState, dispatch] = SharedReducer((state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'incareseA':
      return { ...state, counterA: state.counterA + 1 };
    case 'incareseB':
      return { ...state, counterB: state.counterB + 1 };
    case 'incareseC':
      return { ...state, counterC: state.counterC + 1 };
    default:
      return state;
  }
});

let mappingLogs = [];

const useCounterA = mapState((x) => {
  mappingLogs.push({ mapper: 'counterA' });
  return x.counterA;
});
const useCounterB = mapState((x) => {
  mappingLogs.push({ mapper: 'counterB' });
  return x.counterB;
});
const useCounterC = mapState((x) => {
  mappingLogs.push({ mapper: 'counterC' });
  return x.counterC;
});
const useCounterAB = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  mappingLogs.push({ mapper: 'counterA + counterB' });
  return counterA + counterB;
});
const useCounterAB_C = createSelector([useCounterAB, useCounterC], ([counterAB, counterC]) => {
  mappingLogs.push({ mapper: 'counterAB + counterC' });
  return counterAB + counterC;
});

function incareseCounterA() {
  dispatch({ type: 'incareseA' });
}
function incareseCounterB() {
  dispatch({ type: 'incareseB' });
}
function incareseCounterC() {
  dispatch({ type: 'incareseC' });
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
  const counterC = useCounterC();
  renderingLogs.push({ component: 'C', counterC });
  return <div></div>;
}
function AB() {
  const counterAB = useCounterAB();
  renderingLogs.push({ component: 'AB', counterAB });
  return <div></div>;
}
function AB_C() {
  const counterAB_C = useCounterAB_C();
  renderingLogs.push({ component: 'AB_C', counterAB_C });
  return <div></div>;
}

function App() {
  return (
    <div>
      <A />
      <B />
      <C />
      <AB />
      <AB_C />
    </div>
  );
}

describe('nested selector', () => {
  test('works fine', () => {
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 0 },
      { component: 'B', counterB: 0 },
      { component: 'C', counterC: 0 },
      { component: 'AB', counterAB: 0 },
      { component: 'AB_C', counterAB_C: 0 },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterA();
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 1 },
      { component: 'AB', counterAB: 1 },
      { component: 'AB_C', counterAB_C: 1 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterA + counterB' },
      { mapper: 'counterAB + counterC' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterB();
    expect(renderingLogs).toEqual([
      { component: 'B', counterB: 1 },
      { component: 'AB', counterAB: 2 },
      { component: 'AB_C', counterAB_C: 2 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterA + counterB' },
      { mapper: 'counterAB + counterC' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterC();
    expect(renderingLogs).toEqual([
      { component: 'C', counterC: 1 },
      { component: 'AB_C', counterAB_C: 3 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterAB + counterC' },
    ]);
  });
});
