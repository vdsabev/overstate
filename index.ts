import { merge } from './merge';
import { getDeepProps } from './props';
import * as store from './store';

export * from './merge';
export * from './props';

/**
 * Create a store from a source object, deep copying all values
 * and proxying all functions to call subscriptions when executed.
 */
export const createStore: store.CreateStore = (source, options: Partial<store.StoreOptions> = {}) => {
  return store.createStore(source, {
    merge: options.merge || merge,
    getDeepProps: options.getDeepProps || getDeepProps
  });
};
