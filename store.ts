import { RecursivePartial, isPromise, merge, Merge } from './utils';

export interface CreateStore {
  <T extends {}>(source?: T, options?: Partial<StoreOptions>): Store<T>;
}

export interface StoreOptions {
  merge: Merge;
}

export interface Store<T extends {}> {
  readonly model: Readonly<T>;
  set(data: RecursivePartial<T>): RecursivePartial<T>;
  subscribe(listener: StoreListener<T>): () => void;
  update(): void;
}

export interface StoreListener<T extends {}> {
  (model: T): void;
}

// TODO: Explore using `Object.defineProperty` instead of proxy functions
/**
 * Creates a store from a source object, deep copying all values
 * and proxying all functions to call subscriptions when executed.
 */
export const createStore: CreateStore = (source, options) => {
  const model: typeof source = {} as any;
  const listeners: StoreListener<typeof source>[] = [];

  if (!options) {
    options = {};
  }

  if (!options.merge) {
    options.merge = merge;
  }

  const set = (data: RecursivePartial<typeof source>) => {
    const result = options.merge(model, data, createProxyFunction);
    update();
    return result;
  }

  const subscribe = (listener: StoreListener<typeof source>) => {
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
    const changes: RecursivePartial<U> | Promise<RecursivePartial<U>> = fn.apply(slice, args);

    if (isPromise(changes)) {
      return changes.then((asyncChanges) => {
        options.merge(slice, asyncChanges, createProxyFunction);
        update();
        return asyncChanges;
      });
    }

    options.merge(slice, changes, createProxyFunction);
    update();
    return changes;
  };

  options.merge(model, source, createProxyFunction);

  return {
    model,
    subscribe,
    set,
    update
  };
};
