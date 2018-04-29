import { AppOptions } from '../overstate';

export interface Render {
  (node: any, container: Element | Document | null, existingNode?: Element): Element;
}

/**
 * Create an application using:
 * 1. A `store` object
 * 2. A `view` function that renders an element using the store's model
 * 3. A `render` function that updates the container's DOM using the rendered view
 * Returns an unsubscribe function which will stop rerendering after being called.
 */
export const app = <T extends {}>(
  { store, view, render, throttle = requestAnimationFrame }: AppOptions<T, Render>,
  container: Element = document.body,
) => {
  let existingNode: Element;
  const renderDOM = (model: T) => {
    existingNode = render(view({ model }), container, existingNode) as Element;
  };
  renderDOM(store.model);

  return store.subscribe((model) => {
    throttle(() => renderDOM(model));
  });
};
