import { app } from './picodom';

describe(`picodom`, () => {
  const defaultOptions = {
    view: ({ model }) => ({}) as Element,
    patch: () => ({}) as Element
  };

  it(`should initialize model to empty object`, () => {
    const store = app(defaultOptions);
    expect(store.model).toEqual({});
  });

  it(`should initialize model to passed object`, () => {
    const model = { a: 1, b: 2, c: 3 };
    const store = app({ ...defaultOptions, model });
    expect(store.model).toEqual(model);
  });

  it(`should call 'throttle' on every update when throttle is passed`, () => {
    const throttle = jest.fn();
    const store = app({ ...defaultOptions, throttle });
    expect(throttle).toHaveBeenCalledTimes(1);
    store.update();
    expect(throttle).toHaveBeenCalledTimes(2);
  });

  it(`should call 'requestAnimationFrame' on every update when throttle is not passed`, () => {
    const originalRAF = (global as any).requestAnimationFrame;
    const raf = (global as any).requestAnimationFrame = jest.fn();
    const store = app({ ...defaultOptions });
    expect(raf).toHaveBeenCalledTimes(1);
    store.update();
    expect(raf).toHaveBeenCalledTimes(2);
    (global as any).requestAnimationFrame = originalRAF;
  });

  it(`should call 'patch' on every update`, () => {
    const patch = jest.fn();
    const store = app({ ...defaultOptions, patch, throttle: (fn) => fn() });
    expect(patch).toHaveBeenCalledTimes(1);
    store.update();
    expect(patch).toHaveBeenCalledTimes(2);
  });

  it(`should call 'view' on every update`, () => {
    const view = jest.fn();
    const store = app({ ...defaultOptions, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    store.update();
    expect(view).toHaveBeenCalledTimes(2);
  });

  it(`should unsubscribe when 'destroy' is called`, () => {
    const view = jest.fn();
    const store = app({ ...defaultOptions, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalledTimes(1);
    store.destroy();
    store.update();
    expect(view).toHaveBeenCalledTimes(1);
  });
});
