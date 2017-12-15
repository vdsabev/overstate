import { merge, Merge } from './merge';
import { getDeepProps } from './props';
import * as store from './store';

export * from './merge';
export * from './props';

/**
 * Create a store from a source object, deep copying all properties
 * and proxying all functions to call subscriptions when executed.
 */
export const createStore = <T extends {}>(source: T, options: Partial<store.StoreOptions> = {}): store.Store<T> => {
  return store.createStore(source, {
    merge: options.merge || merge,
    getDeepProps: options.getDeepProps || getDeepProps
  });
};
