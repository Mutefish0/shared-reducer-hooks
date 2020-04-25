import { Reducer, useEffect, useState as useReactState } from 'react';

type Callback<T> = (arg1: T, arg2: T) => void;
function noop() {}

interface Emitter<T> {
  ids: number[];
  callbackEntity: { [key: number]: Callback<T> };
  digOn: typeof digOn;
  layOn: typeof layOn;
  off: typeof off;
  emit: typeof emit;
}

// 挖坑
function digOn<T>(this: Emitter<T>, id: number) {
  this.ids.push(id);
  this.callbackEntity[id] = noop;
}
// 躺坑
function layOn<T>(this: Emitter<T>, id: number, cb: Callback<T>) {
  this.callbackEntity[id] = cb;
}

function off<T>(this: Emitter<T>, id: number) {
  delete this.callbackEntity[id];
  this.ids = this.ids.filter((_id) => _id !== id);
}
function emit<T>(this: Emitter<T>, arg1: T, arg2: T) {
  this.ids.forEach((id) => this.callbackEntity[id](arg1, arg2));
}
function createEmitter<T>(): Emitter<T> {
  return { ids: [], callbackEntity: {}, digOn, layOn, off, emit };
}

interface Token {
  id: number;
}

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let maxTokenId: number = 0;
  let maxMapperId: number = 0;
  let cachedState: { [key: number]: any } = {};
  let batchMap: { [key: number]: boolean } = {};
  const emitter = createEmitter<S>();

  function useToken(): [Token, (t: Token) => void] {
    const [cachedToken, setCachedToken] = useReactState<Token>({ id: maxTokenId + 1 });
    if (cachedToken.id > maxTokenId) {
      maxTokenId = cachedToken.id;
      emitter.digOn(cachedToken.id);
    }
    batchMap[cachedToken.id] = true;
    return [cachedToken, setCachedToken];
  }

  function mapState<T>(mapper: (state: S) => T): () => T {
    const mapperId = maxMapperId++;

    function getMappedState(store: S) {
      if (!cachedState[mapperId]) {
        cachedState[mapperId] = mapper(store);
      }
      return cachedState[mapperId];
    }

    return () => {
      const [token, forceUpdate] = useToken();
      useEffect(() => {
        emitter.layOn(token.id, (lastStore: S, nextStore: S) => {
          if (!batchMap[token.id] && mapper(lastStore) !== getMappedState(nextStore)) {
            forceUpdate({ id: token.id });
          }
        });
        return () => {
          emitter.off(token.id);
        };
      }, []);

      return getMappedState(store);
    };
  }

  function dispatch(action: A) {
    const lastStore = store;
    store = reducer(store, action);
    batchMap = {};
    cachedState = {};
    emitter.emit(lastStore, store);
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
