import * as Benchmark from 'benchmark';
import { createStore } from '../index';

const suite = new Benchmark.Suite();

const store = createStore({
  a: 0,
  b: {
    aa: 0,
    bb: 0
  },
  c: () => {},
  set(data: any) {
    return data;
  }
});

suite.add('set number', () => {
  store.model.set({ a: store.model.a + 1 });
});

suite.add('set number deep', () => {
  store.model.set({ b: { bb: store.model.b.bb + 1 } });
});

suite.add('set function', () => {
  store.model.set({ c: () => {} });
});

suite.on('cycle', (event: any) => {
  console.log(String(event.target));
});

suite.run({ async: true });
