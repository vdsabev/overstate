export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export const isFunction = (value: any): value is Function => typeof value === 'function';

export const isObject = (value: any): value is Object => value !== null && typeof value === 'object' && !Array.isArray(value);

export const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> => promise != null && isFunction((promise as Promise<T>).then);

/**
 * A simple deep merge function that mutates the target object
 */
export const merge: Merge = (x, ...args) => {
  if (!isObject(x)) {
    throw new Error(`Invalid merge target, expected an object, got ${JSON.stringify(x, null, 2)}`);
  }

  args.forEach((y) => {
    for (let key in y) {
      if (y.hasOwnProperty(key)) {
        const isDeep = x != null && x.hasOwnProperty(key) && isObject(x[key]);
        (x[key] as any) = isDeep ? merge(x[key], y[key]) : y[key];
      }
    }
  });

  return x;
};

export interface Merge {
  <T extends {} = any>(x: RecursivePartial<T>, ...args: RecursivePartial<T>[]): RecursivePartial<T>;
}

// https://stackoverflow.com/questions/30881632/es6-iterate-over-class-methods
export const getDeepProps: DeepProps = (x): string[] => (
  x != null
  &&
  x !== Object.prototype
  &&
  [
    ...Object.getOwnPropertyNames(x).filter(notConstructor),
    ...getDeepProps(Object.getPrototypeOf(x))
  ]
) || [];

const notConstructor = (key: string) => key !== 'constructor';

export interface DeepProps {
  <T extends {} = {}>(x: T): string[];
}
