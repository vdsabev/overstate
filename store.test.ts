import { createStore } from './store';

describe(`createStore`, () => {
  describe(`options`, () => {
    it(`should allow passing empty object as options`, () => {
      const model = {};
      const store = createStore(model, {});
      expect(store.model).toEqual(model);
    });

    it(`should allow passing a custom merge function, which will be called`, () => {
      const merge = jest.fn();
      const model = {};
      const store = createStore(model, { merge });
      expect(merge).toHaveBeenCalledTimes(1);
    });

    it(`should update state with custom merge`, () => {
      interface Model {
        state: any;
        setState(state: any): any;
      }

      const model: Model = {
        state: {},
        setState(state) {
          return { state };
        },
      };

      const store = createStore(model, {
        merge(target: any, source: any, createProxyFunction: Function) {
          for (let key in source) {
            if (typeof source[key] === 'function') {
              target[key] = createProxyFunction(source[key], target);
            } else {
              target[key] = source[key];
            }
          }
          return target;
        },
      });

      store.model.setState({ a: 1 });
      expect(store.model.state).toEqual({ a: 1 });

      store.model.setState({ b: 2 });
      expect(store.model.state).toEqual({ b: 2 });
    });
  });

  describe(`model`, () => {
    it(`should be empty when created with no model`, () => {
      const store = createStore();
      expect(store.model).toEqual({});
    });

    it(`should be empty when created with null`, () => {
      const store = createStore();
      expect(store.model).toEqual({});
    });

    it(`should be empty when created with an empty object`, () => {
      const store = createStore({});
      expect(store.model).toEqual({});
    });

    it(`should contain values and functions`, () => {
      const store = createStore({ a: 1, b: () => {} });
      expect(store.model.a).toBe(1);
      expect(typeof store.model.b).toBe('function');
    });

    it(`should contain array`, () => {
      const a = [1, 2, 3];
      const store = createStore({ a });
      expect(store.model.a).toBe(a);
    });

    it(`should return proxied functions`, () => {
      const a = () => {};
      const store = createStore({ a });
      expect(store.model.a).not.toBe(a);
    });

    it(`should return an object`, () => {
      const value = { b: 2, c: 3 };
      const store = createStore({ a: () => value });
      expect(store.model.a()).toBe(value);
    });

    it(`should return a number`, () => {
      const store = createStore({ a: () => 1 });
      expect(store.model.a()).toBe(1);
    });

    it(`should return a string`, () => {
      const store = createStore({ a: () => 'a' });
      expect(store.model.a()).toBe('a');
    });

    it(`should return an array`, () => {
      const array = [1, 2, 3];
      const store = createStore({ a: () => array });
      expect(store.model.a()).toBe(array);
    });

    it(`should update state from function`, () => {
      const model = {
        count: 0,
        down() {
          return { count: this.count - 1 };
        },
        up() {
          return { count: this.count + 1 };
        },
      };
      const store = createStore(model);
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
        },
      };
      const store = createStore(model);
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
        },
      };
      const store = createStore(model);
      store.model.add3();
      expect(store.model.count).toBe(3);
    });

    it(`should not mutate source model`, () => {
      const model = {
        count: 0,
        up() {
          return { count: this.count + 1 };
        },
      };
      const store = createStore(model);
      store.model.up();
      expect(model.count).toBe(0);
      expect(store.model.count).toBe(1);
    });

    it(`should support imperative programming (without calling listeners)`, () => {
      const model = {
        count: 0,
        add(count: number) {
          this.count += count;
        },
      };
      const store = createStore(model);
      store.model.add(10);
      expect(store.model.count).toBe(10);
    });
  });

  describe(`set`, () => {
    it(`should set model`, () => {
      const store = createStore({});
      store.set({ a: 1 });
      expect(store.model).toEqual({ a: 1 });
      store.set({ b: 2 });
      expect(store.model).toEqual({ a: 1, b: 2 });
    });

    it(`should set model async`, async () => {
      const store = createStore({});
      store.set({ a: await Promise.resolve(1) });
      expect(store.model).toEqual({ a: 1 });
    });

    it(`should call listeners`, () => {
      const listener = jest.fn();
      const store = createStore({});
      store.subscribe(listener);
      store.set({ a: 1 });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe(`deep model`, () => {
    const model = {
      greeter: {
        name: 'a',
        rename(name: string) {
          return { name };
        },
      },
      counter: {
        count: 0,
        add(count: number) {
          return { count: this.count + count };
        },
      },
    };

    it(`should initialize deep values`, () => {
      const store = createStore(model);
      expect(store.model.greeter.name).toBe('a');
      expect(store.model.counter.count).toBe(0);
    });

    it(`should return correct value from deep functions`, () => {
      const store = createStore(model);
      expect(store.model.greeter.rename('b')).toEqual({ name: 'b' });
      expect(store.model.counter.add(1)).toEqual({ count: 1 });
    });

    it(`should set deep values from deep functions`, () => {
      const store = createStore(model);
      store.model.greeter.rename('c');
      expect(store.model.greeter.name).toBe('c');
      store.model.counter.add(1);
      expect(store.model.counter.count).toBe(1);
    });

    it(`should not mutate source model`, () => {
      const store = createStore(model);
      store.model.counter.add(1);
      expect(model.counter.count).toBe(0);
      expect(store.model.counter.count).toBe(1);
    });

    it(`should have easily testable source model without going through store`, () => {
      expect(model.greeter.rename('b')).toEqual({ name: 'b' });
      expect(model.counter.add(1)).toEqual({ count: 1 });
    });
  });

  describe(`class model`, () => {
    class BaseCounter {
      count = 0;

      add(value: number) {
        return { count: this.count + value };
      }
    }

    class ExtendedCounter extends BaseCounter {
      calls = 0;

      down() {
        this.calls++;
        return { count: this.count - 1 };
      }

      up() {
        this.calls++;
        return { count: this.count + 1 };
      }
    }

    const model = {
      baseCounter: new BaseCounter(),
      extendedCounter: new ExtendedCounter(),
    };

    it(`should contain values`, () => {
      const store = createStore(model);
      expect(store.model.baseCounter.count).toBe(0);
      expect(store.model.extendedCounter.count).toBe(0);
      expect(store.model.extendedCounter.calls).toBe(0);
    });

    it(`should contain functions`, () => {
      const store = createStore(model);
      expect(store.model.baseCounter.add).not.toBeUndefined();
      expect(store.model.extendedCounter.add).not.toBeUndefined();
      expect(store.model.extendedCounter.down).not.toBeUndefined();
      expect(store.model.extendedCounter.up).not.toBeUndefined();
    });
  });

  describe(`async`, () => {
    it(`should set state after promise resolves`, async () => {
      const model = {
        count: 0,
        add(count: number) {
          return Promise.resolve({ count: this.count + count });
        },
      };
      const store = createStore(model);
      expect(await store.model.add(10)).toEqual({ count: 10 });
    });

    it(`should not set state after promise throws error`, async () => {
      const model = {
        count: 0,
        add(count: number) {
          return Promise.reject(`Error`);
        },
      };
      const store = createStore(model);
      try {
        await store.model.add(10);
        throw `Not an error`;
      } catch (error) {
        expect(error).toBe(`Error`);
      }
    });
  });

  describe(`dynamic functions`, () => {
    interface CounterModel {
      count: number;
      add?(count: number): Partial<CounterModel>;
    }

    interface CounterModelSync extends CounterModel {
      set(state: Partial<CounterModel>): Partial<CounterModel>;
    }

    const counterModelSync: CounterModelSync = {
      count: 0,
      set(state) {
        return state;
      },
    };

    interface CounterModelAsync extends CounterModel {
      set(state: Partial<CounterModel>): Promise<Partial<CounterModel>>;
    }

    const counterModelAsync: CounterModelAsync = {
      count: 0,
      async set(state) {
        return state;
      },
    };

    it(`should add function from object`, () => {
      const store = createStore(counterModelSync);
      store.model.set({
        add(count: number) {
          return { count: this.count + count };
        },
      });
      store.model.add(10);
      expect(store.model.count).toBe(10);
    });

    it(`should add function from class instance`, () => {
      class Counter {
        count?: number;
        add(count: number) {
          return { count: this.count + count };
        }
      }

      const store = createStore(counterModelSync);
      store.model.set(new Counter());
      store.model.add(10);
      expect(store.model.count).toBe(10);
    });

    it(`should add function asynchronously`, async () => {
      const store = createStore(counterModelAsync);
      await store.model.set({
        add(count: number) {
          return { count: this.count + count };
        },
      });
      store.model.add(10);
      expect(store.model.count).toBe(10);
    });
  });

  describe(`subscribe`, () => {
    it(`should call listener on update`, () => {
      const model = { a: 1, b: 2 };
      const changes = { b: 3 };
      const store = createStore(model);
      const listener = jest.fn();
      store.subscribe(listener);
      store.set(changes);
      expect(listener).toHaveBeenCalledWith({ ...model, ...changes }, changes, undefined);
    });

    it(`should call listener with action`, () => {
      const store = createStore({ a: 1, set: (a) => ({ a }) });
      const listener = jest.fn();
      store.subscribe(listener);
      store.model.set(2);
      expect(listener.mock.calls[0][2]).toBe(store.model.set);
    });

    it(`should call listener with 'undefined' for 'update'`, () => {
      const store = createStore({ a: 1 });
      const listener = jest.fn();
      store.subscribe(listener);
      store.update();
      expect(listener.mock.calls[0][2]).toBe(undefined);
    });

    it(`should not call listeners if result is undefined`, () => {
      const listener = jest.fn();
      const store = createStore({ a: () => {} });
      store.subscribe(listener);
      store.model.a();
      expect(listener).not.toHaveBeenCalled();
    });

    it(`should not call listeners if result is number`, () => {
      const listener = jest.fn();
      const store = createStore({ a: () => 1 });
      store.subscribe(listener);
      store.model.a();
      expect(listener).not.toHaveBeenCalled();
    });

    it(`should unsubscribe`, () => {
      const store = createStore({});
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      store.update();
      expect(listener).not.toHaveBeenCalled();
    });

    it(`should allow unsubscribe multiple times`, () => {
      const store = createStore({});
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      unsubscribe();
      store.update();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
