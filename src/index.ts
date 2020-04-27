import {Reducer, useEffect, useState as useReactState, useState} from 'react';

type Callback = () => any;
function noop() {}

interface Emitter {
  ids: number[];
  callbackEntity: {[key: number]: Callback};
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
  return {ids: [], callbackEntity: {}, digOn, layOn, off, emit};
}

interface Token {
  id: number;
  versionId: number;
}

interface MapperContext<S, T> {
  id: number;
  versionId: number;
  mapper: (store: S) => T;
  cache: T;
}

export default function SharedReducer<S, A>(reducer: Reducer<S, A>) {
  let store = reducer([][0], {} as A);
  let maxTokenId: number = 0;
  let maxMapperId: number = 0;
  let batchFlags: {[key: number]: boolean} = {};
  let mapperEntity: {[key: number]: MapperContext<S, any>} = {};
  const emitter = createEmitter();

  function useToken(): [Token, (t: Token) => void] {
    const [token, setToken] = useReactState<Token>({
      id: maxTokenId + 1,
      versionId: 0,
    });
    if (token.id > maxTokenId) {
      maxTokenId = token.id;
      emitter.digOn(token.id);
    }
    batchFlags[token.id] = true;
    return [token, setToken];
  }

  function mapState<MS>(mapper: (state: S) => MS): () => MS {
    const mapperId = maxMapperId++;
    const mapperContext: MapperContext<S, MS> =
        {id: mapperId, mapper, versionId: 0, cache: mapper(store) as MS};
    mapperEntity[mapperId] = mapperContext;

    return (notify?: () => void) => {
      const [token, forceUpdate] = useToken();
      useEffect(() => {
        emitter.layOn(token.id, () => {
          if (mapperContext.versionId !== token.versionId) {
            token.versionId = mapperContext.versionId;
            notify && notify();
            return () => !batchFlags[token.id] && forceUpdate({...token});
          }
        });
        return () => {
          emitter.off(token.id);
        };
      }, []);

      return mapperContext.cache;
    };
  }

  function dispatch(action: A) {
    store = reducer(store, action);
    for (let mapperId in mapperEntity) {
      const mapperItem = mapperEntity[mapperId];
      const nextState = mapperItem.mapper(store);
      if (mapperItem.cache !== nextState) {
        mapperItem.cache = nextState;
        mapperItem.versionId = mapperItem.versionId + 1;
      }
    }
    batchFlags = {};
    emitter.emit();
  }

  return [mapState, dispatch] as [typeof mapState, typeof dispatch];
}

// createSelector方法
// 当且仅当依赖的状态发生改变，才会重新进行计算
// 可以有效提升性能，同时避免出现死循环问题
type ReturnArray<T> = {
  [P in keyof T]: T[P] extends(notify: () => void) => infer U ?
      (notify: () => void) => U :
      (notify: () => void) => T[P];
};  // 变长参数类型推断
type Args<T> = {
  [P in keyof T]: T[P] extends infer U ? U : T[P];
};  // 变长参数类型推断
export function
    createSelector<T0, T extends [any, any, any, any, any, any, any, any]>(
        useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () =>
        T0;
export function
    createSelector<T0, T extends [any, any, any, any, any, any, any]>(
        useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () =>
        T0;
export function createSelector<T0, T extends [any, any, any, any, any, any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends [any, any, any, any, any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends [any, any, any, any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends [any, any, any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends [any, any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends [any]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export function createSelector<T0, T extends any[]>(
    useMappedStates: ReturnArray<T>, selector: (args: Args<T>) => T0) {
  let cache: T0;
  let useCache = false;
  return function(_notify: () => void) {
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
