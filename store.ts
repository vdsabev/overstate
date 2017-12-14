import { Merge, RecursivePartial } from './merge';

export interface Store<T extends {}> {
  model: T;
  set(changes: RecursivePartial<T>): void;
  subscribe(listener: Function): () => void;
  update(): void;
}

/** A lower-level function to create a store with your own merge function, e.g. from lodash */
// TODO: Possibly mutate the source itself, if we think that might be useful
// TODO: Explore using `Object.defineProperty` instead of proxy actions
export const createStore = <T extends {}>(source: T, merge: Merge<T>): Store<T> => {
  const model: T = {} as any;
  const listeners: Function[] = [];

  const set = (changes: RecursivePartial<T>) => {
    // TODO: Proxy newly added actions to support dynamically changing actions
    if (changes != null) {
      merge(model, changes);
    }
    update();
  };

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

  // TODO: Implement slices
  // TODO: For class instances, perhaps proxy methods from `model.constructor.prototype`
  Object.keys(source).forEach((key) => {
    const value = (source as any)[key];
    if (typeof value === 'function') {
      (model as any)[key] = (...args: any[]) => {
        const changes: RecursivePartial<T> = value.apply(model, args);
        set(changes);
        return changes;
      };
    }
    // We need to go deeper.jpg
    else if (typeof value === 'object' && value !== null) {
      // TODO: Deep create actions
    }
    // Initialize values
    else {
      (model as any)[key] = value;
    }
  });

  return {
    model,
    set,
    subscribe,
    update
  };
};
