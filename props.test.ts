import { getDeepProps } from './props';

describe('getDeepProps', () => {
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
    expect(getDeepProps(null)).toEqual([]);
  });

  it('should return empty array when called with an empty object', () => {
    expect(getDeepProps({})).toEqual([]);
  });

  it('should get properties and methods of class (without constructor)', () => {
    const counter = new BaseCounter();
    expect(getDeepProps(counter)).toEqual(['count', 'add']);
  });

  it('should get properties and methods of extended class', () => {
    const counter = new ExtendedCounter();
    expect(getDeepProps(counter)).toEqual(['count', 'calls', 'down', 'up', 'add']);
  });
});
