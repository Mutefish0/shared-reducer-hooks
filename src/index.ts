import EventEmitter from 'event-emitter';
import { useEffect, useState as useReactState } from 'react';
import { Reducer } from 'react';

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let emitter = EventEmitter();

  function mapState<T>(mapper: (state: S) => T): () => T {
    const initialMappedState = mapper(store);
    return () => {
      const [cachedMappedState, setCachedMappedState] = useReactState(initialMappedState);

      useEffect(() => {
        const listener = () => {
          const mappedState = mapper(store);
          if (mappedState !== cachedMappedState) {
            console.log('setState');
            setCachedMappedState(mappedState);
          }
        };
        emitter.on('update', listener);
        return () => emitter.off('update', listener);
      }, []);

      return cachedMappedState;
    };
  }

  function dispatch(action: A) {
    store = reducer(store, action);
    emitter.emit('update');
  }

  return [mapState, dispatch] as [typeof mapState, typeof dispatch];
}

// createSelector方法
// 当且仅当依赖的状态发生改变，才会重新进行计算
// 可以有效提升性能，同时避免出现死循环问题
type ReturnArray<T> = { [P in keyof T]: T[P] extends () => infer U ? () => U : () => T[P] }; // 变长参数类型推断
type Args<T> = { [P in keyof T]: T[P] extends infer U ? U : T[P] }; // 变长参数类型推断
export function createSelector<T0, T extends [any, any, any, any, any, any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends any[]>(
  useStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
) {
  return function () {
    const states = useStates.map((us) => us()) as Args<T>;
    const [mergedState, setMergedState] = useReactState<T0>(selector(states));
    useEffect(() => setMergedState(selector(states)), states);
    return mergedState;
  };
}
