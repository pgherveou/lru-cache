var lf = require('localforage'),
    Promise = require('promise');

// max size if not specifed
var MAX_SIZE = 100;

function naiveLength () { return 1; }

/**
 * create a promise that fails after `ms` milliseconds
 * @param {ms} Number delay in ms
 *
 * @return {Promise}
 */

function timeout(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() { reject(new Error('timeout')); }, ms || 1000);
  });
}

// function strLength(key, value) {
//   return key.toString().length + JSON.stringify(value || null).length;
// };

/**
 * hasOwnProperty alias
 * @param  {Object} obj
 * @param  {String} key
 *
 * @return {Boolean}
 */

function hop (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Store class
 * thin layer on top of localforage to allow namespacing
 */

function Store(_) {
  if (!(this instanceof Store)) return new Store(_);
  this._ = _ || '_';
}

Store.prototype.setItem = function(key, val, cb) {
  return lf.setItem(this._ + key, val, cb);
};

Store.prototype.getItem = function(key, cb) {
  return lf.getItem(this._ + key, cb);
};

Store.prototype.removeItem = function(key, cb) {
  return lf.removeItem(this._ + key, cb);
};

Store.prototype.get = function(cb) {
  return this.getItem('', cb);
};

Store.prototype.save = function(val, cb) {
  return this.setItem('', val, cb);
};

/**
 * Entry Class
 * container for lru items
 */

function Entry (key, value, lu, length, age, loaded) {
  this.key = key;
  this.value = value;
  this.lu = lu;
  this.age = age;
  this.length = length;
  this.loaded = loaded;
}

/**
 * calculate entry age
 */

Entry.prototype.getAge = function() {
  return Date.now() - this.age;
};

/**
 * Cache class
 */

function Cache(name) {

  // namespaced storage instance
  this.store = new Store(name || 'lru/');

  // hash of items by key
  this.items = Object.create(null);

  // list of items in order of use recency
  this.list = Object.create(null);
}

/**
 * update cache ls entries
 *
 * @return {Promise}
 */

Cache.prototype.update = function () {
  var entries;

  // serialize entries
  entries = Object
    .keys(this.items)
    .map(function (key) {
      var item = this.items[key];
      return {
        key: item.key,
        age: item.age,
        lu: item.lu,
        length: item.length
      };
    }, this);

  // save it
  return this.store.save(entries);
};

/**
 * get item in cache
 * get entry value, load value from ls if value is not yet loaded
 *
 * @param {string} key
 * @return {Promise}
 */

Cache.prototype.get = function (key) {

  // key does not exist
  if (!hop(this.items, key)) return Promise.resolve();

  // get item from mem store
  var item = this.items[key];
  if (item.loaded) return Promise.resolve(item);

  // load item from store
  return this.store
    .getItem(key)
    .then(function(value) {
      item.value = value;
      item.loaded = true;
      return item;
    });
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
 * set entry length and store it cache
 *
 * @param {String} key
 * @param {Entry} hit
 *
 * @return {Promise}
 */

Cache.prototype.set = function (key, hit) {
  this.list[hit.lu] = this.items[key] = hit;
  return this.store.setItem(key, hit.value);
};

/**
 * delete value
 *
 * @param  {String} key
 */

Cache.prototype.del = function (key) {
  delete this.items[key];
  return this.store.removeItem(key);
};

/**
 * reset cache
 */

Cache.prototype.reset = function () {
  var _this = this,
      promises;

  promises = Object
    .keys(this.items)
    .map(function(key) {
      return _this.store.removeItem(key);
    });

  return Promise
    .all(promises)
    .then(function() {
      _this.items = Object.create(null);
      _this.list = Object.create(null);
    });
};

/**
 * LRU class
 */

function LRUCache (options) {
  if (!(this instanceof LRUCache)) return new LRUCache(options);

  if (typeof options === 'number') options = { max: options };
  if (!options) options = {};

  var cache = new Cache(options.name),
      max = options.max || MAX_SIZE,
      maxAge = options.maxAge || null,
      lengthCalculator = options.length || naiveLength,
      mru = 0, // most recently used
      lru = 0, // least recently used
      length = 0, // number of items in the list
      itemCount = 0;

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

    // remove hit
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
   * delete entry in the cache
   *
   * @param  {Entry} hit
   *
   * @return {Promise}
   */

  function del(hit) {
    if (!hit) return Promise.reject(new Error('no hit'));
    length -= hit.length;
    itemCount--;
    shiftLU(hit);
    return cache.del(hit.key);
  }

  /**
   * trim cache
   * remove oldest items until length < max
   *
   * @return {Promise}
   */

  function trim () {
    var dels = [];
    while (lru < mru && length > max) {
      dels.push(del(cache.list[lru]));
    }

    return Promise.all(dels);
  }

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
   * get a key in the cache
   * update LRU when `doUse` is true
   * delete expired keys
   *
   * @param  {String} key
   * @param  {Boolean} doUse update LRU
   *
   * @return {Promise} promise of the Entry value
   */

  function get (key, doUse) {
    return cache
      .get(key)
      .then(function(hit) {
        if (!hit) return;
        if (maxAge && (hit.getAge() > maxAge)) return del(hit);
        if (doUse) use(hit);
        return hit;
      });
  }

  /**
   * set a value
   *
   * @param {String} key
   * @param {Object} value
   *
   * @return {Promise}
   */

  this.set = function (key, value) {
    var age = maxAge ? Date.now() : 0,
        len = lengthCalculator(key, value),
        hit = new Entry(key, value, mru++, len, age, true),
        prev = cache.items[key];

    // oversized objects fall out of cache automatically.
    if (hit.length > max) return Promise.reject(new Error('oversized'));

    if (prev) {
      length -= prev.length;
      delete cache.items[prev.key];
      delete cache.list[prev.lu];
    }

    // trim and retry until it works
    function retry() {
      var entry = cache.list[lru];
      if (!entry) throw new Error('fail to set key ' + key);

      return del(entry).then(function() {
        return cache.set(key, hit);
      });
    }

    // update cache
    function update() {
      length += hit.length;
      itemCount ++;
      if (length > max) return trim();
      return cache.update();
    }

    return cache
      .set(key, hit)
      .then(update, retry);
  };

  /**
   * reset cache
   */

  this.reset = function () {
    lru = 0;
    mru = 0;
    length = 0;
    itemCount = 0;
    return cache.reset();
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
    if (maxAge && (hit.getAge() > maxAge)) return false;
    return true;
  };

  /**
   * get an entry in the cache
   * update the recent-ness
   *
   * @param  {String} key
   * @return {Entry}
   */

  this.getEntry = function (key) {
    return get(key, true).then(function(v) {
      if (v) cache.update();
      return v;
    });
  };

  /**
   * get a key in the cache
   * update the recent-ness
   *
   * @param  {String} key
   * @return {Object}
   */

  this.get = function (key) {
    return get(key, true).then(function(hit) {
      if (hit) {
        cache.update();
        return hit.value;
      }
    });
  };

  /**
   * get a key in the cache without updating the recent-ness
   *
   * @param  {String} key
   * @return {Promise}
   */

  this.peek = function (key) {
    return get(key, false).then(function(hit) {
      if (hit) return hit.value;
    });
  };

  /**
   * delete a key in the cache
   *
   * @param  {String} key
   * @return {Promise}
   */

  this.del = function (key) {
    cache.del(key).then(function() {
      cache.update();
    });
  };

  /**
   * load cache from storage
   *
   * @return {Promise}
   */

  this.load = function() {
    return Promise
      .race([cache.store.get(), timeout()])
      .then(function(items) {

        if (!items) return;

        // init cache items
        items.forEach(function (obj) {
          var entry = new Entry (obj.key, null, obj.lu, obj.length, obj.age);
          entry.length = obj.length;
          cache.items[obj.key] = entry;
          cache.list[entry.lu] = entry;
          length += entry.length;
        });

        lru = (items[0] && items[0].lu) || 0;
        mru = (items.length && items[items.length - 1].lu) || 0;
        itemCount = items.length;
      });
  };
}

/*!
 * exports
 */

module.exports = LRUCache;
