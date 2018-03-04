import { createStore, Store } from '../store';
import { app } from './picodom';

import { defaultOptions } from './app.test';

describe(`picodom`, () => {
  it(`should render to existing container if passed`, () => {
    const store = createStore({ a: 1 });
    const container = document.createElement('div');
    const child = document.createElement('div');
    const render = jest.fn(() => child);
    const throttle = jest.fn((callback) => callback());
    app({ ...defaultOptions, render, store, throttle }, container);
    store.update();
    expect(render).toHaveBeenLastCalledWith(container, child, {});
  });
});
