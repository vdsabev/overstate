export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export const isFunction = (value: any): value is Function => typeof value === 'function';

export const isObject = <T = Object>(value: any): value is T =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const isPromise = <T>(promise: Promise<T> | T | null | undefined | void): promise is Promise<T> =>
  promise != null && isFunction((promise as Promise<T>).then);

export interface Merge {
  <U extends Record<string, any>>(
    target: RecursivePartial<U>,
    source: RecursivePartial<U>,
    createProxyFunction?: Function,
  ): RecursivePartial<U>;
}

// TODO: For class instances, perhaps proxy methods from `model.constructor.prototype`
/**
 * Recursively merges a source object into a target object.
 * Optionally, functions can be proxied, e.g. to update the store when called.
 */
export const merge: Merge = (target, source, createProxyFunction) => {
  if (!isObject(target)) {
    throw new Error(`Invalid merge target, expected an object, got ${JSON.stringify(target, null, 2)}`);
  }

  if (source != null) {
    getAllProps(source).forEach((key) => {
      // TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed
      // on strict mode functions or the arguments objects for calls to them
      if ((isFunction(source) && key === 'caller') || key === 'callee' || key === 'arguments') return;

      const sourceValue = source[key];
      // We need to go deeper.jpg
      if (isObject(sourceValue)) {
        if (!target[key]) {
          target[key] = {};
        }
        merge(target[key], source[key], createProxyFunction);
      } else if (isFunction(sourceValue) && isFunction(createProxyFunction)) {
        target[key] = createProxyFunction(sourceValue, target);
      } else {
        // Set value
        target[key] = sourceValue;
      }
    });
  }

  return target;
};

/**
 * Gets all properties of an object, including inherited from prototype
 * @see https://stackoverflow.com/questions/30881632/es6-iterate-over-class-methods
 */
export const getAllProps: AllProps = (x): string[] =>
  (x != null &&
    x !== Object.prototype && [
      ...Object.getOwnPropertyNames(x).filter(notConstructor),
      ...getAllProps(Object.getPrototypeOf(x)),
    ]) ||
  [];

const notConstructor = (key: string) => key !== 'constructor' && key !== 'prototype';

export interface AllProps {
  <T extends {} = {}>(x: T): string[];
}
