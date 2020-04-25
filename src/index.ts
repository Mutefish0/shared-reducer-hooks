import { Reducer, useEffect, useState as useReactState } from 'react';

interface Emiter<T> {
  ids: number[];
  callbackEntity: { [key: number]: (arg1: T, arg2: T) => void };
  on: typeof on;
  off: typeof off;
  emit: typeof emit;
}

function on<T>(this: Emiter<T>, id: number, cb: (arg1: T, arg2: T) => void) {
  let insertIndex = this.ids.length;
  for (; insertIndex >= 0; insertIndex--) {
    if (id > this.ids[insertIndex]) {
      break;
    }
  }
  this.ids.splice(insertIndex + 1, 0, id);
  this.callbackEntity[id] = cb;
}
function off<T>(this: Emiter<T>, id: number) {
  delete this.callbackEntity[id];
  this.ids = this.ids.filter((_id) => _id !== id);
}
function emit<T>(this: Emiter<T>, arg1: T, arg2: T) {
  this.ids.forEach((id) => this.callbackEntity[id](arg1, arg2));
}
function createEmiter<T>(): Emiter<T> {
  return { ids: [], callbackEntity: {}, on, off, emit };
}

interface Token {
  id: number;
}

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let tokenId: number = 0;
  let batchMap: { [key: number]: boolean } = {};
  const emiter = createEmiter<S>();

  function useToken(): [Token, (t: Token) => void] {
    const [cachedToken, setCachedToken] = useReactState<Token>({ id: tokenId + 1 });
    if (cachedToken.id > tokenId) {
      tokenId = cachedToken.id;
    }
    batchMap[cachedToken.id] = true;
    return [cachedToken, setCachedToken];
  }

  function mapState<T>(mapper: (state: S) => T): () => T {
    return () => {
      const [token, forceUpdate] = useToken();
      useEffect(() => {
        emiter.on(token.id, (lastStore: S, nextStore: S) => {
          if (!batchMap[token.id] && mapper(lastStore) !== mapper(nextStore)) {
            forceUpdate({ id: token.id });
          }
        });
        return () => {
          emiter.off(token.id);
        };
      }, []);

      return mapper(store);
    };
  }

  function dispatch(action: A) {
    const lastStore = store;
    store = reducer(store, action);
    batchMap = {};
    emiter.emit(lastStore, store);
  }

  return [mapState, dispatch] as [typeof mapState, typeof dispatch];
}

// createSelector方法
// 当且仅当依赖的状态发生改变，才会重新进行计算
// 可以有效提升性能，同时避免出现死循环问题
type ReturnArray<T> = {
  [P in keyof T]: T[P] extends () => infer U ? () => U : () => T[P];
}; // 变长参数类型推断
type Args<T> = {
  [P in keyof T]: T[P] extends infer U ? U : T[P];
}; // 变长参数类型推断
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
    return selector(useStates.map((us) => us()) as Args<T>);
  };
}
