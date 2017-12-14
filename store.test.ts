import { merge } from './merge';
import { createStore } from './store';

describe(`createStore`, () => {
  describe(`model`, () => {
    it(`should be empty when created with an empty object`, () => {
      const store = createStore({}, merge);
      expect(store.model).toEqual({});
    });

    it(`should contain values and functions`, () => {
      const store = createStore({ a: 1, b: () => {} }, merge);
      expect(store.model.a).toBe(1);
      expect(typeof store.model.b).toBe('function');
    });

    it(`should return proxied functions`, () => {
      const a = () => {};
      const store = createStore({ a }, merge);
      expect(store.model.a).not.toBe(a);
    });

    it(`should return correct value from function`, () => {
      const value = { b: 2, c: 3 };
      const store = createStore({ a: () => value }, merge);
      expect(store.model.a()).toBe(value);
    });

    it(`should update state from function`, () => {
      const model = {
        count: 0,
        down() {
          return { count: this.count - 1 };
        },
        up() {
          return { count: this.count + 1 };
        }
      };
      const store = createStore(model, merge);
      expect(store.model.down()).toEqual({ count: -1 });
      expect(store.model.count).toBe(-1);
      expect(store.model.up()).toEqual({ count: 0 });
      expect(store.model.count).toBe(0);
      expect(store.model.up()).toEqual({ count: 1 });
      expect(store.model.count).toBe(1);
    });

    it(`should support arguments for functions`, () => {
      const model = {
        count: 0,
        add(count: number) {
          return { count: this.count + count };
        }
      };
      const store = createStore(model, merge);
      store.model.add(10);
      expect(store.model.count).toBe(10);
      store.model.add(-20);
      expect(store.model.count).toBe(-10);
    });

    it(`should mutate state when calling functions inside a function`, () => {
      const model = {
        count: 0,
        add1() {
          return { count: this.count + 1 };
        },
        add2() {
          return { count: this.count + 2 };
        },
        add3() {
          this.add1();
          this.add2();
        }
      };
      const store = createStore(model, merge);
      store.model.add3();
      expect(store.model.count).toBe(3);
    });

    it(`should support imperative programming`, () => {
      const model = {
        count: 0,
        add(count: number) {
          this.count += count;
        }
      };
      const store = createStore(model, merge);
      store.model.add(10);
      expect(store.model.count).toBe(10);
    });
  });
});
