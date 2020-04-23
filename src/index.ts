import { useEffect, useState as useReactState } from 'react';
import { Reducer } from 'react';
interface Token {
  id: number;
}

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let tokenId: number = 0;
  let callbacksIds: number[] = [];
  const callbackEntity: { [key: number]: any } = {};
  let batchMap: { [key: number]: boolean } = {};

  function useToken() {
    const [cachedToken, setCachedToken] = useReactState<Token>({ id: tokenId + 1 });
    if (cachedToken.id > tokenId) {
      tokenId = cachedToken.id;
    }
    batchMap[cachedToken.id] = true;
    return [cachedToken, () => setCachedToken({ id: cachedToken.id })] as [Token, () => void];
  }

  function mapState<T>(mapper: (state: S) => T): () => T {
    return () => {
      const [token, forceUpdate] = useToken();

      useEffect(() => {
        callbackEntity[token.id] = (lastStore: S, nextStore: S) => {
          if (mapper(lastStore) !== mapper(nextStore) && !batchMap[token.id]) {
            forceUpdate();
          }
        };

        callbacksIds.push(token.id);
        callbacksIds.sort();

        return () => {
          callbacksIds = callbacksIds.filter((id) => id !== token.id);
          delete callbackEntity[token.id];
        };
      }, []);

      return mapper(store);
    };
  }

  function dispatch(action: A) {
    const lastStore = store;
    store = reducer(store, action);
    batchMap = {};
    callbacksIds.forEach((cbId) => callbackEntity[cbId](lastStore, store));
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
