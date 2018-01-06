[![npm version](https://badge.fury.io/js/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Downloads](https://img.shields.io/npm/dm/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Build Status](https://travis-ci.org/vdsabev/derpy.svg)](https://travis-ci.org/vdsabev/derpy)
[![codecov](https://codecov.io/gh/vdsabev/derpy/branch/master/graph/badge.svg)](https://codecov.io/gh/vdsabev/derpy)
[![License](https://img.shields.io/npm/l/derpy.svg)](https://www.npmjs.com/package/derpy)

# Derpy
A silly little state manager 😋

## Table of Contents
1. [Hello World](#how-do-i-use-this-thing)
2. [Store API](#whats-going-on-here)
3. [Features](#features)
    1. [Composition](#composition)
    2. [Asynchronous Functions](#asynchronous-functions)
    3. [Deep Merge](#deep-merge)
    4. [Shallow Merge](#shallow-merge)
    5. [TypeScript](#typescript)
    6. [Classes](#classes)
    7. [Arrow Functions](#arrow-functions)
    8. [Rendering](#rendering)
4. [FAQs](#faqs)

## How do I use this thing?
```js
import { createStore } from 'derpy';

const store = createStore({
  name: 'World',
  setNameTo(aNewName) {
    return { name: aNewName };
  }
});

store.subscribe((model) => document.body.innerHTML = `Hello ${model.name}`);
store.update();
```

Calling `store.update()` initially renders `"Hello World"`.

Calling `store.model.setNameTo('😋')` anywhere in your application renders `"Hello 😋"`, and so on.

## What's going on here?
Let's go through another example.

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
```

### store.model
The model is an object composed of all values and functions you passed to `createStore`. Calling `store.model.down()` or `store.model.up()` will automatically invoke all subscriptions created by `store.subscribe` calls.

All functions in the model are bound to the correct context, so you can write `onclick={model.up}` instead of `onclick={() => model.up()}`.

### store.subscribe
`subscribe` is called automatically every time you invoke a model function that returns a non-null value.

The `store.subscribe` function returns an `unsubscribe` function which you can call at any time to remove the subscription.

Tread lightly when rendering in subscriptions - they're not throttled or rate-limited in any way!

### store.update
Call `store.update()` to invoke all subscriptions manually. You usually only do this once after creating the store.

## Features
### Composition
You can put models inside models, y'all:
```js
// we have to go deeper.jpg
export const ABCounterModel = {
  a: CounterModel,
  b: CounterModel
};
```

This allows you to build the data tree of your dreams! 🌳🦄

### Asynchronous Functions
Promises are supported out of the box - subscriptions will be called after the promise resolves, so async programming is as simple as it can be:
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

### Arrow Functions
Be careful with those if you're using `this` inside your model functions - as expected, it would refer to the parent context. Class methods defined as arrow functions might not work very well with Derpy either.

### Rendering
You can render the model in endless shapes most beautiful 💅
For examples with different view layers, see [the CodePen collection](https://codepen.io/collection/DNdBBG).

You probably want to put your data on a piece of glowing glass and become a gazillionaire overnight, right? Well, we all know the best way to do that is to write a counter app. Here's an example with [picodom](https://github.com/picodom/picodom):
```js
/** @jsx h */
import { app } from 'derpy/app/picodom';
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

The `app` function is a very thin layer on top of Derpy to reduce boilerplate if you use [picodom](https://github.com/picodom/picodom) or a similar library. It also adds a custom `store.destroy()` method to unsubscribe from rendering, effectively "destroying" your app, although the store will work just the same.

Calling `app` uses `requestAnimationFrame` by default to throttle rendering. Alternatively, provide your own function in `app({ throttle: ... })`. Look at you, smartypants! 🦉

## FAQs
### So this is cool, where can I find out more?
I'm glad you asked! Here are some useful resources:
- Feel free to ask questions and file issues [right here in GitHub](https://github.com/vdsabev/derpy/issues)
- Browse the [CodePen collection](https://codepen.io/collection/DNdBBG)
- [Follow me on Twitter](https://twitter.com/vdsabev) for updates and random thoughts

### Wait, I want to run this library on a potato, how big is it?
Always going on about size, are you? Well, [the minified code](https://unpkg.com/derpy) is around 1.4KB, or 836 bytes gzipped. I hope you're happy.

No? If you really want to go all the way down in size, you can import individual files like `derpy/store` directly and see if that helps you. I think we all know why you're so obsessed with size though, and we're secretly laughing at you.

### This code offends me and my cat
Hey, this isn't a question! Don't you have something better to be upset about, like global puberty or senseless acts of violins?
