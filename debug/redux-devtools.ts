import { Store } from '../store';

interface Window {
  top: Window;
  __REDUX_DEVTOOLS_EXTENSION__: {
    connect: <T extends {}>() => DevTools<T>;
  };
}

declare const window: Window;

interface DevToolsStore<T extends {}> extends Store<T> {
  devtools?: DevTools<T>;
}

interface DevTools<T extends {}> {
  subscribe(listener: (message: DevToolsMessage) => void): void;
  init(model: T): void;
  send(actionName: string, model: T): void;
}

interface DevToolsMessage {
  type: string;
  state: string;
  payload: {
    type: string;
  };
}

const maxChangesLength = 64;

const trim = (text: string, maxLength: number, ellipsis = '…') =>
  text && text.length > maxLength ? text.slice(0, maxLength) + ellipsis : text;

/**
 * Inspired by unistore devtools
 * @see https://github.com/developit/unistore/blob/8a5c17ba2e58b4848d9dceb695507c2da4607ff3/devtools.js
 */
export const debug = <T extends {}>(store: DevToolsStore<T>) => {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__;
  let ignoreState = false;

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension');
    store.devtools = null;

    return store;
  }

  if (!store.devtools) {
    store.devtools = extension.connect();

    store.devtools.subscribe((message) => {
      if (message.type === 'DISPATCH' && message.state) {
        ignoreState = message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE';
        store.set(JSON.parse(message.state));
      }
    });

    store.devtools.init(store.model);

    store.subscribe((model, changes) => {
      if (!ignoreState) {
        store.devtools.send(changes ? trim(JSON.stringify(changes), maxChangesLength) : 'set', model);
      }
    });
  }

  return store;
};
