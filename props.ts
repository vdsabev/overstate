// https://stackoverflow.com/questions/30881632/es6-iterate-over-class-methods
export const getDeepProps: DeepProps = <T extends {}>(x: T): string[] => (
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

export interface DeepProps<T extends {} = {}> {
  (x: T): string[];
}
