import { RecursivePartial, isObject, isPromise, merge, Merge } from './utils';

export interface CreateStore {
  /**
   * Creates a store from a source object, deep copying all values and
   * proxying all functions to call `update` when executed.
   */
  <T extends {}>(source?: T, options?: Partial<StoreOptions>): Store<T>;
}

export interface StoreOptions {
  merge: Merge;
  callFunction: <S extends {}>(
    fn: Function,
    state: S,
    args: any[]
  ) => RecursivePartial<S> | Promise<RecursivePartial<S>>;
}

export interface Store<T extends {}> {
  /** An object composed of all values and proxied functions passed to `createStore` */
  readonly model: Readonly<T>;
  /** Merges some data into the store model at the root level and calls `update` */
  set: StoreSet<T>;
  /**
   * Calls the passed callback function every time a model function that returns
   * (or resolves to) an object is executed
   */
  subscribe: StoreSubscribe<T>;
  /** Calls all subscriptions manually */
  update: StoreUpdate;
}

export interface StoreSet<T extends {}> {
  (changes: RecursivePartial<T>): RecursivePartial<T>;
}

export interface StoreSubscribe<T extends {}> {
  (listener: StoreListener<T>): () => void;
}

export interface StoreListener<T extends {}> {
  <S extends {}>(model: T, changes: S, action: Function): void;
}

export interface StoreUpdate {
  <S extends {}>(changes?: S, action?: Function): void;
}

export const createStore: CreateStore = (source, options) => {
  type T = typeof source;
  const model: T = {} as any;
  const listeners: StoreListener<T>[] = [];

  if (!options) {
    options = {};
  }

  if (!options.merge) {
    options.merge = merge;
  }

  const createSetFunction = <S extends {}>(state: S, action?: Function): StoreSet<S> => (changes) => {
    options.merge(state, changes, createProxyFunction);
    update(changes, action);
    return changes;
  };

  const subscribe: StoreSubscribe<T> = (listener) => {
    listeners.push(listener);
    return () => {
      const indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    };
  };

  const update: StoreUpdate = (changes, action) => {
    listeners.forEach((subscription) => subscription(model, changes, action));
  };

  const createProxyFunction = <S extends {}>(fn: Function, state: S) => {
    const proxyFunction = (...args: any[]) => {
      const changes: RecursivePartial<S> | Promise<RecursivePartial<S>> = options.callFunction
        ? options.callFunction(fn, state, args)
        : fn.apply(state, args);

      if (isPromise(changes)) {
        return changes.then(set);
      }

      if (isObject(changes)) {
        return set(changes);
      }

      return changes;
    };

    const set = createSetFunction(state, proxyFunction);

    return proxyFunction;
  };

  options.merge(model, source, createProxyFunction);

  return {
    model,
    subscribe,
    set: createSetFunction(model),
    update,
  };
};
