---
title: Functional Promises - API Documentation

# language_tabs: # must be one of https://git.io/vQNgJ
#   - javascript

toc_footers:
  - <a class='social github' href='https://github.com/justsml/functional-promises'>Star on GitHub</a>
  - <a class='bottom' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>

# includes:
#   - errors

search: true
---

# Functional Promises

###### [View `Functional Promises` on Github](https://github.com/justsml/functional-promises)

> <p style='text-align: center;'><strong style='font-size: 19px;'>Examples of Awesome Shit</strong></p>

> Array-style methods are built-in:

```javascript
FP.resolve(['1', '2', '3', '4', '5'])
  .map(Number)
  .filter(x => x % 2 === 0)
  .then(results => {
    assert.deepEqual(results, [2, 4])
  })

```

> Create re-usable sequences of functions with `.chain()`.

```javascript
const squareAndFormatDecimal = FP
  .chain()
  .concurrency(4)
  .map(x => x * x)
  .concurrency(2)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd() // returns function

squareAndFormatDecimal([5, 10, 20])
  .then(num => assert.deepEqual(num, ['25.00', '100.00', '400.00']))
```

> Use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) with `FP.thenIf()` to handle `response.ok === false` with custom response.

```javascript
// Wrap `fetch`'s return Promise with `FP.resolve()` to use `FP`'s methods
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf( // thenIf lets us handle branching logic
    res => res.ok, // Check if response is ok
    res => res.json(), // if true, return the parsed body
    res => ({avatar: '/no-photo.svg'})) // fail, use default object
  .get('avatar') // Get the resulting objects `avatar` value
  .then(avatarUrl => imgElement.src = avatarUrl)
```

> `FP.thenIf()` replaces the `if` branching code here:

```javascript
// Non-FP, Native Promises:
fetch('/profile', {method: 'GET'})
  .then(res => {
    if (res.ok) {
      return res.json();
     } else {
      return {avatar: '/no-photo.svg'}
     }
  })
  .then(data => data.avatar)
  .then(avatarUrl => imgElement.src = avatarUrl)
```



