export const isFunction = (value: any): value is Function => typeof value === 'function';

export const isObject = (value: any): value is Object => value !== null && typeof value === 'object' && !Array.isArray(value);

export const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> => promise != null && isFunction((promise as Promise<T>).then);
