import { createStore, merge, getDeepProps } from './index';
import * as _store from './store';

describe(`createStore`, () => {
  it(`should provide 'merge' and 'getDeepProps' functions for 'store.createStore'`, () => {
    const model = { a: 1, b: 2, c: 3 };
    expect(
      createStore(model).model
    ).toEqual(
      _store.createStore(model, { merge, getDeepProps }).model
    );
  });

  it(`should allow overriding 'merge' and 'getDeepProps' functions`, () => {
    const model = { a: 1, b: 2, c: 3 };
    expect(
      createStore(model, { merge, getDeepProps }).model
    ).toEqual(
      _store.createStore(model, { merge, getDeepProps }).model
    );
  });
});
