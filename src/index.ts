import { Reducer, useEffect, useState as useReactState } from 'react';

type Callback = () => any;
function noop() {}

interface Emitter {
  ids: number[];
  callbackEntity: { [key: number]: Callback };
  digOn: typeof digOn;
  layOn: typeof layOn;
  off: typeof off;
  emit: typeof emit;
}

// 挖坑
function digOn(this: Emitter, id: number) {
  this.ids.push(id);
  this.callbackEntity[id] = noop;
}
// 躺坑
function layOn(this: Emitter, id: number, cb: Callback) {
  this.callbackEntity[id] = cb;
}

function off(this: Emitter, id: number) {
  delete this.callbackEntity[id];
  this.ids = this.ids.filter((_id) => _id !== id);
}
function emit(this: Emitter) {
  let updates: (() => void)[] = [];
  for (let id of this.ids) {
    const update = this.callbackEntity[id]();
    if (update) {
      updates.push(update);
    }
  }
  updates.forEach((u) => u());
}
function createEmitter(): Emitter {
  return { ids: [], callbackEntity: {}, digOn, layOn, off, emit };
}

interface Token<MS> {
  id: number;
  state: MS;
}

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let tokenId: number = 0;
  let batchMap: { [key: number]: boolean } = {};
  const emitter = createEmitter();

  function useToken<MS>(mapper: (s: S) => MS): [Token<MS>, (t: Token<MS>) => void] {
    const [cachedToken, setCachedToken] = useReactState<Token<MS>>({
      id: tokenId + 1,
      state: undefined as any,
    });
    if (cachedToken.id > tokenId) {
      tokenId = cachedToken.id;
      cachedToken.state = mapper(store);
      emitter.digOn(cachedToken.id);
    }
    batchMap[cachedToken.id] = true;
    return [cachedToken, setCachedToken];
  }

  function mapState<MS>(mapper: (state: S) => MS): () => MS {
    return (notify?: () => void) => {
      const [token, forceUpdate] = useToken<MS>(mapper);
      useEffect(() => {
        emitter.layOn(token.id, () => {
          const nextState = mapper(store);
          if (token.state !== nextState) {
            token.state = nextState;
            notify && notify();
            return () => !batchMap[token.id] && forceUpdate({ ...token });
          }
        });
        return () => {
          emitter.off(token.id);
        };
      }, []);

      return token.state;
    };
  }

  function dispatch(action: A) {
    store = reducer(store, action);
    batchMap = {};
    emitter.emit();
  }

  return [mapState, dispatch] as [typeof mapState, typeof dispatch];
}

// createSelector方法
// 当且仅当依赖的状态发生改变，才会重新进行计算
// 可以有效提升性能，同时避免出现死循环问题
type ReturnArray<T> = {
  [P in keyof T]: T[P] extends (notify: () => void) => infer U
    ? (notify: () => void) => U
    : (notify: () => void) => T[P];
}; // 变长参数类型推断
type Args<T> = {
  [P in keyof T]: T[P] extends infer U ? U : T[P];
}; // 变长参数类型推断
export function createSelector<T0, T extends [any, any, any, any, any, any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any, any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends [any]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
): () => T0;
export function createSelector<T0, T extends any[]>(
  useMappedStates: ReturnArray<T>,
  selector: (args: Args<T>) => T0
) {
  let cache: T0;
  let useCache = false;
  return function (_notify: () => void) {
    function notify() {
      useCache = false;
      _notify && _notify();
    }
    const mappedStates = useMappedStates.map((u) => u(notify));
    if (!useCache) {
      cache = selector(mappedStates as Args<T>);
      useCache = true;
    }
    return cache;
  };
}
