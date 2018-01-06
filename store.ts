import { RecursivePartial, isFunction, isObject, isPromise, merge, getDeepProps } from './utils';

export interface CreateStore {
  <T extends {}>(source: T): Store<T>;
}

export interface Store<T extends {}> {
  readonly model: Readonly<T>;
  subscribe(listener: StoreListener<T>): () => void;
  update(): void;
}

export interface StoreListener<T extends {}> {
  (model: T): void;
}

// TODO: Explore using `Object.defineProperty` instead of proxy functions
/**
 * Create a store from a source object, deep copying all values
 * and proxying all functions to call subscriptions when executed.
 */
export const createStore: CreateStore = (source) => {
  const model: typeof source = {} as any;
  const listeners: StoreListener<typeof source>[] = [];

  const subscribe = (listener: StoreListener<typeof source>) => {
    listeners.push(listener);
    return () => {
      const indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    };
  };

  const update = () => {
    listeners.forEach((subscription) => subscription(model));
  };

  const createProxyFunction = <U extends {}>(fn: Function, modelSlice: U) => (...args: any[]) => {
    const changes: RecursivePartial<U> | Promise<RecursivePartial<U>> = fn.apply(modelSlice, args);
    if (isPromise(changes)) {
      changes.then((asyncChanges) => set(modelSlice, asyncChanges));
    }
    else {
      set(modelSlice, changes);
    }
    return changes;
  };

  const set = <U extends {}>(modelSlice: U, changes: RecursivePartial<U>) => {
    if (changes != null) {
      getDeepProps(changes).forEach((key) => {
        const sourceValue = (changes as any)[key];
        if (isFunction(sourceValue)) {
          (changes as any)[key] = createProxyFunction(sourceValue, modelSlice);
        }
      });
      merge(modelSlice, changes);
    }
    update();
  };

  // TODO: For class instances, perhaps proxy methods from `model.constructor.prototype`
  const mergeSourceIntoModel = <U extends {}>(modelSlice: RecursivePartial<U>, sourceSlice: U) => {
    if (sourceSlice == null) return;

    getDeepProps(sourceSlice).forEach((key) => {
      const sourceValue = (sourceSlice as any)[key];
      if (isFunction(sourceValue)) {
        (modelSlice as any)[key] = createProxyFunction(sourceValue, modelSlice);
      }
      // We need to go deeper.jpg
      else if (isObject(sourceValue)) {
        if (!(modelSlice as any)[key]) {
          (modelSlice as any)[key] = {};
        }
        mergeSourceIntoModel((modelSlice as any)[key], (sourceSlice as any)[key]);
      }
      // Set value
      else {
        (modelSlice as any)[key] = sourceValue;
      }
    });
  };

  mergeSourceIntoModel(model, source);

  return {
    model,
    subscribe,
    update
  };
};
