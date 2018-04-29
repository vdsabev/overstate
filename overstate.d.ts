// https://github.com/Microsoft/TypeScript/issues/2709#issuecomment-230182278
declare module 'rollup-plugin-*';

import { Store } from './store';

export interface AppOptions<T extends {}, R extends Function> {
  store: Store<T>;
  view(props: { model: T }): any;
  render: R;
  throttle?(fn: Function): any;
}
