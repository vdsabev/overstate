import { app } from './app';
import { createStore } from './index';

describe(`app`, () => {
  const defaultOptions = {
    createStore,
    view: ({ model }) => ({}) as Element,
    patch: () => ({}) as Element
  };

  it(`should throw an error if no 'createStore' function`, () => {
    expect(() => app({ ...defaultOptions, createStore: null })).toThrowError();
  });

  it(`should return store`, () => {
    const mockStore: any = { subscribe: () => {}, update: () => {} };
    const store = app({ ...defaultOptions, createStore: () => mockStore });
    expect(store).toBe(mockStore);
  });

  it(`should call 'subscribe' and 'update'`, () => {
    const mockCreateStore = jest.fn(() => ({ subscribe: jest.fn(), update: jest.fn() }));
    const store = app({ ...defaultOptions, createStore: mockCreateStore });
    expect(store.subscribe).toHaveBeenCalled();
    expect(store.update).toHaveBeenCalled();
  });

  it(`should initialize model to empty object`, () => {
    const store = app(defaultOptions);
    expect(store.model).toEqual({});
  });

  it(`should initialize model to passed object`, () => {
    const model = { a: 1 };
    const store = app({ ...defaultOptions, model });
    expect(store.model).toEqual(model);
  });

  it(`should call 'throttle' when passed`, () => {
    const throttle = jest.fn();
    const store = app({ ...defaultOptions, throttle });
    expect(throttle).toHaveBeenCalled();
  });

  it(`should call 'patch'`, () => {
    const patch = jest.fn();
    const store = app({ ...defaultOptions, patch, throttle: (fn) => fn() });
    expect(patch).toHaveBeenCalled();
  });

  it(`should call 'view'`, () => {
    const view = jest.fn();
    const store = app({ ...defaultOptions, view, throttle: (fn) => fn() });
    expect(view).toHaveBeenCalled();
  });
});
