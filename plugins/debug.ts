import { Store, StoreSet } from '../store';

export type Debug<T extends {}> = T & {
  debug?: TimeTravelDebugging<T>
};

export class TimeTravelDebugging<T extends {}> {
  isInternalAction: boolean;
  history: string[] = [];
  currentHistoryIndex = -1;
  unsubscribe?: () => void;

  subscribe(store: Store<T>): Partial<TimeTravelDebugging<T>> {
    return {
      unsubscribe: store.subscribe(({ ttd, ...model }: any) => {
        if (!this.isInternalAction) {
          this.history.push(JSON.stringify(model));
          this.currentHistoryIndex += 1;
        }
        this.isInternalAction = false;
      })
    };
  }

  previous(set: StoreSet<T>) {
    if (this.currentHistoryIndex === 0) return;

    this.isInternalAction = true;
    this.currentHistoryIndex -= 1;
    set(JSON.parse(this.history[this.currentHistoryIndex]));
  }

  next(set: StoreSet<T>) {
    if (this.currentHistoryIndex === this.history.length - 1) return;

    this.isInternalAction = true;
    this.currentHistoryIndex += 1;
    set(JSON.parse(this.history[this.currentHistoryIndex]));
  }
}
