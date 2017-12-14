// TODO: Make a drop-in build using Rollup
import { merge } from './merge';
import * as store from './store';

export * from './merge';
export const createStore = <T extends {}>(source: T): store.Store<T> => store.createStore(source, merge);
