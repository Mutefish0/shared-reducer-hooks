import { Reducer } from 'react';
export default function SharedReducer<S, A>(reducer: Reducer<S, A>): [<T>(mapper: (state: S) => T) => () => T, (action: A) => void];
declare type ReturnArray<T> = {
    [P in keyof T]: T[P] extends () => infer U ? () => U : () => T[P];
};
declare type Args<T> = {
    [P in keyof T]: T[P] extends infer U ? U : T[P];
};
export declare function createSelector<T0, T extends [any, any, any, any, any, any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any, any, any, any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any, any, any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any, any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any, any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export declare function createSelector<T0, T extends [any]>(useStates: ReturnArray<T>, selector: (args: Args<T>) => T0): () => T0;
export {};
