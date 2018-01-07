[![npm version](https://badge.fury.io/js/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Downloads](https://img.shields.io/npm/dm/derpy.svg)](https://www.npmjs.com/package/derpy)
[![Build Status](https://travis-ci.org/vdsabev/derpy.svg)](https://travis-ci.org/vdsabev/derpy)
[![codecov](https://codecov.io/gh/vdsabev/derpy/branch/master/graph/badge.svg)](https://codecov.io/gh/vdsabev/derpy)
[![License](https://img.shields.io/npm/l/derpy.svg)](https://www.npmjs.com/package/derpy)

# Derpy
A silly little state manager 😋

## Table of Contents
- [Hello World](#hello-world)
- [Counter](#counter)
- [API Reference](#api-reference)
- [Features](#features)
    - [Deep Merge](#deep-merge)
    - [Asynchronous Functions](#asynchronous-functions)
    - [Composition](#composition)
    - [Lazy Loading](#lazy-loading)
    - [TypeScript](#typescript)
    - [Classes](#classes)
    - [Arrow Functions](#arrow-functions)
    - [Rendering](#rendering)
- [FAQs](#faqs)

## Hello World
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

Calling `store.model.setNameTo('😋')` anytime renders `"Hello 😋"` and so on.

## Counter
```js
import { createStore } from 'derpy';

const store = createStore({
  count: 0,
  down() {
    return { count: this.count - 1 };
  },
  up() {
    return { count: this.count + 1 };
  }
});

store.subscribe((model) => document.body.innerHTML = `Count: ${model.count}`);
store.update();
```

Calling `store.model.down()` or `store.model.up()` updates the count and calls the subscription function passed to `store.subscribe` with the new data.

For example adding this code will increment the counter and rerender every second:
```js
setInterval(store.model.up, 1000);
```

## API Reference
### `createStore`
Creates a store from a source object, deep copying all values and proxying all functions to call subscriptions when executed.

Can optionally receive a second argument to customize behavior:
```js
const store = createStore(model, { merge: customMergeFunction });
```

### `store.model`
The model is an object composed of all values and functions you passed to `createStore`. Calling `store.model.down()` or `store.model.up()` will automatically invoke all subscriptions created by `store.subscribe` calls.

All functions in the model are bound to the correct context, so you can write `onclick={model.up}` instead of `onclick={() => model.up()}`.

### `store.set`
Merges some data into the store model and calls `update`. Functions are proxied to update the state automatically when called.

### `store.subscribe`
`subscribe` is called automatically every time you invoke a model function that returns (or resolves to) an object.

The `store.subscribe` function returns an `unsubscribe` function that you can call to remove the subscription.

Tread lightly when rendering in subscriptions - they're not throttled or rate-limited in any way!

### `store.update`
Call `store.update()` to invoke all subscriptions manually. You usually only do this once after creating the store.

## Features
### Deep Merge
Whatever you return from your functions is *deeply merged* into the current data, preventing you from inadvertently changing data you didn't mean to. For example:
```js
const store = createStore({ a: { aa: 1, bb: 2 }, b: { aa: 3, bb: 4 } });
store.set({                 a: { aa: 5        }, b: { aa: 6        } });
// The model data is now ({ a: { aa: 5, bb: 2 }, b: { aa: 6, bb: 4 } });
```

`store.set` is a useful built-in shortcut for this:
```js
const store = createStore({
  set(data) {
    return data;
  }
});
// In this case, `store.set` will do the same thing as `store.model.set`
```

Merging can be customized to fit your application's needs.

<details>
  <summary>Custom merge</summary>
  <p>
    Pass a merge function as an option when creating your store:

```js
const store = createStore(model, {
  merge(target, source, createProxyFunction) {
    for (let key in source) {
      if (typeof source[key] === 'function') {
        // Proxy functions so they automatically resolve promises and update state
        target[key] = createProxyFunction(source[key], target);
      }
      else {
        target[key] = source[key]; // Yay, shallow merge! 🎉
      }
    }
    return target;
  }
});
// You're never happy with what you get for free, are you? 😞
```
  </p>
</details>

### Asynchronous Functions
Promises are supported out of the box - subscriptions are called after the promise resolves, so async programming is as simple as it can be:
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

### Composition
You can put objects inside objects, y'all:
```js
// we have to go deeper.jpg
export const ABCounterModel = {
  counterA: CounterModel,
  counterB: CounterModel
};
```

This allows you to build the data tree of your dreams! 🌳🦄

### Lazy Loading
So you want to do [code splitting with webpack](https://webpack.js.org/api/module-methods/#import), or put some values and functions in the model at some later point and have the functions automatically update data when called? Here are a couple of ways to do it:

<details>
  <summary>Using the store directly</summary>
  <p>

```js
const store = createStore();

// Get a named export
import('./counter-model').then((exports) => store.set({ counter: exports.CounterModel }));
// Get multiple named exports
import('./another-model').then((exports) => store.set({ A: exports.ModelA, B: exports.ModelB }));
// Get default export
import('./yet-another-model').then((exports) => store.set({ C: exports.default }));
// Get all exports
import('./utils-model').then((exports) => store.set({ utils: exports }));
```

    When the `import` promise resolves, the model's functions proxied from `CounterModel` will automatically be able to update the data and invoke all subscriptions when called.
  </p>
</details>

<details>
  <summary>Using a function in the model</summary>

  <p>
    You shouldn't have to (and can't always) rely on the store being available. Encapsulating your models makes them decoupled from 3rd party libraries, which means they're easier to maintain and adaptable to flexible requirements.

    So to lazy load data without touching the store, you can do this:

```js
export const LazyLoadedModel = {
  set(data) {
    return data;
  },
  loadChildModels() {
    // Get a named export
    import('./counter-model').then((exports) => this.set({ counter: exports.CounterModel }));
    // Get multiple named exports
    import('./another-model').then((exports) => this.set({ A: exports.ModelA, B: exports.ModelB }));
    // Get default export
    import('./yet-another-model').then((exports) => this.set({ C: exports.default }));
    // Get all exports
    import('./utils-model').then((exports) => this.set({ utils: exports }));
  }
};
```

    Then define your store and load the models:

```js
const store = createStore({ lazy: LazyLoadedModel });
loadmodel.lazy.loadChildModels();
```

    The child models will be inserted into the model's data when the import is done.
  </p>
</details>

<details>
  <summary>Using a utility function</summary>

  <p>
    Defining a set function and messing with promises can get a little repetitive, so here's a utility function instead:

```js
export async function importModel(moduleName, properties) {
  const moduleExports = await import(moduleName);

  // Set all exports directly into the model, not in a subproperty
  if (!properties) return moduleExports;

  // All exports
  if (typeof properties === 'string') return { [properties]: moduleExports };

  // Some named exports (including default)
  return Object.keys(properties).reduce((exports, key) => {
    exports[key] = moduleExports[properties[key]];
    return exports;
  }, {});
}
```

Then when defining your model:

```js
export const LazyLoadedModel = {
  import: importModel,
  loadChildModels() {
    // Get a named export
    this.import('./counter-model', { counter: 'CounterModel' });
    // Get multiple named exports
    this.import('./another-model', { A: 'ModelA', B: 'ModelB' });
    // Get default export
    this.import('./yet-another-model', { C: 'default' });
    // Get all exports
    this.import('./utils-model', 'utils');
  }
```
  </p>
</details>

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

The `app` function is a very thin layer on top of Derpy to reduce boilerplate. It also adds a custom `store.destroy()` method to unsubscribe from rendering, effectively "destroying" your app, although the store will work just the same.

Calling `app` uses `requestAnimationFrame` by default to throttle rendering. Alternatively, provide your own function in `app({ throttle: ... })`. Look at you, smartypants! 🦉

## FAQs
### So this is cool, where can I find out more?
I'm glad you asked! Here are some useful resources:
- Feel free to ask questions and file issues [right here in GitHub](https://github.com/vdsabev/derpy/issues)
- Browse the [CodePen collection](https://codepen.io/collection/DNdBBG)
- [Follow me on Twitter](https://twitter.com/vdsabev) for updates and random thoughts

### Wait, I want to run this library on a potato, how big is it?
Always going on about size, are you? Well, [the minified code](https://unpkg.com/derpy) is 1234 bytes, or 769 bytes gzipped. I hope you're happy.

I think we all know why you're so obsessed with size though, and we're secretly laughing at you.

### This code offends me and my cat
Hey, this isn't a question! Don't you have something better to be upset about, like global puberty or senseless acts of violins?
