import { merge, getAllProps } from './utils';

describe('merge', () => {
  it('should throw an error if X is null', () => {
    expect(() => merge(null, null)).toThrowError();
  });

  it('should not throw an error if Y is null', () => {
    expect(() => merge({}, null)).not.toThrowError();
  });

  it('should throw an error if X is an array', () => {
    expect(() => merge([], {})).toThrowError();
  });

  it('should throw an error if X is not an object', () => {
    expect(() => merge(1, {})).toThrowError();
  });

  it('should not change X if both objects are empty', () => {
    expect(merge({}, {})).toEqual({});
  });

  it('should return and mutate X', () => {
    const x = {};
    const xx = x;
    const y = {};
    expect(merge(x, y)).toBe(x);
    expect(x).toBe(xx);
  });

  it('should merge properties from X', () => {
    expect(merge({ a: 1 }, {})).toEqual({ a: 1 });
  });

  it('should merge properties from X if Y is null', () => {
    expect(merge({ a: 1 }, null)).toEqual({ a: 1 });
  });

  it('should merge properties from Y', () => {
    expect(merge({}, { b: 2 })).toEqual({ b: 2 });
  });

  it('should merge properties from X and Y', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('should prefer properties from Y over X', () => {
    const x = { a: 1, b: 2       };
    const y = {       b: 3, c: 4 };
    const r = { a: 1, b: 3, c: 4 };
    expect(merge(x, y)).toEqual(r);
  });

  it('should deep merge', () => {
    const x = { a: 1, b: { aa: 1, bb: 2        }       };
    const y = {       b: {        bb: 3, cc: 4 }, c: 5 };
    const r = { a: 1, b: { aa: 1, bb: 3, cc: 4 }, c: 5 };
    expect(merge(x, y)).toEqual(r);
  });

  it('should deep merge with functions', () => {
    const fa = () => 1;
    const fb = () => 2;
    const fc = () => 3;
    const x = { a: 1, b: { aa: fa, bb: fb, cc: 2        }, c: fc };
    const y = {       b: {                 cc: 3, dd: 4 }        };
    const r = { a: 1, b: { aa: fa, bb: fb, cc: 3, dd: 4 }, c: fc };
    expect(merge(x, y)).toEqual(r);
  });
});

describe('getAllProps', () => {
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

  it('should return empty array when called with null', () => {
    expect(getAllProps(null)).toEqual([]);
  });

  it('should return empty array when called with an empty object', () => {
    expect(getAllProps({})).toEqual([]);
  });

  it('should get properties and methods of class (without constructor)', () => {
    const counter = new BaseCounter();
    expect(getAllProps(counter)).toEqual(['count', 'add']);
  });

  it('should get properties and methods of extended class', () => {
    const counter = new ExtendedCounter();
    expect(getAllProps(counter)).toEqual(['count', 'calls', 'down', 'up', 'add']);
  });
});
