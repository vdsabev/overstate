import { createStore } from '../store';
import { app } from './picodom';

describe(`picodom`, () => {
  const defaultOptions = {
    view: ({ model }) => ({} as Element),
    patch: () => ({} as Element),
  };

  it(`should call 'throttle' on every update when throttle is passed`, () => {
    const store = createStore({});
    const throttle = jest.fn();
    app({ ...defaultOptions, store, throttle });
    expect(throttle).toHaveBeenCalledTimes(1);
    store.update();
    expect(throttle).toHaveBeenCalledTimes(2);
  });

  it(`should call 'requestAnimationFrame' on every update when throttle is not passed`, () => {
    const store = createStore({});
    const originalRAF = (global as any).requestAnimationFrame;
    const raf = ((global as any).requestAnimationFrame = jest.fn());
    app({ ...defaultOptions, store });
    expect(raf).toHaveBeenCalledTimes(1);
    store.update();
    expect(raf).toHaveBeenCalledTimes(2);
    (global as any).requestAnimationFrame = originalRAF;
  });

  it(`should call 'patch' on every update`, () => {
    const store = createStore({});
    const patch = jest.fn();
    app({ ...defaultOptions, store, patch, throttle: (fn) => fn() });
    expect(patch).toHaveBeenCalledTimes(1);
    store.update();
    expect(patch).toHaveBeenCalledTimes(2);
  });

  it(`should call 'view' on every update`, () => {
    const store = createStore({});
    const view = jest.fn();
    app({ ...defaultOptions, store, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    store.update();
    expect(view).toHaveBeenCalledTimes(2);
  });

  it(`should stop rendering when 'unsubscribe' is called`, () => {
    const store = createStore({});
    const view = jest.fn();
    const unsubscribe = app({ ...defaultOptions, store, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.update();
    expect(view).toHaveBeenCalledTimes(1);
  });
});
