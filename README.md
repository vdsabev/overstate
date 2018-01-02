[![npm version](https://badge.fury.io/js/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Downloads](https://img.shields.io/npm/dm/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Build Status](https://travis-ci.org/vdsabev/derpy.svg)](https://travis-ci.org/vdsabev/derpy)
[![codecov](https://codecov.io/gh/vdsabev/derpy/branch/master/graph/badge.svg)](https://codecov.io/gh/vdsabev/derpy)
[![License](https://img.shields.io/npm/l/derpy.svg)](https://www.npmjs.com/package/derpy)

# Derpy
A silly little state manager 😋

## How do I use this thing?
### Model
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

### Store
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

Tread lightly - `subscribe` is called every time you invoke a model function that returns a non-null value, and does not throttle or rate limit that in any way!

### Rendering
Okay, what you probably want is to put your data on a piece of glowing glass and become a gazillionaire overnight, right? And we all know the best way to do that is to write a counter app:
```js
/** @jsx h */
import { app } from 'derpy';
import { h, patch } from 'picodom'; // or whatever VDOM goddess you worship
import { CounterModel } from './counter-model';

const store = app({
  patch,
  model: CounterModel,
  view: ({ model }) =>
    <div>
      Your count is: {model.count}
      <button onclick={model.down}>-</button>
      <button onclick={model.up}>+</button>
    </div>
});
// Or `app({...}, container);` - you can pass a custom DOM
// element to render into, otherwise it's `document.body`.
// ...
// You're welcome. Remember I helped you get rich 💰
```

Basically, the `patch` function should update its container's content with the result of the `view` function. You can use whatever VDOM library you like, or write your own function to set the container's `innerHTML` for all I care.

The `app` function uses `requestAnimationFrame` by default to throttle rendering. Alternatively, you can provide your own function to do that in `app({ throttle: ... })`. Look at you, smartypants! 🦉

For more examples with different view layers, see [the CodePen collection](https://codepen.io/collection/DNdBBG).

### Asynchronous Functions
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

### TypeScript
Derpy is written in TypeScript, so if you use it you get autocomplete and type checking out of the box when calling model functions:
```ts
store.model.up(5); // [ts] Expected 0 arguments, but got 1.
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

So...read on.

### Classes
To get type safety inside your models, or if you just prefer to, you can use classes instead of objects:
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

Behold:
```ts
store.model.add('1'); // [ts] Argument of type '"1"' is not assignable to parameter of type 'number'.
// magic.gif
```

### Composition
You can put models inside models, y'all:
```js
// we have to go deeper.jpg
export const ABCounterModel = {
  a: CounterModel,
  b: CounterModel
};
```

### Deep Merge
Let's upgrade to multi-level actions:
```js
export const WeatherModel = {
  arctic: { low: 0, high: 0 }, // ❄
  mordor: { low: 1000, high: 1000 }, // 🔥
  coolerLows() {
    return {
      arctic: { low: this.arctic.low - 100 },
      mordor: { low: this.mordor.low - 1000 }
    };
  },
  hotterHighs() {
    return {
      arctic: { high: this.arctic.high + 100 },
      mordor: { high: this.mordor.high + 1000 }
    };
  }
};
```

In this case, after calling `coolerLows` or `hotterHighs` the child objects `arctic` and `mordor` will keep the rest of their properties. Whatever you return from your functions is *deeply merged* into the current data, preventing you from inadvertently changing data you didn't mean to, or having to write this:
```js
hotterHighs() {
  return {
    arctic: { ...this.arctic, high: this.arctic.high + 100 },
    mordor: { ...this.mordor, high: this.mordor.high + 1000 }
    //        ^^^ nope, don't spread your objects
    //            we don't have to go deeper.jpg
  };
}
```

### Shallow Merge
If you need more control over how data gets merged, use your own merge function:
```js
const store = createStore(ABCounterModel, { merge: Object.assign });
// You're never happy with what you get for free, are you? 😞
```

### Arrow Functions
Be careful with those if you're using `this` inside your model functions - as expected, it would refer to the parent context. Class methods defined as arrow functions might not work very well with Derpy either.

## Other FAQs
### Can I do funky stuff like return new actions dynamically, for code splitting and whatnot?
It's on the roadmap, which means I thought about doing it once, but was too lazy to write it myself. Care to make a pull request?

### So this is cool, where can I find out more?
I'm glad you asked! Here are some useful resources:
- Feel free to ask questions and file issues [right here in GitHub](https://github.com/vdsabev/derpy/issues)
- Browse the [CodePen collection](https://codepen.io/collection/DNdBBG)
- [Follow me on Twitter](https://twitter.com/vdsabev) for updates and random thoughts

### Wait, I want to run this library on a potato, how big is it?
Always going on about size, are you? Well, [the minified code](https://unpkg.com/derpy) is around 1.7KB, or 953 bytes gzipped. I hope you're happy.

No? If you really want to go all the way down in size, you can import individual files like `derpy/store` directly and see if that helps you. I think we all know why you're so obsessed with size though, and we're secretly laughing at you.

### This code offends me and my cat
Hey, this isn't a question! Don't you have something better to be upset about, like global puberty or senseless acts of violins?
