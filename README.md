# lru cache

A Browser cache object that deletes the least-recently-used items.
and use [localforage](https://github.com/mozilla/node-lru-cache) as storage.

The code is forked and adapted from [node-lru-cache](https://github.com/isaacs/node-lru-cache)

> **warning**  version `0.1.*` has an async api and use mozilla localforage to store cache objects
> if you want a sync version that use localstorage use version `0.0.x`

## Usage:

```javascript
var LRU = require("lru-cache")
  , options = {ns: 'cache-1', max: 500, maxAge: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size


// load cache from storage
cache.load().then(function({
  // cache is loaded
})

// ...

// get an oject from the cache
cache.get('key-1').then(function(v) {
  // do something with value
})

// ...

// save an oject into the cache
cache.set('key-2', { foo: 'bar' }).then(function() {
  // cache is saved
})
```

If you put more stuff in it, then items will fall out.

If you try to put an oversized thing in it, then it'll fall out right
away.

## Options

* `max` The maximum size of the cache,
an item size is the length of its key and the stringify length of its value.
if no size is specified the cache will keep adding items until the max size of the localstorage is reached.
* `maxAge` Maximum age in ms.  Items are not pro-actively pruned out
  as they age, but if you try to get an item that is too old, it'll
  drop it and return undefined instead of giving it to you.

## API

### get
update the "recently used"-ness of the key, and returns a promise of the key value.

#### value
Type: `String`

#### return
Type: `Promise`

### set
save `value` and update the "recently used"-ness of the key

#### key
Type: `String`

#### value
Type: `Object`

#### return
Type: `Promise`

### peek
Returns a promise of the key value without updating the "recently used"-ness of the key.

#### value
Type: `String`

#### return
Type: `Promise`

### del
Deletes a key out of the cache.

#### value
Type: `String`

##### reset
Clear the cache entirely, throwing away all values.

#### return
Type: `Promise`
a Promise that resolve when the change have been saved to storage.

### has
Check if a key is in the cache, without updating the recent-ness or deleting it for being stale.

#### value
Type: `String`

#### return
Type: `Boolean`

### keys
Return an array of the keys in the cache.

#### return
Type: `Array`
