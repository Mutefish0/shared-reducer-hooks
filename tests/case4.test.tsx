import React from 'react';
import SharedReducer from '../src/index';
import { render } from '@testing-library/react';

import './suppressWarn';

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
function App() {
  return (
    <div>
      <A />
      <B />
    </div>
  );
}

describe('two mapped states', () => {
  test('only when mapped state itself changed should cause re-rendering', () => {
    render(<App />);

    renderingLogs = [];
    incareseCounterA();
    expect(renderingLogs).toEqual([{ component: 'A', counterA: 1 }]);

    renderingLogs = [];
    incareseCounterB();
    expect(renderingLogs).toEqual([{ component: 'B', counterB: 1 }]);
  });
});
