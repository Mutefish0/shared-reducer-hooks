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

function App() {
  const counterA = useCounter();
  const counterB = useCounter();
  renderingLogs.push({ component: 'App', counterA, counterB });
  return <div></div>;
}

describe('two sibling components', () => {
  test('updates should be merged', () => {
    render(<App />);
    renderingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([{ component: 'App', counterA: 2, counterB: 2 }]);
  });
});
