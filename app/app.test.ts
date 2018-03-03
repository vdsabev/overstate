import { createStore, Store } from '../store';
import * as picodom from './picodom';
import * as preact from './preact';
import * as ultradom from './ultradom';

export const defaultOptions = {
  view: ({ model }) => ({} as Element),
  render: () => (document.createElement('div') as Element),
};

const apps = { picodom, preact, ultradom };
Object.keys(apps).forEach((key) => {
  const { app } = apps[key];

  describe(key, () => {
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

    it(`should call 'render' on every update`, () => {
      const render = jest.fn(() => document.createElement('div'));
      app({ ...defaultOptions, store, render, throttle: (fn) => fn() });
      expect(render).toHaveBeenCalledTimes(1);
      store.update();
      expect(render).toHaveBeenCalledTimes(2);
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
});