[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/functional-promises.svg?style=flat)](https://github.com/justsml/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/justsml/functional-promises.svg?label=Stars&style=flat)](https://github.com/justsml/functional-promises)

### Summary

**Functional Promises** are an extension of the native Promises API (`.then()`/`.catch()`).

**Core features:** Array Methods, Events, Object & Array `FP.all()` Resolution, Re-usable Function Chains, Conditional/Branching Logic, Concurrency, Smart Error Handling.

**Why not simply use [library X]?**

* RxJS: `FP` is 1/5th the size. _Observable support still being evaluated._
* Bluebird: `FP` adds some key features: _events_, _conditionals_, _chains_, _quiet errors_. (Disclaimer: I'm a contributor, with a low PR acceptance ratio. 😿)

`FP`'s NodeJS source is **only ~300 lines of code.**
The **browser bundle** weighs in at **~30Kb** (using Webpack+Babel+Rollup+UglifyJS).

### Library Comparison

| Library                     	| # Files 	| # Lines Code 	 | **Browser** Bundle Kb
|------------------------------	|---------: |--------------: |-------------------:
| **Functional Promise v1.4** 	|       8 	|          376 	 | 30 Kb
| Bluebird v3.5.1             	|      38 	|         5,188 	 | 80 Kb
| RxJS v6.0.0-Alpha2          	|     456 	|        12,084 	 | (v5.5.6) 150 Kb
| IxJS v2.3.4                 	|     521 	|        12,366 	 | 145 Kb


So `FP` is roughly **1/30th** the lines of code in `IxJs`. And it's bundle size is almost **1/5th** the size. `IxJS`/`RxJS` also feature a far more expansive API.

BluebirdJS and FP have roughly the same number of API methods, yet Bluebird has a fair bit more code to sort through.

<p><b>To be clear:</b> Bluebird, RxJS and IxJS are amazing.</p>

<p>Their patterns have clearly been influential on `FP`'s design.</p>

<p><code>IxJS</code>'s modular design also allows for bundle sizes to potentially be smaller (using quite different syntax).</p>

<div style="clear: both;"></div>

### API Outline


All `.then()`-derived methods are listed first. It's the bulk of the API.

* [Thenable Methods](#thenable-methods)
    * [Arrays](#160-160-array-methods)
        * `.map(fn)`
        * `.filter(fn)`
        * `.find(fn)`
        * `.findIndex(fn)`
        * `.some(fn)`
        * `.none(fn)`
        * `.series(fn)`
        * `.forEach(fn)` - use `.map()` instead (write _proper_ `functions`)
    * [Errors](#160-160-errors) _(WIP)_
        * `.catch(fn)`
        * `.catch(filter, fn)`
    * [Conditional](#160-160-conditional)
        * `.thenIf()`
    * [Utilities](#160-160-utilities)
        * `.tap(fn)`
    * [Properties](#160-160-properties)
        * `.get(keyName)`
        * `.set(keyName, value)`
* [Specialty Methods](#specialty-methods)
    * [Helpers](#160-160-helpers)
        * `FP.resolve()`
        * `FP.all(Object/Array)`
        * `FP.unpack()`
    * [Events](#160-160-events)
        * `.listen(obj, ...eventNames)`
    * [Composition Pipelines](#160-160-composition-pipelines)
        * `FP.chain()`
        * `.chainEnd()`
    * [Modifiers](#160-160-modifiers)
        * `.quiet()` - prevents errors from stopping array methods mid-loop
        * `.concurrency(threadLimit)` - limits parallel workers for array methods

# Thenable Methods

You can think of most `FP` methods as **wrappers derived from Native Promise's `.then()`.**

For example, `.tap(fn)`'s function will receive the resolved value exactly like a `.then()`. Except the function's `return` value will be ignored - and the next `thenable` in the chain will get the original input.

A `.catch()` is another type of `thenable`! It works because an Error in a Promise will cause it to skip or "surf" over `thenables` until it finds a special `thenable`: `.catch()`. It then takes that Error value and passes it into the function. `.catch(err=>{log(err.message)})`

See all `thenable` methods in `FP`: Arrays, Errors, Conditional, Utilities, Properties, etc.

# &#160;&#160; Array Methods

Any `.then()` which would handle an array, may instead use one of the `FP` array methods.

## `FP.map(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, Promise.resolve(5)])
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })
```

Similar to `Array.prototype.map((item[, index, array]) => {})`.

**Use to transforms an array of values, passing each through the given function.**

The return value will be a new array containing the result for each call to `fn(item)`.


For example, let's say you have to multiply a list of numbers by 2.

Using `FP.map()` to do this lets you focus on the important logic: `x => x * 2`


## `FP.filter(iterable, fn)`

```javascript
FP.resolve([1, null, 3, null, 5])
  .filter(Boolean)
  .then(results => assert.deepEqual(results, [1, 3, 5]))

// Or similarly:
FP.resolve([1, null, 3, null, 5])
  .filter(value => value ? true : false)
  .then(results => assert.deepEqual(results, [1, 3, 5]))
```

Use `.filter()` to omit items from the input array by passing through a given function. Items will be omitted if the function returns a falsey value.

<aside class="notice">
  The <code>Boolean</code> type can be used as a truthiness check. For example: <code>assert.equal(Boolean(1), true)</code>, <code>assert.equal(Boolean(false), false)</code>, <code>assert.equal(Boolean(null), false)</code>.
</aside>

## `FP.find(iterable, fn)`

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .find(isEven)
  .then(results => {
    assert.deepEqual(results, 2)
  })
```

Returns first item to return truthy for `fn(item)`

If no match is found it will return `undefined`.

## `FP.findIndex(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
  .findIndex(isEven)
  .then(results => {
    assert.equal(results, 1)
  })
```

Returns first **item's index** to return truthy for `fn(item)`

If no match is found it will return `-1`.

## `FP.some(iterable, fn)`

```javascript
FP.resolve([1, 2, 4])
  .some(isEven)
  .then(results => {
    assert.equal(results, true)
  })
```

Returns `Promise<true>` on the first **item** to return truthy for `fn(item)`

If no truthy result is found, `.some()` returns `Promise<false>`.

## `FP.none(iterable, fn)`

```javascript
FP.resolve([1, 2, 4])
  .some(isEven)
  .then(results => {
    // Will return true:
    assert.equal(results, true)
  })
```

Returns `Promise<false>` on the first **item** to return falsey for `fn(item)`

If no match is found it will return `Promise<true>`.




# &#160;&#160; Conditional

## `FP.thenIf()`

`.thenIf(condition(value), ifTrue(value), ifFalse(value))`

> Use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) with `FP.thenIf()` to handle when `response.ok === false` using custom response.

```javascript
// Wrap `fetch`'s returned Promise with `FP.resolve()` - enables `FP`'s methods
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf( // thenIf lets us handle branching logic
    res => res.ok, // Check if response is ok
    res => res.json(), // if true, return the parsed body
    res => ({avatar: '/no-photo.svg'})) // fail, use default object
  .get('avatar') // Get the resulting objects `avatar` value
  .then(avatarUrl => imgElement.src = avatarUrl)
```

> Email 'validator'

```javascript
// Use like so:
FP.resolve(email)
  .thenIf(
    e => e.length > 5, // Conditional
    e => console.log('Valid: ', e), // ifTrue
    e => console.error('Bad Email: ', e)) // ifFalse
```

#### Arguments

* `condition`, echo/truthy function: `(x) => x`
* `ifTrue`, echo function: `(x) => x`
* `ifFalse`, quiet function: `() => null`

The `condition` function should return either `true`/`false` or a promise that resolves to something `true`/`false`.

`ifTrue` function is called if the `condition` resulted in a truthy value. Conversely, `ifFalse` will be called if we got a false answer.

The return value of either `ifTrue`/`ifFalse` handler will be handed to the next `.then()`.

Default values let you call `.thenIf` with no args - if you simply want to exclude falsey values down the chain.


> Functional Promise Login Flow

```javascript
// Check if login successfully returned a token:
const authUser = (email, pass) => FP
  .resolve({email, pass})
  .then(({email, pass}) => svc.loginGetUser(email, pass))
  .thenIf(
    user => user.token, // is valid login
    user => user, // return user to next .then function
    () => {throw new Error('Login Failed!')}))
```

# &#160;&#160; Utilities

## `.tap(fn)`

The `.tap()` method is `FP`'s counterpart to `console.log()` - know it well.

It works just like `.then()` except it's return value is ignored. The next `thenable` will get the same input.

Perfect for logging or other background tasks (where results don't need to block).

```javascript
FP.resolve(fetch('/user/42/photos'))
  .tap(res => console.log(`user photos req ok? ${res.ok}`))
  .then(res => res.json())
  .then(data => console.log(data))
```


# &#160;&#160; Properties

These methods are particularly helpful for dealing with data extraction/transformation.

## `FP.get(keyName)`

Use to get a single key's value from an object.

Returns the key value.

```javascript
FP.resolve({foo: 42})
  .get('foo')
  .then(x => {
    console.log(x) // x === 42
  })
```

## `FP.set(keyName, value)`

Use to set a single key's value on an object.

Returns the **modified object.**

> A common use-case includes dropping passwords or tokens.

```javascript
FP.resolve({username: 'dan', password: 'sekret'})
  .set('password', undefined)
  .then(obj => {
    console.log(obj.password) // obj.password === undefined
  })
```

# Specialty Methods

# &#160;&#160; Helpers

## `FP.resolve(<anything>)`

Turn anything into an FP Promise. Also can upgrade any Promise-supporting library.

```javascript
FP.resolve()
FP.resolve(42)
FP.resolve(fetch(url))
FP.resolve(Promise.resolve(anything))
```

## `FP.all()`

`FP.all()` provides an extended utility above the native `Promise.all()`, **supporting both Objects and Arrays.**

_Note:_ Non-recursive.

```javascript
FP.all([
  Promise.resolve(1),
  Promise.resolve(2)
])
.then(results => assert.deepEqual(results, [1, 2]))
```

> Also works with keyed Objects:

```javascript
FP.all({
  one: Promise.resolve(1),
  two: Promise.resolve(2)
})
.then(results => assert.deepEqual(results, {one: 1, two: 2}))
```

## `FP.unpack()`

```javascript
function edgeCase() {
  const { promise, resolve, reject } = FP.unpack()
  setTimeout(() => resolve('All done!'), 1000)
  return promise
}

edgeCase()
  .then(result => assert.equal(result, 'All done!'))
```

Use sparingly. Stream &amp; event handling are exempt from this 'rule'. If using ES2015, destructuring helps to (more cleanly) achieve what `deferred` attempts.

`deferred` is an anti-pattern because it works against simple composition chains.


# &#160;&#160; Events

Promises can be awkward when dealing with events.

#### `Functional Promise` library aims to find a harmonious pattern.

```javascript
const button = document.getElementById('submitBtn')
FP.chain()
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen(button, 'click')
```

Key considerations:

Let's start with their **similarities**, both are (essentially) async...

And now for some **differences**:

* Promises are single-execution cached values. Events can run many times per second with different arguments or data.
* Events have control flow to think about (`e.preventDefault()`). Promises flow in one direction.
* Promises depend on `return`'s everywhere. Event handlers which `return` may cause unexpected control-flow issues.


_Yikes._

Let's look at some code &amp; see how `FP` solves this...

## `.listen()` event helper

The `.listen()` method must be called after an `FP.chain()` sequence of `FP` methods.

**Note:** The `.chainEnd()` method is automatically called.

```javascript
FP.chain()
  .get('target')
  .set('textContent', 'Clicked!')
  .listen(button, 'click')
```

# &#160;&#160; Composition Pipelines

> *Non `.then()`-based Methods*

<aside class="notice">
  <i>Forgive me Haskell people, but I'm calling this a monad.</i>
</aside>

Chained Functional Promises unlock a powerful technique: **Reusable Async Composition Pipelines.**

**Enough jargon!** _Let's rock some examples:_

<!-- **Examples and usage patterns below:** -->

## `.chain()` / `.chainEnd()`

> Both `.chain()` and `.chainEnd()` must be used together.

`FP.chain()` is a static method on `FP`. Any

```javascript
const getTarget = FP
  .chain()
  .get('target')
  .chainEnd()

getTarget(event)
  .then(target => {console.log('Event target: ', target)})
```


## Re-usable Promise Chains

Create a re-usable sequence of steps:

```javascript
const squareAndFormatDecimal = FP
  .chain()
  .map(x => x * x)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd()

squareAndFormatDecimal([5])
.then(num => {
  console.log('squareAndFormatDecimal() Results: ', num)
  // num === ['25.00']
})

```


## Events + Promise Chain

```javascript
function addTodoHandler() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s
  const setError  = err => setStatus(`ERROR: ${err}`)

  return FP
    .chain()
    .then(event => event.target)
    .then(form => form.querySelector('input.todo-text').value)
    .then(todoText => ({id: null, complete: false, text: todoText}))
    .then(todoAPI.create)
    .then(createResult => setStatus(createResult.message))
    .catch(setError)
    .chainEnd()
}

const form = document.querySelector('form')
form.addEventListener('submit', addTodoHandler())
```

## Controller + Events + Promise Chain

A more realistic 'class' like object.

Again, still all with simple functions:


```javascript
// using a more complete controller/component interface:
const todoCtrl = TodoController()

todoCtrl
  .add('new item')
  .then(result => {
    todoCtrl.update({id: 1, text: 'updated item', complete: true})
  })

/**
 * Here's a more realistic, 'tighter' example:
 * TodoController will return an object with `add` and `update` methods
 *  - based on FP.chain()
 */
function TodoController() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s

  return {
    add: FP.chain()
      .then(input => ({id: null, complete: false, text: input}))
      .then(todoAPI.create)
      .tap(createResult => setStatus(createResult.message))
      .chainEnd(),
    update: FP.chain()
      .then(input => {
        const {id, complete, text} = input
        return {id, complete, text}
      })
      .then(todoAPI.update)
      .tap(updateResult => setStatus(updateResult.message))
      .chainEnd(),
  }

}
```


# &#160;&#160; Modifiers

## `.quiet()`

```javascript
FP.resolve([2, 1, 0])
  .quiet()
  .map(x => 2 / x)
  .then(results => {
    assert.deepEqual(results, [1, 2, Error])
  })
```

Suppresses errors by converting them to return values.

**Only applies to subsequent thenable.**

Best used with Array methods.

## `.concurrency(threadLimit)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
  .concurrency(2)
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })
```

Set `threadLimit` to constrain the amount of simultaneous tasks/promises can run.

**Only applies to subsequent Array thenable.**

_Best used with Array methods._


> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.


