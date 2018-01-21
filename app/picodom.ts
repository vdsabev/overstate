import { Store } from '../store';

export interface App {
  <T extends {}>(options: AppOptions<T>, container?: Element): () => void;
}

export interface AppOptions<T extends {}> {
  store?: Store<T>;
  view(props: { model: T }): any;
  patch(oldNode: any, newNode: any, ...args: any[]): any;
  throttle?(fn: Function): any;
}

/**
 * Create an application using:
 * 1. A `store` object
 * 2. A `view` function that renders an element using the store's model
 * 3. A `patch` function that updates the container's DOM using the rendered view
 * Returns an unsubscribe function which stops rendering after being called.
 */
export const app: App = ({ store, view, patch, throttle }, container) => {
  if (!throttle) {
    throttle = requestAnimationFrame;
  }

  const render = (model: any) => {
    throttle(() => {
      patch(container, (container = view({ model })));
    });
  };

  const unsubscribe = store.subscribe(render);
  store.update();

  return unsubscribe;
};
