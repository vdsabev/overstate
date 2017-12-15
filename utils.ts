export const isFunction = (value: any): boolean => typeof value === 'function';

export const isObject = (value: any): boolean => value !== null && typeof value === 'object' && !Array.isArray(value);
