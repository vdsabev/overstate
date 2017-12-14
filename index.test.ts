import * as index from './index';
import * as store from './store';

describe(`createStore`, () => {
  it(`should provide merge function for 'store.createStore'`, () => {
    const model = { a: 1, b: 2, c: 3 };
    expect(
      index.createStore(model).model
    ).toEqual(
      store.createStore(model, index.merge).model
    );
  });
});
