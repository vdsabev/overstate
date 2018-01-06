export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const isFunction = (value: any): value is Function => typeof value === 'function';

const isObject = (value: any): value is Object => value !== null && typeof value === 'object' && !Array.isArray(value);

export const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> => promise != null && isFunction((promise as Promise<T>).then);

// TODO: For class instances, perhaps proxy methods from `model.constructor.prototype`
export const merge = <U extends {}>(
  target: RecursivePartial<U>,
  source: RecursivePartial<U>,
  createProxyFunction?: Function
) => {
  if (!isObject(target)) {
    throw new Error(`Invalid merge target, expected an object, got ${JSON.stringify(target, null, 2)}`);
  }

  if (source != null) {
    getDeepProps(source).forEach((key) => {
      const sourceValue = (source as any)[key];
      // We need to go deeper.jpg
      if (isObject(sourceValue)) {
        if (!(target as any)[key]) {
          (target as any)[key] = {};
        }
        merge((target as any)[key], (source as any)[key], createProxyFunction);
      }
      else if (isFunction(sourceValue) && isFunction(createProxyFunction)) {
        (target as any)[key] = createProxyFunction(sourceValue, target);
      }
      // Set value
      else {
        (target as any)[key] = sourceValue;
      }
    });
  }

  return target;
};

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
