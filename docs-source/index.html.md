---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - javascript

toc_footers:
  - <a href='https://github.com/justsml/functional-promises'>Star on GitHub</a>
  - <a class='x-small center' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>

includes:
  - errors

search: true
---


# API Outline

All `.then()`-derived methods are listed first. It's the bulk of the API.


* Then-based Methods
    * Arrays
        * `.map(fn)`
        * `.filter(fn)`
        * `.find(fn)`
        * `.findIndex(fn)`
        * `.some(fn)`
        * `.none(fn)`
        * `.series(fn)`
        * `.forEach(fn)` - use `.map()` - write _proper_ `functions`
    * Errors _(WIP)_
        * `.catch(fn)`
        * `.catch(filter, fn)`
    * Conditional
        * `.thenIf()`
    * Utilities
        * `FP.all(Object/Array)`
        * `.tap(fn)`
    * Properties
        * `.get(keyName)`
        * `.set(keyName, value)`
* Non `.then()`-based Methods
    * Chaining and Composition
        * `.chain()`
        * `.chainEnd()`
    * Modifiers
        * `.quiet()` - prevents errors from stopping array methods mid-loop
        * `.concurrency(threadLimit)` - limits parallel workers for array methods

# Array Methods

## `FP.map(iterable, transformFn)`

```javascript
FP.resolve([1, 2, 3, 4, Promise.resolve(5)])
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })
```

## `FP.filter(iterable, filterFn)`

```javascript
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .filter(isEven)
  .then(results => {
    assert.deepEqual(results, [2, 4])
  })
```

## `FP.find(fn)`

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

## `FP.findIndex()`

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

## `FP.some()`

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

## `FP.none()`

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

# Properties

## `FP.get(keyName)`

```javascript
FP.resolve({foo: 42})
  .get('foo')
  .then(x => {
    console.log(x) // x === 42
  })
```

## `FP.set(keyName, value)`

```javascript
FP.resolve({foo: 42})
  .set('foo', 'bar')
  .then(obj => {
    console.log(obj.foo) // obj.foo === 'bar'
  })
```


# Events

`FP.chain()...[chain].listen(element, ...eventNames)`

`.listen()` calls the function returned by `.chainEnd()`


# Utilities

## `FP.resolve(<anything>)`

Turn anything into an FP Promise.


Use with existing Promise supporting libraries.

```javascript
FP.resolve(Promise.resolve(anything))
```

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

# Non `.then()`-based Methods
# Chaining and Composition

#### <i>(Forgive me Haskell people, but I'm calling this a monad)</i>

`const pChain = FP.chain()...[chain].chainEnd()`

Chained Functional Promises enable a powerful technique: **Reusable Async Composition Pipelines.**

... enough gibberish...

**Examples and usage patterns below:**

## `.chain()`
## `.chainEnd()`

> Both `.chain()` and `.chainEnd()` are used together.

```javascript
const getTarget = FP.chain()
  .get('target')
  .chainEnd()

getTarget(event)
  .then(element => {console.log('Event Targeted Element: ', element)})
```


## `.listen()` event helper

```javascript
// create a chain to handle events:
FP.chain()
  .get('target')
  .set('textContent', 'Clicked!')
  .listen(button, 'click')
```

It may be unfamiliar at first, but I bet you can guess what that does.

Here's basically the same code:

```javascript
const button = document.getElementById('submitBtn')
FP.chain()
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen(button, 'click')
```



## Re-usable Promise Chains

Create a re-usable sequence of steps:

```javascript
const squareAndFormatDecimal = FP
  .chain()
  .map(x => x * x)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd()
// typeof squareAndFormatDecimal === 'function'
squareAndFormatDecimal([5])
.then(num => {
  console.log('squareAndFormatDecimal() Results: ', num)
  // num === ['25.00']
})

```


## Complete Promise Chain

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
const submitHandler = addTodoHandler()
form.addEventListener('submit', submitHandler)

```

## Chaining Promises for DOM Events

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



## `FP.all()`

FP.all provides an extended utility above the native `Promise.all()`, supporting Objects and Arrays.

```javascript
FP.all({
  one: promise,
  two: promise
})
.then(results =>
  // results === {
  //   one: 1,
  //   two: 2}
)
```

```javascript
FP.all([
  Promise.resolve(1),
  Promise.resolve(2)
])
.then(results =>
  // results === [1, 2])
)
```


> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.


