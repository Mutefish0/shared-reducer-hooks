import React from 'react';
import SharedReducer from '../src/index';
import { render } from '@testing-library/react';

import './suppressWarn';

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

let mappingLogs = [];

const useCounter1 = mapState1((x) => {
  mappingLogs.push({ mapper: 'counter1' });
  return x;
});
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
const useCounter2 = mapState2((x) => {
  mappingLogs.push({ mapper: 'counter2' });
  return x;
});
function increaseCounter2() {
  dispatch2({ type: 'increase' });
}

let renderingLogs = [];

function App() {
  const counter1 = useCounter1();
  const counter2 = useCounter2();
  renderingLogs.push({ component: 'App', counter1, counter2 });
  return <div></div>;
}

describe('two reducers', () => {
  test('counter1 and counter2 works respectively', () => {
    mappingLogs = [];
    renderingLogs = [];
    render(<App />);
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 1, counter2: 1 }]);
    expect(mappingLogs).toEqual([{ mapper: 'counter1' }, { mapper: 'counter2' }]);

    mappingLogs = [];
    renderingLogs = [];
    increaseCounter1();
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 2, counter2: 1 }]);
    expect(mappingLogs).toEqual([{ mapper: 'counter1' }]);

    mappingLogs = [];
    renderingLogs = [];
    increaseCounter2();
    expect(renderingLogs).toEqual([{ component: 'App', counter1: 2, counter2: 2 }]);
    expect(mappingLogs).toEqual([{ mapper: 'counter2' }]);
  });
});
