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

function CompA() {
  const counter = useCounter();
  renderingLogs.push({ component: 'CompA', counter });
  return <div></div>;
}

function CompB() {
  const counter = useCounter();
  renderingLogs.push({ component: 'CompB', counter });
  return <div></div>;
}

function App() {
  return (
    <div>
      <CompA />
      <CompB />
    </div>
  );
}

describe('basic', () => {
  test('should render initial value correctly', () => {
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([
      { component: 'CompA', counter: 1 },
      { component: 'CompB', counter: 1 },
    ]);
  });

  test('CompA and CompB should both get updated', () => {
    render(<App />);
    renderingLogs = [];
    act(() => increaseCounter());
    expect(renderingLogs).toEqual([
      { component: 'CompA', counter: 2 },
      { component: 'CompB', counter: 2 },
    ]);
  });
});
