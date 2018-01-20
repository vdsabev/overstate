import { Store } from './index';

interface Window {
  top: Window;
  __REDUX_DEVTOOLS_EXTENSION__?: any;
}

declare const window: Window;

export interface DevToolsStore<T extends {}> extends Store<T> {
  devtools?: any;
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
export const devtools = <T extends {}>(store: DevToolsStore<T>) => {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__;
  let ignoreState = false;

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension');
    store.devtools = null;

    return store;
  }

  if (!store.devtools) {
    store.devtools = extension.connect();

    store.devtools.subscribe((message: DevToolsMessage) => {
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
