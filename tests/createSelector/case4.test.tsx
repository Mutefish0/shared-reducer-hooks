import React from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';

import '../suppressWarn';

interface State {
  counterA: number;
  counterB: number;
  counterC: number;
  counterD: number;
}

interface Action {
  type: 'incareseA' | 'incareseB' | 'incareseC' | 'incareseD';
}

const initialState: State = { counterA: 0, counterB: 0, counterC: 0, counterD: 0 };

const [mapState, dispatch] = SharedReducer((state: State = initialState, action: Action) => {
  switch (action.type) {
    case 'incareseA':
      return { ...state, counterA: state.counterA + 1 };
    case 'incareseB':
      return { ...state, counterB: state.counterB + 1 };
    case 'incareseC':
      return { ...state, counterC: state.counterC + 1 };
    case 'incareseD':
      return { ...state, counterD: state.counterD + 1 };
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
const useCounterD = mapState((x) => {
  mappingLogs.push({ mapper: 'counterD' });
  return x.counterD;
});

const useCounterAB = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  mappingLogs.push({ mapper: 'counterA + counterB' });
  return counterA + counterB;
});

const useCounterAB_C = createSelector([useCounterAB, useCounterC], ([counterAB, counterC]) => {
  mappingLogs.push({ mapper: 'counterAB + counterC' });
  return counterAB + counterC;
});

const useCounterAB_D = createSelector([useCounterAB, useCounterD], ([counterAB, counterD]) => {
  mappingLogs.push({ mapper: 'counterAB + counterD' });
  return counterAB + counterD;
});

const useCounterAB_C__AB_D = createSelector(
  [useCounterAB_C, useCounterAB_D],
  ([counterAB_C, counterAB_D]) => {
    mappingLogs.push({ mapper: 'counterAB_C + counterAB_D' });
    return counterAB_C + counterAB_D;
  }
);

function incareseCounterA() {
  dispatch({ type: 'incareseA' });
}
function incareseCounterB() {
  dispatch({ type: 'incareseB' });
}
function incareseCounterC() {
  dispatch({ type: 'incareseC' });
}
function incareseCounterD() {
  dispatch({ type: 'incareseD' });
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
function D() {
  const counterD = useCounterD();
  renderingLogs.push({ component: 'D', counterD });
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
function AB_D() {
  const counterAB_D = useCounterAB_D();
  renderingLogs.push({ component: 'AB_D', counterAB_D });
  return <div></div>;
}

function AB_C__AB_D() {
  const counterAB_C__AB_D = useCounterAB_C__AB_D();
  renderingLogs.push({ component: 'AB_C__AB_D', counterAB_C__AB_D });
  return <div></div>;
}

function App() {
  return (
    <div>
      <A />
      <B />
      <C />
      <D />
      <AB />
      <AB_C />
      <AB_D />
      <AB_C__AB_D />
    </div>
  );
}

describe('nested nested selector', () => {
  test('works fine', () => {
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 0 },
      { component: 'B', counterB: 0 },
      { component: 'C', counterC: 0 },
      { component: 'D', counterD: 0 },
      { component: 'AB', counterAB: 0 },
      { component: 'AB_C', counterAB_C: 0 },
      { component: 'AB_D', counterAB_D: 0 },
      { component: 'AB_C__AB_D', counterAB_C__AB_D: 0 },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterA();
    expect(renderingLogs).toEqual([
      { component: 'A', counterA: 1 },
      { component: 'AB', counterAB: 1 },
      { component: 'AB_C', counterAB_C: 1 },
      { component: 'AB_D', counterAB_D: 1 },
      { component: 'AB_C__AB_D', counterAB_C__AB_D: 2 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterD' },
      { mapper: 'counterA + counterB' },
      { mapper: 'counterAB + counterC' },
      { mapper: 'counterAB + counterD' },
      { mapper: 'counterAB_C + counterAB_D' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterB();
    expect(renderingLogs).toEqual([
      { component: 'B', counterB: 1 },
      { component: 'AB', counterAB: 2 },
      { component: 'AB_C', counterAB_C: 2 },
      { component: 'AB_D', counterAB_D: 2 },
      { component: 'AB_C__AB_D', counterAB_C__AB_D: 4 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterD' },
      { mapper: 'counterA + counterB' },
      { mapper: 'counterAB + counterC' },
      { mapper: 'counterAB + counterD' },
      { mapper: 'counterAB_C + counterAB_D' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterC();
    expect(renderingLogs).toEqual([
      { component: 'C', counterC: 1 },
      { component: 'AB_C', counterAB_C: 3 },
      { component: 'AB_C__AB_D', counterAB_C__AB_D: 5 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterD' },
      { mapper: 'counterAB + counterC' },
      { mapper: 'counterAB_C + counterAB_D' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    incareseCounterD();
    expect(renderingLogs).toEqual([
      { component: 'D', counterD: 1 },
      { component: 'AB_D', counterAB_D: 3 },
      { component: 'AB_C__AB_D', counterAB_C__AB_D: 6 },
    ]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterC' },
      { mapper: 'counterD' },
      { mapper: 'counterAB + counterD' },
      { mapper: 'counterAB_C + counterAB_D' },
    ]);
  });
});
