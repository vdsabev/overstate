type Machine<T extends {}> = State<T> & {
  transition(action: string): State<T>; // TODO: Type
};

type State<T extends {}> = Record<keyof T, boolean>;

const reservedStateKeys = ['transition'];

export const createMachine = <T extends {}>(initialStateKey: keyof T, transitions: T): Machine<T> =>
  Object.assign({
    initialState: getInitialState(initialStateKey, transitions),
    transition: transition(transitions),
  });

const getInitialState = <T extends {}>(initialStateKey: keyof T, transitions: T) =>
  Object.keys(transitions).reduce(
    (state, key) => {
      if (reservedStateKeys.indexOf(key) !== -1) {
        throw new Error(`Reserved state key used: ${key}!`);
      }

      (state as any)[key] = key === initialStateKey;
      return state;
    },
    {} as State<T>
  );

const transition = <T extends {}>(transitions: T) => (action: string): State<T> =>
  Object.keys(transitions).reduce(
    (state, key) => {
      if (reservedStateKeys.indexOf(key) === -1) {
        (state as any)[key] = (transitions as any)[key][action] === key;
      }
      return state;
    },
    {} as State<T>
  );
