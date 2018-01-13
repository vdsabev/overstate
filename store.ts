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
  update(): void;
}

export interface StoreSet<T extends {}> {
  (data: RecursivePartial<T>): RecursivePartial<T>;
}

export interface StoreSubscribe<T extends {}> {
  (listener: StoreListener<T>): () => void;
}

export interface StoreListener<T extends {}> {
  (model: T): void;
}

// TODO: Explore using `Object.defineProperty` instead of proxy functions
export const createStore: CreateStore = (source, options) => {
  const model: typeof source = {} as any;
  const listeners: StoreListener<typeof source>[] = [];

  if (!options) {
    options = {};
  }

  if (!options.merge) {
    options.merge = merge;
  }

  const createSet = <U extends {}>(slice: U): StoreSet<U> => (data) => {
    if (isObject(data)) {
      options.merge(slice, data, createProxyFunction);
      update();
    }
    return data;
  }

  const subscribe: StoreSubscribe<typeof source> = (listener) => {
    listeners.push(listener);
    return () => {
      const indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    };
  };

  const update = () => listeners.forEach((subscription) => subscription(model));

  const createProxyFunction = <U extends {}>(fn: Function, slice: U) => (...args: any[]) => {
    const set = createSet(slice);
    const changes: RecursivePartial<U> | Promise<RecursivePartial<U>> = fn.apply(slice, args);

    if (isPromise(changes)) {
      return changes.then(set);
    }

    if (isObject(changes)) {
      return set(changes);
    }

    return changes;
  };

  options.merge(model, source, createProxyFunction);

  return {
    model,
    subscribe,
    set: createSet(model),
    update
  };
};
