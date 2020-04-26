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

let mappingLogs = [];

const useCounter = mapState((x) => {
  mappingLogs.push({ mapper: 'counter' });
  return x;
});

function increaseCounter() {
  dispatch({ type: 'increase' });
}

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
    mappingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([
      { component: 'CompA', counter: 1 },
      { component: 'CompB', counter: 1 },
    ]);
    expect(mappingLogs).toEqual([{ mapper: 'counter' }]);
  });

  test('CompA and CompB should both get updated', () => {
    render(<App />);
    renderingLogs = [];
    mappingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'CompA', counter: 2 },
      { component: 'CompB', counter: 2 },
    ]);
    expect(mappingLogs).toEqual([{ mapper: 'counter' }]);

    renderingLogs = [];
    mappingLogs = [];
    increaseCounter();
    expect(renderingLogs).toEqual([
      { component: 'CompA', counter: 3 },
      { component: 'CompB', counter: 3 },
    ]);
    expect(mappingLogs).toEqual([{ mapper: 'counter' }]);
  });
});
