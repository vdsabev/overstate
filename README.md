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
    - [Return Changes](#return-changes)
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

Calling `store.model.down()` or `store.model.up()` updates the count and calls the function passed to `store.subscribe` with the new data.

For example, adding this code will increment the counter and render it every second:
```js
setInterval(store.model.up, 1000);
```

## API Reference
### `createStore`
Creates a store from a source object, deep copying all values and proxying all functions to call `store.update` when executed.

Can optionally receive a second argument to customize behavior:
```js
const store = createStore(model, {
  merge(target, source, createProxyFunction) {
    // Customize the way `source` is merged into `target`.
    // Don't forget to call `createProxyFunction` on functions to make them update the state automatically!
  },
  callFunction(fn, state, args) {
    // Customize the way functions are called.
    // If you prefer not to use `this`, you can change the
    // signature of your functions to `(state, ...args) => changes`
    // or even `(state) => (...args) => changes`
  }
});
```

<details>
  <summary>Custom merge</summary>
  <p>This function performs a shallow merge instead of the default deep merge:

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
```
  </p>
</details>

<details>
  <summary>Custom function calls<a name="custom-function-calls"></a></summary>
  <p>If you prefer using another format for your functions like (state, ...args):

```js
const store = createStore({
    count: 0,
    down: (state) => ({ count: state.count - 1 }),
    up: (state) => ({ count: state.count + 1 }),
    add: (state, value) => ({ count: state.count + value })
  }, {
  callFunction: (fn, state, args) => fn(state, ...args)
});
```

Or if you like (state) => (...args) more:
```js
const store = createStore({
    count: 0,
    down: (state) => () => ({ count: state.count - 1 }),
    up: (state) => () => ({ count: state.count + 1 }),
    add: (state) => (value) => ({ count: state.count + value })
  }, {
  callFunction: (fn, state, args) => fn(state)(...args)
});
```

Then, you can still call your functions the same way you normally would:
```js
store.model.add(5); // store.model.count === 5
store.model.up();   // store.model.count === 6
store.model.down(); // store.model.count === 5
```

If you're using TypeScript, be aware that this will mess with the type definitions, because we're changing the function signature!
  </p>
</details>

### `store.model`
An object composed of all values and proxied functions passed to `createStore`.

To call suscriptions when proxied, model functions should return (or resolve to) an object.

### `store.set`
Merges some data into the store model at the root level and calls `store.update`.

It's a built-in shortcut for this:
```js
const store = createStore({
  set(data) {
    return data;
  }
});
```

In that case, `store.set` will do the same thing as `store.model.set`.

### `store.subscribe`
Calls the passed function every time a model function that returns (or resolves to) an object is executed.

Returns an `unsubscribe` function that you can call to remove the subscription.

Tread lightly when rendering in subscriptions - they're not throttled or rate-limited in any way!

### `store.update`
Calls all subscriptions manually. You usually only do this once after creating the store.

## Features
### Return Changes
A wise man once said:

> **Return** the change that you wish to see in the world.

When you call a function that returns (or resolves to) an object, the data is **deeply merged** into the current model:
```js
const store =
    createStore({ a: 1, b: { c: 2, d: 3 }, set: (data) => data                                  });
store.model.set({       b: {       d: 4 },                      setA: (value) => ({ a: value }) });
// New model:  ({ a: 1, b: { c: 2, d: 4 }, set: (data) => data, setA: (value) => ({ a: value }) });
```

In this case, `set` allows changing any property of the model, while `setA` only allows changing the `a` property.

Functions are proxied to automatically call `store.update` if they return (or resolve to) an object when executed.

So if you call `store.model.setA(5)`, it will call `store.update` afterwards as well.

### Asynchronous Functions
Promises are supported out of the box - `store.update` is called after the promise resolves:
```js
export const CounterModel = {
  count: 0,
  async down() { // sweet async / await goodness 🍰
    const value = await Promise.resolve(-1); // Get the value from some remote server
    return { count: this.count + value });
  },
  up() { // ye olde promises 🧓
    return Promise.resolve(1).then((value) => ({ count: this.count + value });
  }
};
```

### Composition
You can put objects inside objects:
```js
export const ABCounterModel = {
  counterA: CounterModel,
  counterB: CounterModel
};
```

This allows you to build a hierarchical tree of data and functions.

### Lazy Loading
So you want to do [code splitting with webpack](https://webpack.js.org/api/module-methods/#import) and have functions from the imported modules automatically call `store.update` data when executed?

Here are a few ways to do it:

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

When the `import` promise resolves, the model's functions proxied from `CounterModel` will automatically call `store.update` when executed.
  </p>
</details>

<details>
  <summary>Using a function in the model</summary>

  <p>You shouldn't have to (and can't always) rely on the store being available. Encapsulating your models makes them decoupled from 3rd party libraries, which means they're easier to maintain and adaptable to flexible requirements.

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
store.model.lazy.loadChildModels();
```

The child models will be inserted into the model's data when the import is done.
  </p>
</details>

### TypeScript
Derpy is written in TypeScript, so if you use it you get autocomplete and type checking out of the box.

Going back to the [Counter](#counter) example:
```ts
store.model.up(5); // [ts] Expected 0 arguments, but got 1.
```

However, `this` doesn't get type definitions inside objects:
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
store.model.add('1'); // [ts] Argument of type '"1"' is not assignable to parameter of type 'number'.
```

### Arrow Functions
Be careful with those if you're using `this` inside your model functions - as expected, it would refer to the parent context. Because functions are proxied when the store is created, class methods defined as arrow functions won't refer to the correct `this` either.

### Rendering
For examples with different view layers, see [the CodePen collection](https://codepen.io/collection/DNdBBG).

Here's a counter example with [picodom](https://github.com/picodom/picodom):
```js
/** @jsx h */
import { app } from 'derpy/app/picodom';
import { h, patch } from 'picodom';
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
```

All functions in the model are bound to the correct context, so you can write `onclick={model.up}` instead of `onclick={() => model.up()}`.

The `app` function is a very thin layer on top of Derpy to reduce boilerplate.

You can pass a custom DOM element to render into as the second argument, which is `document.body` by default.

It also adds a `store.destroy()` method to unsubscribe from rendering, effectively "destroying" your app, although the store will still work just fine.

`app` uses `requestAnimationFrame` by default to throttle rendering. Alternatively, provide your own function in `app({ throttle: ... })`.

## FAQs
### Wait, I want to run this library on a potato, how big is it?
The [minified code](https://unpkg.com/derpy) is 1234 bytes, or 780 bytes gzipped.

### `this` is bad and you should feel bad 🦀
Hey, that's not a question! Anyway, if you don't like `this` and want to use `state` or something else, you can use the `callFunction` option when creating a store, [as described in this section](#custom-function-calls).

### So this is cool, where can I find out more?
I'm glad you asked! Here are some useful resources:
- Feel free to ask questions and file issues [right here in GitHub](https://github.com/vdsabev/derpy/issues)
- Browse the [CodePen collection](https://codepen.io/collection/DNdBBG)
- [Follow me on Twitter](https://twitter.com/vdsabev) for updates and random thoughts
