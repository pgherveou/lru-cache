# lru cache

A cache object that deletes the least-recently-used items.
and use localstorage as storage.

The code is forked and adapted from [node-lru-cache](https://github.com/isaacs/node-lru-cache)


## Usage:

```javascript
var LRU = require("lru-cache")
  , options = {ns: 'cache-1', max: 500, maxAge: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
cache.get("key") // "value"

cache.reset()    // empty the cache
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

* `set(key, value)`
* `get(key) => value`

    Both of these will update the "recently used"-ness of the key.
    They do what you think.

* `peek(key)`

    Returns the key value (or `undefined` if not found) without
    updating the "recently used"-ness of the key.

    (If you find yourself using this a lot, you *might* be using the
    wrong sort of data structure, but there are some use cases where
    it's handy.)

* `del(key)`

    Deletes a key out of the cache.

* `reset()`

    Clear the cache entirely, throwing away all values.

* `has(key)`

    Check if a key is in the cache, without updating the recent-ness
    or deleting it for being stale.

* `forEach(function(value,key,cache), [thisp])`

    Just like `Array.prototype.forEach`.  Iterates over all the keys
    in the cache, in order of recent-ness.  (Ie, more recently used
    items are iterated over first.)

* `keys()`

    Return an array of the keys in the cache.

* `values()`

    Return an array of the values in the cache.
