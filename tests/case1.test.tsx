import React from 'react';
import SharedReducer from '../lib/index';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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

/* ------------------ mapStates --------------*/
const useCounter = mapState((x) => x);
/* ------------------ actions ----------------*/
function increaseCounter() {
  dispatch({ type: 'increase' });
}

/* ------------------ components ----------------*/
let renderingLogs = [];

function App() {
  const counterA = useCounter();
  const counterB = useCounter();
  renderingLogs.push({ component: 'App', counterA, counterB });
  return <div></div>;
}

describe('case1', () => {
  test('updates in same component should be merged', () => {
    render(<App />);
    renderingLogs = [];
    act(() => increaseCounter());
    expect(renderingLogs).toEqual([{ component: 'App', counterA: 2, counterB: 2 }]);
  });
});
