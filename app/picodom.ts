import { createStore } from '../index';
import { Store } from '../store';

export interface App {
  <T extends {}>(options: AppOptions<T>, container?: Element): AppStore<T>;
}

export interface AppStore<T extends {}> extends Store<T> {
  destroy(): void;
}

export interface AppOptions<T extends {}> {
  model?: T;
  view(props: { model: T }): any;
  patch(oldNode: any, newNode: any, ...args: any[]): any;
  throttle?(fn: Function): any;
}

/**
 * Create an application using:
 * 1. A `view` function that renders an element using the store's model
 * 2. A `patch` function that updates a container's DOM using the rendered view
 * Returns a store with an additional method - `destroy`, which unsubscribes from
 * the `render` function.
 */
export const app: App = ({ model, view, patch, throttle }, container) => {
  if (!model) {
    model = {} as typeof model;
  }

  if (!throttle) {
    throttle = requestAnimationFrame;
  }

  const render = (updatedModel: typeof model) => throttle(() => {
    patch(container, container = view({ model: updatedModel }));
  });

  const store = createStore(model);
  const unsubscribe = store.subscribe(render);
  store.update();

  // Spread adds unnecessary lines to the project
  return Object.assign(store, { destroy: unsubscribe });
};
