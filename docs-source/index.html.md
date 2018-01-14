---
title: Functional Promises - API Documentation

# language_tabs: # must be one of https://git.io/vQNgJ
#   - javascript

toc_footers:
  - <a href='https://github.com/justsml/functional-promises'>Star on GitHub</a>
  - <a class='x-small center' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>

# includes:
#   - errors

search: true
---

# Functional Promises

Functional Promises are an extension of the native Promises API (`.then()`/`.catch()`).

**Core features:** Array Methods, Events, Object & Array `FP.all()` Resolution, Re-usable Function Chains, Conditional/Branching Logic, Concurrency, Smart Error Handling.

**Why not simply use [library X]?**

* RxJS: `FP` is 1/6th the size. Observable support still being evaluated.
* Bluebird: `FP` adds some key features: _events_, _conditionals_, _chains_, _quiet errors_. (Disclaimer: I'm a contributor, with a low PR acceptance ratio. 😿)

`FP` is currently **only a few 100 lines of code.**
The **browser bundle** still only clocks in at **~20Kb** (using Webpack+Babel+Rollup+UglifyJS).

## API Outline

All `.then()`-derived methods are listed first. It's the bulk of the API.

> **Example Awesome Shit:**
>
> `.chain()` is a powerful way to create re-usable sequences of functions.

```javascript
// #1: Use .chain to create re-usable function pipelines
const squareAndFormatDecimal = FP
  .chain()
  .map(x => x * x)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd() // returns re-usable function

squareAndFormatDecimal([5, 10, 20])
  .then(num => assert.deepEqual(num, ['25.00', '100.00', '400.00']))
```


> Familiar Array-methods are built-in. This example uses `.map()`:

```javascript
// #2: Use .map to double an array of numbers
FP.resolve([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })

```

* Thenable Methods
    * Arrays
        * `.map(fn)`
        * `.filter(fn)`
        * `.find(fn)`
        * `.findIndex(fn)`
        * `.some(fn)`
        * `.none(fn)`
        * `.series(fn)`
        * `.forEach(fn)` - use `.map()` instead (write _proper_ `functions`)
    * Errors _(WIP)_
        * `.catch(fn)`
        * `.catch(filter, fn)`
    * Conditional
        * `.thenIf()`
    * Utilities
        * `.tap(fn)`
    * Properties
        * `.get(keyName)`
        * `.set(keyName, value)`
* Not Thenable-based Methods
    * Helpers
        * `FP.resolve()`
        * `FP.all(Object/Array)`
    * Chaining and Composition
        * `FP.chain()`
        * `.chainEnd()`
    * Modifiers
        * `.quiet()` - prevents errors from stopping array methods mid-loop
        * `.concurrency(threadLimit)` - limits parallel workers for array methods

# Array Methods

Any `.then()` which would handle an array, may instead use one of the `FP` array methods.

## `FP.map(iterable, fn)`

Similar to `Array.prototype.map()`.

Use to transform each item in an array by passing through a given function.

```javascript
FP.resolve([1, 2, 3, 4, Promise.resolve(5)])
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })
```

## `FP.filter(iterable, fn)`

Use `.filter()` to omit items from the input array by passing through a given function. Items will be omitted if the function returns a falsey value.

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .filter(isEven)
  .then(results => {
    assert.deepEqual(results, [2, 4])
  })
```

## `FP.find(iterable, fn)`

Returns first item to return truthy for `fn(item)`

If no match is found it will return `undefined`.

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .find(isEven)
  .then(results => {
    assert.deepEqual(results, 2)
  })
```

## `FP.findIndex(iterable, fn)`

Returns first **item's index** to return truthy for `fn(item)`

If no match is found it will return `-1`.

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .findIndex(isEven)
  .then(results => {
    assert.equal(results, 1)
  })
```

## `FP.some(iterable, fn)`

Returns `Promise<true>` on the first **item** to return truthy for `fn(item)`

If no match is found it will return `Promise<false>`.

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 4])
  .some(isEven)
  .then(results => {
    assert.equal(results, true)
  })

// Will return false:
FP.resolve([1, 3, 5])
  .some(isEven)
  .then(results => {
    assert.equal(results, false)
  })
```

## `FP.none(iterable, fn)`

Returns `Promise<false>` on the first **item** to return falsey for `fn(item)`

If no match is found it will return `Promise<true>`.

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 4])
  .some(isEven)
  .then(results => {
    // Will return true:
    assert.equal(results, true)
  })

FP.resolve([1, 3, 5])
  .some(isEven)
  .then(results => {
    // Will return false:
    assert.equal(results, false)
  })
```

# Utilities

## `.tap(fn)`

The `.tap()` method is `FP`'s counterpart to `console.log()` - know it well.

It works just like `.then()` except it's return value is ignored. The next `thenable` will get the same input.

Perfect for logging or other background tasks (where results don't matter).

```javascript
FP.resolve(fetch('/user/42/photos'))
  .tap(res => console.log(`user photos req ok? ${res.ok}`))
  .then(res => res.json())
  .then(data => {
    console.log(data)
  })
```



# Properties

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


# Events

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

# Helpers

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



# Conditional

## `FP.thenIf()`

> Use `fetch` with `FP.thenIf()` to handle 4xx or 5xx responses as proper exceptions.

```javascript
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf(
    res => res.ok, // Check for 2xx status code using `fetch`'s behavior
    res => res.json(), // Success, so pass along the JSON-parsed body
    res => Promise.reject(new Error('Profile GET Failed'))) // Fails here if response not `ok`
  .get('avatar') // Get the response JSON object's `avatar` key value
  .then(avatarUrl => imageElem.src = avatarUrl)
```

> Email 'validator'

```javascript
// Use like so:
FP.resolve(email)
  .thenIf(
    e => e.length > 5, // Conditional
    e => console.log('Valid: ', e), // ifTrue
    e => console.error('Bad Email: ', e)) // ifFalse

// Or use small helper methods like so:
const checkEmail = email => FP.resolve(email)
  .thenIf(e => e.length > 5)

// Or to check if a user login successfully returned a token:
const authUser = (email, pass) =>
  FP.resolve({email, pass})
  .then(({email, pass}) => svc.loginAndGetUser(email, pass))
  .thenIf(
    user => user.token, // is valid login
    user => user, // return user to next .then function
    () => {throw new Error('Login Failed!')})) // failed token test
```

# Chaining and Composition

> *Non `.then()`-based Methods*

#### <i>(Forgive me Haskell people, but I'm calling this a monad)</i>

Chained Functional Promises enable a powerful technique: **Reusable Async Composition Pipelines.**

... enough gibberish...

**Examples and usage patterns below:**

## `.chain()` / `.chainEnd()`

> Both `.chain()` and `.chainEnd()` must be used together.

```javascript
const getTarget = FP.chain()
  .get('target')
  .chainEnd()

getTarget(event)
  .then(element => {console.log('Event Targeted Element: ', element)})
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
      .then(input => ({id: input.id, complete: input.complete, text: input.text}))
      .then(todoAPI.update)
      .tap(updateResult => setStatus(updateResult.message))
      .chainEnd(),
  }

}
```



> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.


