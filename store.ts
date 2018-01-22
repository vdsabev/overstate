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
  <U extends {}>(model: T, changes: U, action: Function): void;
}

export interface StoreUpdate {
  <U extends {}>(changes?: U, action?: Function): void;
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

  const createSetFunction = <U extends {}>(slice: U, action?: Function): StoreSet<U> => (changes) => {
    options.merge(slice, changes, createProxyFunction);
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

  const createProxyFunction = <U extends {}>(fn: Function, slice: U) => {
    const proxiedFn = (...args: any[]) => {
      const changes: RecursivePartial<U> | Promise<RecursivePartial<U>> = fn.apply(slice, args);

      if (isPromise(changes)) {
        return changes.then(set);
      }

      if (isObject(changes)) {
        return set(changes);
      }

      return changes;
    };

    const set = createSetFunction(slice, proxiedFn);

    return proxiedFn;
  };

  options.merge(model, source, createProxyFunction);

  return {
    model,
    subscribe,
    set: createSetFunction(model),
    update,
  };
};
