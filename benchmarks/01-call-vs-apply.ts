import * as Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

const x = { y: (a?: number, b?: number, c?: number) => a + b + c };
const abc = [1, 2, 3];

suite.add('direct', () => {
  x.y(...abc);
});

suite.add('call', () => {
  x.y.call(x, ...abc);
});

suite.add('apply', () => {
  x.y.apply(x, abc);
});

suite.on('cycle', (event: any) => {
  console.log(String(event.target));
});

suite.on('complete', () => {
  console.log(`Fastest: ${suite.filter('fastest').map('name' as any)}`);
});

suite.run({ async: true });
