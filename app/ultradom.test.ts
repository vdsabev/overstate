import { createStore, Store } from '../store';
import { app } from './ultradom';

describe(`ultradom`, () => {
  const defaultOptions = {
    view: ({ model }) => ({} as Element),
    patch: () => document.createElement('div'),
  };

  let store: Store<{}>;
  beforeEach(() => {
    store = createStore({});
  });

  it(`should call 'throttle' on every update when throttle is passed`, () => {
    const throttle = jest.fn();
    app({ ...defaultOptions, store, throttle });
    store.update();
    expect(throttle).toHaveBeenCalledTimes(1);
    store.update();
    expect(throttle).toHaveBeenCalledTimes(2);
  });

  it(`should call 'requestAnimationFrame' on every update when throttle is not passed`, () => {
    const originalRAF = (global as any).requestAnimationFrame;
    const raf = ((global as any).requestAnimationFrame = jest.fn());
    app({ ...defaultOptions, store });
    store.update();
    expect(raf).toHaveBeenCalledTimes(1);
    store.update();
    expect(raf).toHaveBeenCalledTimes(2);
    (global as any).requestAnimationFrame = originalRAF;
  });

  it(`should patch existing container if passed`, () => {
    const container = document.createElement('div');
    const patch = jest.fn(() => container);
    const throttle = jest.fn((callback) => callback());
    app({ ...defaultOptions, patch, store, throttle }, container);
    store.update();
    expect(patch).toHaveBeenLastCalledWith(store.model, container);
  });

  it(`should call 'patch' on every update`, () => {
    const patch = jest.fn(() => document.createElement('div'));
    app({ ...defaultOptions, store, patch, throttle: (fn) => fn() });
    expect(patch).toHaveBeenCalledTimes(1);
    store.update();
    expect(patch).toHaveBeenCalledTimes(2);
  });

  it(`should call 'view' on every update`, () => {
    const view = jest.fn();
    app({ ...defaultOptions, store, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    store.update();
    expect(view).toHaveBeenCalledTimes(2);
  });

  it(`should stop rendering when 'unsubscribe' is called`, () => {
    const view = jest.fn();
    const unsubscribe = app({ ...defaultOptions, store, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.update();
    expect(view).toHaveBeenCalledTimes(1);
  });
});
