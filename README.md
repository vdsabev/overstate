[![npm version](https://badge.fury.io/js/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Downloads](https://img.shields.io/npm/dm/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Build Status](https://travis-ci.org/vdsabev/derpy.svg)](https://travis-ci.org/vdsabev/derpy)
[![codecov](https://codecov.io/gh/vdsabev/derpy/branch/master/graph/badge.svg)](https://codecov.io/gh/vdsabev/derpy)
[![License](https://img.shields.io/npm/l/derpy.svg)](https://www.npmjs.com/package/derpy)

# Derpy
A silly little state manager 😋

# How do I use this thing?
First, define the properties and functions of your app:
```js
export const CounterModel = {
  count: 0,
  down() {
    return { count: this.count - 1 };
  },
  up() {
    return { count: this.count + 1 };
  }
};
```

Then create a store:
```js
import { createStore } from 'derpy';
import { CounterModel } from './counter-model';

const store = createStore(CounterModel);
const unsubscribe = store.subscribe((model) => {
  // Do whatever you want with your data
});
// Call `unsubscribe()` to get rid of the subscription
```

You can pass the model to your view and call `model.down()` or `model.up()` anywhere. The functions are bound to the correct context, so you can write `onclick={model.up}` instead of `onclick={() => model.up()}`. When called, these functions automatically invoke the listeners in `store.subscribe`.

## Rendering
Be careful - `subscribe` is called every time you invoke a model function that returns a non-null value, and does not currently throttle or rate limit that in any way! So use `requestAnimationFrame` when rendering, folks 🦉

For more examples, complete with a view layer, see [the CodePen collection](https://codepen.io/collection/DNdBBG).

## Deep Merge
Let's upgrade to multiple counters:
```js
import { CounterModel } from './counter-model';

export const ABCounterModel = {
  a: CounterModel,
  b: CounterModel,
  down() {
    return {
      a: { count: this.a.count - 1 },
      b: { count: this.b.count - 1 }
    };
  },
  up() {
    return {
      a: { count: this.a.count + 1 },
      b: { count: this.b.count + 1 }
    };
  }
};
```

In this case, the child counters A and B will keep the rest of their properties - whatever you return from your functions is *deeply merged* into the current data, preventing you from inadvertently changing data you didn't mean, or having to write this:
```js
up() {
  return {
    a: { ...this.a, count: this.a.count + 1 },
    b: { ...this.b, count: this.b.count + 1 }
    // we have to go deeper.jpg
  };
}
```

If you need more control over how data gets merged, use your own merge function:
```js
// You're never happy with what you get for free, are you? 😞
const store = createStore(ABCounterModel, { merge: Object.assign });
```

## Asynchronous Functions
Promises are supported out of the box - changes in state will be reflected after the promise resolves, so async programming is as simple as it can be:
```js
export const CounterModel = {
  count: 0,
  async down() { // sweet async/await goodness 🍰
    const value = await Promise.resolve(-1); // Get the value from some remote server
    return { count: this.count + value });
  },
  up() { // ye olde promises 🧓
    return Promise.resolve(1).then((value) => ({ count: this.count + value });
  }
};
```

## TypeScript
Derpy is written in TypeScript, so if you use it you get autocomplete and type checking out of the box when calling model functions:
```ts
model.up(5); // [ts] Expected 0 arguments, but got 1.
```

However, `this` doesn't work as well inside objects:
```ts
export const CounterModel = {
  count: 0,
  add(value: number) {
    return { count: this.count + value }; // Hmm, `this` is of type `any` here 😕
  }
};
```

And we can't do `add(this: typeof CounterModel, value: number)` either, because we're referencing an object inside its own definition.

## Classes
To get type safety inside your models, or if you just prefer to, you can use classes instead:
```ts
export class CounterModel {
  count = 0;
  add(value: number) { // or `add(value) {` if you don't use TypeScript
    return { count: this.count + value }; // Yay, `this` is of type `CounterModel` 😄
  }
};
```

And then when creating your store:
```ts
const store = createStore(new CounterModel());
```

## Arrow Functions
Be careful with those if you're using `this` inside your model functions - as expected, it would refer to the parent context. Anonymous functions also might not work with classes very well.

# Other FAQs
## So this is cool, where can I find out more?
I'm glad you asked! Here are some useful resources:
- Feel free to ask questions and file issues right here in GitHub
- [Join the Slack channel](https://join.slack.com/t/derpyjs/shared_invite/enQtMjg3NzM0OTI3NDQzLTVkMGQ0YmQyNmEwZmFlYTJjYjUyNTgwNGM4NjhiYjg4YjNiYmNhNTY4ZWYxYjY2MzgzM2E3ZWQ4MzU5YjhhMzI)
- Browse the [CodePen collection](https://codepen.io/collection/DNdBBG)
- [Follow me on Twitter](https://twitter.com/vdsabev) for updates and random thoughts

## Wait, how big is it?
Always going on about size, are you? Okay, [the minified code](https://unpkg.com/derpy) is around 1.4KB, or 800 bytes gzipped. I hope you're happy now.

## This code offends me and my cat
Hey, this isn't a question! Don't you have something better to be upset about, like global puberty or senseless acts of violins?
