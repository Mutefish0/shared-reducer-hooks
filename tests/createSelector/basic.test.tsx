import React from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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

let mappingLogs = [];

const useCounterA = mapState((x) => {
  mappingLogs.push({ mapper: 'counterA' });
  return x.counterA;
});
const useCounterB = mapState((x) => {
  mappingLogs.push({ mapper: 'counterB' });
  return x.counterB;
});
const useCounterTotal = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  mappingLogs.push({ mapper: 'counterA + counterB' });
  return counterA + counterB;
});

function incareseCounterA() {
  dispatch({ type: 'incareseA' });
}
function incareseCounterB() {
  dispatch({ type: 'incareseB' });
}

let renderingLogs = [];
function App() {
  const counterA = useCounterA();
  const counterB = useCounterB();
  const counterTotal = useCounterTotal();
  renderingLogs.push({ counterA, counterB, counterTotal });
  return <div></div>;
}

describe('createSelector basic', () => {
  test('basic correct', () => {
    mappingLogs = [];
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([{ counterA: 0, counterB: 0, counterTotal: 0 }]);
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterA + counterB' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    act(() => incareseCounterA());
    expect(renderingLogs[renderingLogs.length - 1]).toEqual({
      counterA: 1,
      counterB: 0,
      counterTotal: 1,
    });
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterA + counterB' },
    ]);

    mappingLogs = [];
    renderingLogs = [];
    act(() => incareseCounterB());
    expect(renderingLogs[renderingLogs.length - 1]).toEqual({
      counterA: 1,
      counterB: 1,
      counterTotal: 2,
    });
    expect(mappingLogs).toEqual([
      { mapper: 'counterA' },
      { mapper: 'counterB' },
      { mapper: 'counterA + counterB' },
    ]);
  });
});
