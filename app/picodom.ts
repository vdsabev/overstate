import { AppOptions } from '../overstate';
import { Store } from '../store';

export interface PicodomOptions<T extends {}> extends AppOptions<T> {
  render(container: Node, existingNode: Node, vdom: any): Node;
}

/**
 * Create an application using:
 * 1. A `store` object
 * 2. A `view` function that renders an element using the store's model
 * 3. A `render` function that updates the container's DOM using the rendered view
 * Returns an unsubscribe function which will stop rerendering after being called.
 */
export const app = <T extends {}>(
  { store, view, render, throttle = requestAnimationFrame }: PicodomOptions<T>,
  container: Node = document.body,
) => {
  let existingNode: Node;
  const renderDOM = (model: T) => {
    existingNode = render(container, existingNode, view({ model }));
  };
  renderDOM(store.model);

  return store.subscribe((model) => {
    throttle(() => renderDOM(model));
  });
};
