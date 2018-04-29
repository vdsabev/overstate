import { AppOptions } from '../overstate';

export interface Render {
  (container: Element, existingNode: VNode<{}> | null, node: VNode<{}>): Element;
}

export interface VNode<Props> {
  type: string
  props?: Props
  children: Array<VNode<{}> | string>
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
  container = document.body,
) => {
  let existingNode: VNode<{}>;
  const renderDOM = (model: T) => {
    render(container, existingNode, existingNode = view({ model }));
  };
  renderDOM(store.model);

  return store.subscribe((model) => {
    throttle(() => renderDOM(model));
  });
};
