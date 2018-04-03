import { createStore } from './fp';

describe(`getState`, () => {
  it(`should return initial state if no changes have been made`, () => {
    const initialState = { a: 1, b: 2, c: 3 };
    const store = createStore(initialState);

    expect(store.getState()).toBe(initialState);
  });

  it(`should return new state after changes have been made`, () => {
    const initialState = { a: 1, b: 2, c: 0 };
    const store = createStore(initialState);

    const newState = { ...initialState, c: 3 };
    store.setState(newState);

    expect(store.getState()).toBe(newState);
  });
});

describe(`setState`, () => {
  it(`should return new state`, () => {
    const initialState = { a: 1, b: 2, c: 0 };
    const store = createStore(initialState);

    expect(store.setState({ ...initialState, c: 3 })).toBe(store.getState());
  });

  it(`should do nothing if passed non-object value`, () => {
    const initialState = { a: 1, b: 2, c: 3 };
    const store = createStore(initialState);

    const listener = jest.fn();
    store.subscribe(listener);

    store.setState(null);

    expect(listener).not.toHaveBeenCalled();
    expect(store.getState()).toBe(initialState);
  });
});

describe(`subscribe`, () => {
  it(`should call listener on update`, () => {
    const initialState = { a: 1, b: 2, c: 0 };
    const store = createStore(initialState);

    const listener = jest.fn();
    store.subscribe(listener);

    const newState = { ...store.getState(), c: 3 };
    store.setState(newState);

    expect(listener).toHaveBeenCalledWith(newState);
  });

  it(`unsubscribe should prevent listeners from being called on update`, () => {
    const initialState = { a: 1, b: 2, c: 0 };
    const store = createStore(initialState);

    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ ...store.getState(), c: 3 });

    expect(listener).not.toHaveBeenCalled();
  });
});

describe(`dispatch`, () => {
  it(`should do nothing when passed invalid value`, () => {
    const initialState = { a: 1 };
    const store = createStore(initialState);
    store.dispatch(null);

    expect(store.getState()).toBe(initialState);
  });

  it(`should set state when passed object`, () => {
    const store = createStore({ a: 1 });
    const newState = { a: 2 };
    store.dispatch(newState);

    expect(store.getState()).toBe(newState);
  });

  it(`should set state when promise resolves to object`, async () => {
    const store = createStore({ a: 1 });
    const newState = { a: 2 };
    const promise = Promise.resolve(newState);
    store.dispatch(promise);

    await promise;
    expect(store.getState()).toBe(newState);
  });

  it(`should set state when chained promises resolve to object`, async () => {
    const store = createStore({ a: 1 });
    const newState = { a: 2 };
    const promise = Promise.resolve(Promise.resolve(newState));
    store.dispatch(promise);

    await promise;
    expect(store.getState()).toBe(newState);
  });

  it(`should set state when function returns object`, async () => {
    const store = createStore({ a: 1 });
    const newState = { a: 2 };
    store.dispatch(() => newState);
    expect(store.getState()).toBe(newState);
  });

  it(`should set state when chained functions return object`, async () => {
    const store = createStore({ a: 1 });
    const newState = { a: 2 };
    store.dispatch(() => () => newState);
    expect(store.getState()).toBe(newState);
  });
});
