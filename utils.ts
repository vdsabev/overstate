export const isFunction = (value: any): boolean => typeof value === 'function';

export const isObject = (value: any): boolean => value !== null && typeof value === 'object' && !Array.isArray(value);

export const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> => promise != null && isFunction((promise as Promise<T>).then);
