var store = require('store');

// max size if not specifed
var MAX_SIZE = 5000000;

function hop (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Entry Class
 */

function Entry (key, value, lu, age, loaded) {
  this.key = key;
  this.lu = lu;
  this.age = age;
  this.loaded = loaded;
  this.value = value;
}

/**
 * calculate entry age
 */

Entry.prototype.getAge = function() {
  return Date.now() - this.age;
};

/**
 * cache class
 * use ls store with `name` namespace defaulting to cache
 */

function Cache(name) {
  this.store = store.ns(name || 'lru');
  this.items = Object.create(null);
  this.list = Object.create(null);
}

/**
 * update cache ls entries
 */

Cache.prototype.update = function () {
  this.store.save(Object.keys(this.list).map(function (key) {
    var item = this.list[key];
    return {
      key: item.key,
      age: item.age,
      lu: item.lu,
      length: item.length
    };
  }, this));
};

/**
 * get item in cache
 * get entry value, load value from ls if value is not yet loaded
 *
 * @param {string} key
 */

Cache.prototype.get = function (key) {
  if (!hop(this.items, key)) return;
  var item = this.items[key];
  if (item.loaded) return item;
  item.value = this.store.get(key);
  item.loaded = true;
  return item;
};

/**
 * check if cache has specified key
 *
 * @param  {String}  key
 * @return {Boolean}
 */

Cache.prototype.has = function (key) {
  return hop(this.items, key);
};

/**
 * set value
 * store it in ls and set entry length
 *
 * @param {String} key
 * @param {Entry} hit
 * @return {Boolean} false if store failed to save the value
 */

Cache.prototype.set = function (key, hit) {
  var length, data;

  this.list[hit.lu] = this.items[key] = hit;
  if (hit.loaded) {
    data = JSON.stringify(hit.value || null);
    hit.length =  key.toString().length + data.length;
    return !this.store.setItem(key, data);
  }
  return true;
};

/**
 * delete value
 *
 * @param  {String} key
 */

Cache.prototype.del = function (key) {
  delete this.items[key];
  this.store.del(key);
};

/**
 * reset cache
 */

Cache.prototype.reset = function () {
  this.store.reset();
  this.items = Object.create(null);
  this.list = Object.create(null);
};

/**
 * LRU class
 */

function LRUCache (options) {
  if (!(this instanceof LRUCache)) return new LRUCache(options);

  if (typeof options === 'number') options = { max: options };
  if (!options) options = {};

  // options
  var max = options.max,
      maxAge = options.maxAge || null;

  // a little bit silly.  maybe this should throw?
  if (!max || ('number' !== typeof max) || max <= 0 ) max = MAX_SIZE;

  // states
  var cache = new Cache(options.name),
      mru, // most recently used
      lru, // least recently used
      length, // number of items in the list
      itemCount;

  /**
   * @property {Number} max cache max size
   * resize cache when set
   */

  Object.defineProperty(this, 'max',
    {
      set : function (mL) {
        if (!mL || ('number' !== typeof mL) || mL <= 0 ) mL = MAX_SIZE;
        max = mL;
        if (length > max) trim();
      },
      get : function () { return max; },
      enumerable : true
    });

  /**
   * @property {Number} length cache length
   */

  Object.defineProperty(this, 'length',
    {
      get : function () { return length; },
      enumerable : true
    });

  /**
   * @property {Number} itemCount
   */

  Object.defineProperty(this, 'itemCount',
    {
      get : function () { return itemCount; },
      enumerable : true
    });

  /**
   * shift entries in the cache
   * update least recently used
   *
   * @param  {Entry} hit
   */

  function shiftLU(hit) {
    // remvove hit
    delete cache.list[hit.lu];

    // update least recently used
    while (lru < mru && !cache.list[lru]) lru++;
  }

  /**
   * Update LRU
   * update least recently used
   * set hit as most recently used
   *
   * @param  {Entry} hit
   */

  function use (hit) {
    shiftLU(hit);
    hit.lu = mru++;

    // set hit as most recently used
    cache.list[hit.lu] = hit;
  }

  /**
   * trim cache
   * remove oldest items until length < max
   */

  function trim () {
    while (lru < mru && length > max)
      del(cache.list[lru]);
  }

  /**
   * delete entry in the cache
   *
   * @param  {Entry} hit
   */

  function del(hit) {
    if (hit) {
      length -= hit.length;
      itemCount--;
      cache.del(hit.key);
      shiftLU(hit);
    }
  }

  /**
   *  Iterates over all the keys in the cache, in order of recent-ness
   *
   * @param  {Function} fn
   * @param  {Object}   thisp [description]
   */

  this.forEach = function (fn, thisp) {
    thisp = thisp || this;
    var i = 0;
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) {
      if (cache.list[k]) {
        i++;
        var hit = cache.list[k];
        if (maxAge && (hit.getAge() > maxAge)) {
          del(hit);
          hit = undefined;
        }
        if (hit) {
          fn.call(thisp, hit.value, hit.key, this);
        }
      }
    }
  };

  /**
   * Return an array of the keys in the cache.
   *
   * @return {Array}
   */

  this.keys = function () {
    var keys = new Array(itemCount);
    var i = 0;
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) {
      if (cache.list[k]) {
        var hit = cache.list[k];
        keys[i++] = hit.key;
      }
    }
    return keys;
  };

  /**
   * Return an array of the values in the cache.
   *
   * @return {Array}
   */

  this.values = function () {
    var values = new Array(itemCount);
    var i = 0;
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) {
      if (cache.list[k]) {
        var hit = cache.list[k];
        values[i++] = hit.value;
      }
    }
    return values;
  };

  /**
   * get a key in the cache
   * update LRU when `doUse` is true
   * delete expired keys
   *
   * @param  {String} key
   * @param  {Boolean} doUse update LRU
   *
   * @return {Object} Entry value
   */

  function get (key, doUse) {
    var hit = cache.get(key);
    if (hit) {
      if (maxAge && (hit.getAge() > maxAge)) {
        del(hit);
        hit = undefined;
      } else {
        if (doUse) use(hit);
      }
      if (hit) hit = hit.value;
    }
    return hit;
  }

  /**
   * set a value
   *
   * @param {String} key
   * @param {Object} value
   */

  this.set = function (key, value) {
    var age = maxAge ? Date.now() : 0;
    var hit = new Entry(key, value, mru++, age, true);
    var res = cache.set(key, hit);

    // oversized objects fall out of cache automatically.
    if (hit.length > max) {
      cache.del(key);
      return false;
    }

    // if we failed to save to ls
    // trim until it works
    while (!res && length) {
      del(cache.list[lru]);
      res = cache.set(key, hit);
    }

    // failed to store to ls
    if (!res) return false;

    length += hit.length;
    itemCount ++;

    if (length > max) trim();
    cache.update();
    return true;
  };

  /**
   * reset cache
   */

  this.reset = function () {
    cache.reset();
    lru = 0;
    mru = 0;
    length = 0;
    itemCount = 0;
  };

  /**
   * Check if a key is in the cache,
   * without updating the recent-ness or deleting it.
   *
   * @param  {String}  key
   * @return {Boolean}
   */

  this.has = function (key) {
    if (!cache.has(key)) return false;
    var hit = cache.get(key);
    if (maxAge && (hit.getAge() > maxAge)) {
      return false;
    }
    return true;
  };

  /**
   * get a key in the cache
   * update the recent-ness
   *
   * @param  {String} key
   * @return {Object}
   */

  this.get = function (key) {
    var v = get(key, true);
    cache.update();
    return v;
  };

  /**
   * get key Entry
   *
   * @param  {String} key
   * @return {Object}
   */

  this.getEntry = function (key) {
    return cache.get(key);
  };

  /**
   * get a key in the cache without updating the recent-ness
   *
   * @param  {String} key
   * @return {Object}
   */

  this.peek = function (key) {
    return get(key, false);
  };

  /**
   * dump cache
   */

  this.dump = function () {
    return cache.items;
  };

  /**
   * delete a key in the cache
   *
   * @param  {String} key
   * @return {Object}
   */

  this.del = function (key) {
    cache.del(key);
    cache.update();
  };

  // init cache
  var items = cache.store.get() || [];
  length = 0;

  items.forEach(function (obj) {
    var entry = new Entry (obj.key, null, obj.lu, obj.age);
    entry.length = obj.length;
    cache.set(obj.key, entry);
    length += entry.length;
  }, this);

  lru = (items[0] && items[0].lu) || 0;
  mru = (items.length && items[items.length - 1].lu) || 0;
  itemCount = items.length;
}

/*!
 * exports
 */

module.exports = LRUCache;
