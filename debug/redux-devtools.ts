import { Store } from '../store';
import { isObject, getAllProps } from '../utils';

interface Window {
  top: Window;
  __REDUX_DEVTOOLS_EXTENSION__: {
    connect: <T extends {}>(options?: any) => DevTools<T>;
  };
}

declare const window: Window;

export interface DevToolsStore<T extends {}> extends Store<T> {
  devtools?: DevTools<T>;
}

export interface DevTools<T extends {}> {
  subscribe(listener: (message: DevToolsMessage) => void): void;
  init(model: T): void;
  send(actionName: string, model: T): void;
}

export interface DevToolsMessage {
  type: string;
  state: string;
  payload: {
    type: string;
  };
}

/**
 * Heavily inspired by unistore devtools.
 * @see https://github.com/developit/unistore/blob/2320a8a149ad10bf32901e55c4041eb712b7c3ed/devtools.js
 */
export const debug = <T extends {}>(store: DevToolsStore<T>, options?: any) => {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__;
  let isDevtoolsAction = false;

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension');
    store.devtools = null;

    return store;
  }

  if (!store.devtools) {
    store.devtools = extension.connect(options);

    store.devtools.subscribe((message) => {
      if (message.type === 'DISPATCH' && message.state) {
        isDevtoolsAction = message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE';
        store.set(JSON.parse(message.state));
      }
    });

    store.devtools.init(store.model);

    store.subscribe((model, changes, action) => {
      if (!isDevtoolsAction) {
        const path = getPathToValue(model, action, 'model');
        store.devtools.send(path || 'set', model);
      } else {
        isDevtoolsAction = false;
      }
    });
  }

  return store;
};

const getPathToValue = <S extends {}>(obj: S, value: Function, prefix: string): string => {
  const keys = getAllProps(obj);
  for (const key of keys) {
    const objValue = (obj as any)[key];
    if (objValue === value) {
      return `${prefix}.${key}`;
    }
    if (isObject(objValue)) {
      const path = getPathToValue(objValue, value, `${prefix}.${key}`);
      if (path && path !== prefix) {
        return path;
      }
    }
  }

  return null;
};
