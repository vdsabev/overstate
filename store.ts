import { Merge, RecursivePartial } from './merge';

export interface Store<T extends {}> {
  model: T;
  subscribe(listener: Function): () => void;
  update(): void;
}

/** A lower-level function to create a store with your own merge function, e.g. from lodash */
// TODO: Explore using `Object.defineProperty` instead of proxy actions
export const createStore = <T extends {}>(source: T, merge: Merge): Store<T> => {
  const model: T = {} as any;
  const listeners: Function[] = [];

  const subscribe = (listener: Function) => {
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

  const set = <U extends {}>(modelSlice: U, changes: RecursivePartial<U>) => {
    // TODO: Proxy newly added actions to support dynamically changing actions
    if (changes != null) {
      merge(modelSlice, changes);
    }
    update();
  };

  // TODO: For class instances, perhaps proxy methods from `model.constructor.prototype`
  const mergeSourceIntoModel = <U extends {}>(modelSlice: RecursivePartial<U>, sourceSlice: U) => {
    if (sourceSlice == null) return;

    Object.keys(sourceSlice).forEach((key) => {
      const sourceValue = (sourceSlice as any)[key];
      if (isFunction(sourceValue)) {
        (modelSlice as any)[key] = (...args: any[]) => {
          const changes: RecursivePartial<U> = sourceValue.apply(modelSlice, args);
          set(modelSlice, changes);
          return changes;
        };
      }
      // We need to go deeper.jpg
      else if (isObject(sourceValue)) {
        if (!(modelSlice as any)[key]) {
          (modelSlice as any)[key] = {};
        }
        mergeSourceIntoModel((modelSlice as any)[key], (sourceSlice as any)[key]);
      }
      // Initialize values
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

const isFunction = (value: any): boolean => typeof value === 'function';

const isObject = (value: any): boolean => value !== null && typeof value === 'object' && !Array.isArray(value);
