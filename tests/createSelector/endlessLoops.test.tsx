import React, { useEffect, useState } from 'react';
import SharedReducer, { createSelector } from '../../src/index';
import { render } from '@testing-library/react';

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

const useCounterA = mapState((x) => x.counterA);
const useCounterB = mapState((x) => x.counterB);
const useCounterInfo = createSelector([useCounterA, useCounterB], ([counterA, counterB]) => {
  return { counterA, counterB };
});

let loopCount = 0;
function App() {
  const counterInfo = useCounterInfo();
  const [total, setTotal] = useState({ total: 0 });

  useEffect(() => {
    setTotal({ total: counterInfo.counterA + counterInfo.counterB });
  }, [counterInfo]);

  loopCount++;

  if (loopCount > 10) {
    throw Error();
  }

  return <div></div>;
}

describe('depended by useEffect', () => {
  test('no endless loop', () => {
    try {
      render(<App />);
    } catch (e) {
      fail('endless loop');
    }
  });
});
