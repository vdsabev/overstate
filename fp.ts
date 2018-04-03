import { isFunction, isObject, isPromise } from './utils';

export interface StoreSubscribe<State extends {}> {
  (listener: StoreListener<State>): () => void;
}

export interface StoreListener<State extends {}> {
  (state: State): void;
}

export interface StoreDispatcher<State extends {}> {
  (state?: State, ...args: any[]): StoreValue<State>;
}

export type StoreValue<State extends {}> = StoreDispatcher<State> | Promise<State> | State | null | undefined;

export const createStore = <State extends {}>(initialState: State) => {
  let state = initialState;

  const getState = () => state;

  const setState = (newState: State | null | undefined): State | null | undefined | void => {
    if (isObject(newState)) {
      state = newState;
      listeners.forEach((listener) => listener(state));

      return newState;
    }
  };

  let listeners: StoreListener<State>[] = [];
  const subscribe = (listener: StoreListener<State>) => {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((innerListener) => innerListener !== listener);
    };
  };

  const dispatch = (fnOrObj: StoreValue<State>) => {
    // Call function recursively and dispatch returned value
    if (isFunction(fnOrObj)) {
      dispatch(fnOrObj(state));
    }
    // Dispatch resolved value recursively
    // TODO: How do we handle the fact that the state might've changed in the meantime?
    else if (isPromise<StoreValue<State>>(fnOrObj)) {
      fnOrObj.then(dispatch);
    }
    // Set state immediately
    else if (isObject<State>(fnOrObj)) {
      setState(fnOrObj);
    }
    // Otherwise, do nothing
  };

  return {
    getState,
    setState,
    subscribe,
    dispatch,
  };
};
