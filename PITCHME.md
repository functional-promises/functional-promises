# FUNCTIONAL
# PROMISE

---

## OBJECTIVES

1. Understand Promises enable Composition
1. Identify 'missing' features
1. Common patterns:
    1. Function
    1. Express

---

## Overview

### Promises, eh?

1. Key async pattern in JS.
1. A bit like `Task`s or `Future`s in other languages
1. Build up code by glueing small functions together

+++



---

## `FP.all()` Works with Arrays & Objects!

```js
// Extended Functionality
FP.all({
    one: Promise.resolve(1),
    two: Promise.resolve(2)
  })
  .then(results => t.deepEqual(results, {one: 1, two: 2}))

// Exactly like Promise.all()
FP.all([1, 2])
  .then(results => t.deepEqual(results, [1, 2]))
```

---

# EXAMPLES / FEATURE OVERVIEW

---

## Express+Knex

> Example login.

```js
function login(req, res, next) {
  let {user, pass} = req.body;

  knex('user')
    .where({user, pass: hashSync(pass)})
    .limit(1)
    .then(user => {
      if (!user) throw new Error('Login failed');
      delete user.pass; // omit pass, even hashed
      return user;
    })
    .then(user => res.status(200).send(user))
    .catch(err => res.status(500).send({error: err.message, stack: err.stack}));
}
```

---

## Express+Knex
### FP Refactor

```js
function login(req, res, next) {
  let {user, pass} = req.body;

  knex('user')
    .where({user, pass: hashSync(pass)})
    .limit(1)
    .then(user => {
      if (!user) throw new Error('Login failed');
      delete user.pass; // omit pass, even hashed
      return user;
    })
    .then(user => res.status(200).send(user))
    .catch(err => res.status(500).send({error: err.message, stack: err.stack}));
}
```

---

```js
// FP.resolve() wrap:
FP.resolve(knex('user'))
  .concurrency(2)
  .map(user => api.getFaceBookProfile(user.fb))
  .concurrency(16)
  .map(fbProfile => FP.tap(fbProfile => elasticLogs.append(fbProfile)))
  .then(res => console.log('Done!\nProcessed %d Profiles', res.length))


```

---
## fetch Exmaple:

> Uses `.thenIf()`

```js
// ORIGINAL RECIPE
fetch('/profile', {method: 'GET'})
  .then(res => {
    if (res.ok) {
      return res.json();
     } else {
      return {avatar: '/no-photo.svg'}
     }
  })
  .then(data => data.avatar)
  .then(avatar => imgElement.src = avatar)
```

---

```js
// Use `FP.resolve()` to wrap `fetch`'s return Promise.
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf( // thenIf lets us handle branching logic
    res => res.ok, // Check if response is ok
    res => res.json(), // if true, return the parsed body
    res => ({avatar: '/no-photo.svg'})) // fail, default object
  .get('avatar') // Get the resulting objects `avatar` value
  .then(avatar => imgElement.src = avatar)
```




---

## Use Case: fetch API

```js
fetch('/profile', {method: 'GET'})
  .then(res => {
    if (res.ok) {
      return res.json();
     } else {
      return {avatar: '/no-photo.svg'}
     }
  })
  .then(data => data.avatar)
  .then(avatar => imgElement.src = avatar)
```







# Code
# Presenting

---

### Code-Blocks

#### The Basics

![Press Down Key](assets/down-arrow.png)

+++

```python
from time import localtime

activities = {8: 'Sleeping', 9: 'Commuting', 17: 'Working',
              18: 'Commuting', 20: 'Eating', 22: 'Resting' }

time_now = localtime()
hour = time_now.tm_hour

for activity_time in sorted(activities.keys()):
    if hour < activity_time:
        print activities[activity_time]
        break
else:
    print 'Unknown, AFK or sleeping!'
```

###### Code-blocks let you present any <p> **static code** with auto-syntax highlighting

---

### Code-Blocks
##### Using
#### **Code-Presenting**

![Press Down Key](assets/down-arrow.png)

+++

```python
from time import localtime

activities = {8: 'Sleeping', 9: 'Commuting', 17: 'Working',
              18: 'Commuting', 20: 'Eating', 22: 'Resting' }

time_now = localtime()
hour = time_now.tm_hour

for activity_time in sorted(activities.keys()):
    if hour < activity_time:
        print activities[activity_time]
        break
else:
    print 'Unknown, AFK or sleeping!'
```

@[1]
@[3-4]
@[6-7]
@[9-14]

###### Use code-presenting to **step-thru** code <p> from directly within your presentation


---

### Code-Blocks
##### Using
#### Code-Presenting
#### **With Annotations**

![Press Down Key](assets/down-arrow.png)

+++

```python
from time import localtime

activities = {8: 'Sleeping', 9: 'Commuting', 17: 'Working',
              18: 'Commuting', 20: 'Eating', 22: 'Resting' }

time_now = localtime()
hour = time_now.tm_hour

for activity_time in sorted(activities.keys()):
    if hour < activity_time:
        print activities[activity_time]
        break
else:
    print 'Unknown, AFK or sleeping!'
```

@[1](Python from..import statement)
@[3-4](Python dictionary initialization block)
@[6-7](Python working with time)
@[9-14](Python for..else statement)

---

### Naturally
### Code-Presenting
### works in exactly the same way on [Code-Delimiter Slides](https://github.com/gitpitch/gitpitch/wiki/Code-Delimiter-Slides) as it does on [Code-Blocks](https://github.com/gitpitch/gitpitch/wiki/Code-Slides).

---

### Code-Delimiter Slides

```
                  ---?code=path/to/source.file
```

#### The Basics

![Press Down Key](assets/down-arrow.png)

+++?code=src/python/time.py&lang=python

###### Code delimiters let you present any <p> **code file** with auto-syntax highlighting

---

### Code-Delimiter Slides
##### Using
#### **Code-Presenting**

![Press Down Key](assets/down-arrow.png)

+++?code=src/javascript/config.js&lang=javascript

@[1-3]
@[5-8]
@[10-16]
@[18-24]

###### Use code-presenting to **step-thru** code <p> from directly within your presentation

---

### Code-Delimiter Slides
##### Using
#### Code-Presenting
#### **With Annotations**

![Press Down Key](assets/down-arrow.png)

+++?code=src/elixir/monitor.ex&lang=elixir

@[11-14](Elixir module-attributes as constants)
@[22-28](Elixir with-statement for conciseness)
@[171-177](Elixir case-statement pattern matching)
@[179-185](Elixir pipe-mechanism for composing functions)

---

### Learn By Example
#### View The [Presentation Markdown](https://github.com/gitpitch/code-presenting/blob/master/PITCHME.md)
