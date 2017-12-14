/** A simple deep merge function that mutates the target object */
export const merge = <T extends {}>(x: RecursivePartial<T>, ...args: RecursivePartial<T>[]): RecursivePartial<T> => {
  if (x == null || typeof x !== 'object' || Array.isArray(x)) {
    throw new Error(`Invalid merge target, expected an object, but got ${JSON.stringify(x, null, 2)}`);
  }

  args.forEach((y) => {
    for (let key in y) {
      if (y.hasOwnProperty(key)) {
        const isDeep = x != null && x.hasOwnProperty(key) && typeof x[key] === 'object';
        x[key] = isDeep ? merge(x[key], y[key]) : y[key];
      }
    }
  });

  return x;
};

export interface Merge<T extends {} = any> {
  (x: RecursivePartial<T>, ...args: RecursivePartial<T>[]): RecursivePartial<T>;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
