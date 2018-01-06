import { Merge, RecursivePartial } from './merge';
import { DeepProps } from './props';
import { isFunction, isObject } from './utils';

export interface CreateStore {
  <T extends {}>(source: T, options?: StoreOptions): Store<T>;
}

export interface Store<T extends {}> {
  readonly model: Readonly<T>;
  subscribe(listener: StoreListener<T>): () => void;
  update(): void;
}

export interface StoreListener<T extends {}> {
  (model: T): void;
}

export interface StoreOptions {
  merge: Merge;
  getDeepProps: DeepProps;
}

// TODO: Explore using `Object.defineProperty` instead of proxy actions
/** A lower-level function to create a store with your own options, e.g. merge from lodash */
export const createStore: CreateStore = (source, { merge, getDeepProps }) => {
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

  const set = <U extends {}>(modelSlice: U, changes: RecursivePartial<U>) => {
    if (changes != null) {
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
        (modelSlice as any)[key] = (...args: any[]) => {
          const changes: RecursivePartial<U> | Promise<RecursivePartial<U>> = sourceValue.apply(modelSlice, args);
          if (isPromise(changes)) {
            changes.then((asyncChanges) => set(modelSlice, asyncChanges));
          }
          // else if (isFunction(changes)) {
          //   // TODO: Dynamic actions
          //   set(modelSlice, changes);
          // }
          else {
            set(modelSlice, changes);
          }
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

const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> => promise != null && isFunction((promise as any).then);
