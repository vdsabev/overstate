import { CreateStore, Store, StoreOptions } from './store';

export interface App {
  <T extends {}>(options: AppOptions<T>, container?: Element): Store<T>;
}

export interface AppOptions<T extends {}> {
  model?: T;
  view(props: { model: T }): Element;
  createStore?: CreateStore;
  patch(container: Element, node: Element): Element;
  throttle?(fn: Function): any;
}

export const app = <T extends {}>({ model, view, createStore, patch, throttle }: AppOptions<T>, container?: Element): Store<T> => {
  if (!createStore) throw new Error(`You must provide a 'createStore' function!`);

  if (!model) {
    model = {} as T;
  }

  if (!throttle) {
    throttle = requestAnimationFrame;
  }

  const render = (model: T) => throttle(() => {
    patch(container, container = view({ model }));
  });

  const store = createStore(model);
  store.subscribe(render);
  store.update();

  return store;
};
