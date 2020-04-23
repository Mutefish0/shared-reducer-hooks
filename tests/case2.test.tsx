import React from 'react';
import SharedReducer from '../lib/index';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

type State = number;
interface Action {
  type: 'increase';
}

const [mapState1, dispatch1] = SharedReducer((state: State = 1, action: Action) => {
  switch (action.type) {
    case 'increase':
      return state + 1;
    default:
      return state;
  }
});
const useCounter1 = mapState1((x) => x);
function increaseCounter1() {
  dispatch1({ type: 'increase' });
}

const [mapState2, dispatch2] = SharedReducer((state: State = 1, action: Action) => {
  switch (action.type) {
    case 'increase':
      return state + 1;
    default:
      return state;
  }
});
const useCounter2 = mapState2((x) => x);
function increaseCounter2() {
  dispatch2({ type: 'increase' });
}

/* ------------------ components ----------------*/
let renderingLogs = [];

function App() {
  const counter1 = useCounter1();
  const counter2 = useCounter2();
  renderingLogs.push({ component: 'App', counter1, counter2 });
  return <div></div>;
}

describe('case2', () => {
  test('counter1 and counter2 works respectively', () => {
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 1, counter2: 1 }]);

    renderingLogs = [];
    act(() => increaseCounter1());
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 2, counter2: 1 }]);

    renderingLogs = [];
    act(() => increaseCounter2());
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 2, counter2: 2 }]);
  });
});
