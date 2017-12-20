import * as _app from './app';
import * as _store from './store';

import { merge, Merge } from './merge';
import { getDeepProps } from './props';

export * from './merge';
export * from './props';

/**
 * Create a store from a source object, deep copying all properties
 * and proxying all functions to call subscriptions when executed.
 */
export const createStore: _store.CreateStore = <T extends {}>(source: T, options: Partial<_store.StoreOptions> = {}): _store.Store<T> => {
  return _store.createStore(source, {
    merge: options.merge || merge,
    getDeepProps: options.getDeepProps || getDeepProps
  });
};

/**
 * Create an application using:
 * 1. A `view` function that renders an element using the store's model
 * 2. A `patch` function that updates a container's DOM using the rendered view
 */
export const app: _app.App = <T extends {}>(options: _app.AppOptions<T>, container?: Element): _store.Store<T> => {
  return _app.app(Object.assign({ createStore }, options), container);
};
