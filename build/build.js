/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("johntron~asap@master", Function("exports, module",
"\"use strict\";\n\
\n\
// Use the fastest possible means to execute a task in a future turn\n\
// of the event loop.\n\
\n\
// linked list of tasks (single, with head node)\n\
var head = {task: void 0, next: null};\n\
var tail = head;\n\
var flushing = false;\n\
var requestFlush = void 0;\n\
var hasSetImmediate = typeof setImmediate === \"function\";\n\
var domain;\n\
\n\
if (typeof global != 'undefined') {\n\
\t// Avoid shims from browserify.\n\
\t// The existence of `global` in browsers is guaranteed by browserify.\n\
\tvar process = global.process;\n\
}\n\
\n\
// Note that some fake-Node environments,\n\
// like the Mocha test runner, introduce a `process` global.\n\
var isNodeJS = !!process && ({}).toString.call(process) === \"[object process]\";\n\
\n\
function flush() {\n\
    /* jshint loopfunc: true */\n\
\n\
    while (head.next) {\n\
        head = head.next;\n\
        var task = head.task;\n\
        head.task = void 0;\n\
\n\
        try {\n\
            task();\n\
\n\
        } catch (e) {\n\
            if (isNodeJS) {\n\
                // In node, uncaught exceptions are considered fatal errors.\n\
                // Re-throw them to interrupt flushing!\n\
\n\
                // Ensure continuation if an uncaught exception is suppressed\n\
                // listening process.on(\"uncaughtException\") or domain(\"error\").\n\
                requestFlush();\n\
\n\
                throw e;\n\
\n\
            } else {\n\
                // In browsers, uncaught exceptions are not fatal.\n\
                // Re-throw them asynchronously to avoid slow-downs.\n\
                setTimeout(function () {\n\
                    throw e;\n\
                }, 0);\n\
            }\n\
        }\n\
    }\n\
\n\
    flushing = false;\n\
}\n\
\n\
if (isNodeJS) {\n\
    // Node.js\n\
    requestFlush = function () {\n\
        // Ensure flushing is not bound to any domain.\n\
        var currentDomain = process.domain;\n\
        if (currentDomain) {\n\
            domain = domain || (1,require)(\"domain\");\n\
            domain.active = process.domain = null;\n\
        }\n\
\n\
        // Avoid tick recursion - use setImmediate if it exists.\n\
        if (flushing && hasSetImmediate) {\n\
            setImmediate(flush);\n\
        } else {\n\
            process.nextTick(flush);\n\
        }\n\
\n\
        if (currentDomain) {\n\
            domain.active = process.domain = currentDomain;\n\
        }\n\
    };\n\
\n\
} else if (hasSetImmediate) {\n\
    // In IE10, or https://github.com/NobleJS/setImmediate\n\
    requestFlush = function () {\n\
        setImmediate(flush);\n\
    };\n\
\n\
} else if (typeof MessageChannel !== \"undefined\") {\n\
    // modern browsers\n\
    // http://www.nonblocking.io/2011/06/windownexttick.html\n\
    var channel = new MessageChannel();\n\
    // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create\n\
    // working message ports the first time a page loads.\n\
    channel.port1.onmessage = function () {\n\
        requestFlush = requestPortFlush;\n\
        channel.port1.onmessage = flush;\n\
        flush();\n\
    };\n\
    var requestPortFlush = function () {\n\
        // Opera requires us to provide a message payload, regardless of\n\
        // whether we use it.\n\
        channel.port2.postMessage(0);\n\
    };\n\
    requestFlush = function () {\n\
        setTimeout(flush, 0);\n\
        requestPortFlush();\n\
    };\n\
\n\
} else {\n\
    // old browsers\n\
    requestFlush = function () {\n\
        setTimeout(flush, 0);\n\
    };\n\
}\n\
\n\
function asap(task) {\n\
    if (isNodeJS && process.domain) {\n\
        task = process.domain.bind(task);\n\
    }\n\
\n\
    tail = tail.next = {task: task, next: null};\n\
\n\
    if (!flushing) {\n\
        requestFlush();\n\
        flushing = true;\n\
    }\n\
};\n\
\n\
module.exports = asap;\n\
\n\
//# sourceURL=components/johntron/asap/master/asap.js"
));

require.modules["johntron-asap"] = require.modules["johntron~asap@master"];
require.modules["johntron~asap"] = require.modules["johntron~asap@master"];
require.modules["asap"] = require.modules["johntron~asap@master"];


require.register("then~promise@5.0.0", Function("exports, module",
"'use strict';\n\
\n\
//This file contains then/promise specific extensions to the core promise API\n\
\n\
var Promise = require(\"then~promise@5.0.0/core.js\")\n\
var asap = require(\"johntron~asap@master\")\n\
\n\
module.exports = Promise\n\
\n\
/* Static Functions */\n\
\n\
function ValuePromise(value) {\n\
  this.then = function (onFulfilled) {\n\
    if (typeof onFulfilled !== 'function') return this\n\
    return new Promise(function (resolve, reject) {\n\
      asap(function () {\n\
        try {\n\
          resolve(onFulfilled(value))\n\
        } catch (ex) {\n\
          reject(ex);\n\
        }\n\
      })\n\
    })\n\
  }\n\
}\n\
ValuePromise.prototype = Object.create(Promise.prototype)\n\
\n\
var TRUE = new ValuePromise(true)\n\
var FALSE = new ValuePromise(false)\n\
var NULL = new ValuePromise(null)\n\
var UNDEFINED = new ValuePromise(undefined)\n\
var ZERO = new ValuePromise(0)\n\
var EMPTYSTRING = new ValuePromise('')\n\
\n\
Promise.resolve = function (value) {\n\
  if (value instanceof Promise) return value\n\
\n\
  if (value === null) return NULL\n\
  if (value === undefined) return UNDEFINED\n\
  if (value === true) return TRUE\n\
  if (value === false) return FALSE\n\
  if (value === 0) return ZERO\n\
  if (value === '') return EMPTYSTRING\n\
\n\
  if (typeof value === 'object' || typeof value === 'function') {\n\
    try {\n\
      var then = value.then\n\
      if (typeof then === 'function') {\n\
        return new Promise(then.bind(value))\n\
      }\n\
    } catch (ex) {\n\
      return new Promise(function (resolve, reject) {\n\
        reject(ex)\n\
      })\n\
    }\n\
  }\n\
\n\
  return new ValuePromise(value)\n\
}\n\
\n\
Promise.from = Promise.cast = function (value) {\n\
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')\n\
  err.name = 'Warning'\n\
  console.warn(err.stack)\n\
  return Promise.resolve(value)\n\
}\n\
\n\
Promise.denodeify = function (fn, argumentCount) {\n\
  argumentCount = argumentCount || Infinity\n\
  return function () {\n\
    var self = this\n\
    var args = Array.prototype.slice.call(arguments)\n\
    return new Promise(function (resolve, reject) {\n\
      while (args.length && args.length > argumentCount) {\n\
        args.pop()\n\
      }\n\
      args.push(function (err, res) {\n\
        if (err) reject(err)\n\
        else resolve(res)\n\
      })\n\
      fn.apply(self, args)\n\
    })\n\
  }\n\
}\n\
Promise.nodeify = function (fn) {\n\
  return function () {\n\
    var args = Array.prototype.slice.call(arguments)\n\
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null\n\
    try {\n\
      return fn.apply(this, arguments).nodeify(callback)\n\
    } catch (ex) {\n\
      if (callback === null || typeof callback == 'undefined') {\n\
        return new Promise(function (resolve, reject) { reject(ex) })\n\
      } else {\n\
        asap(function () {\n\
          callback(ex)\n\
        })\n\
      }\n\
    }\n\
  }\n\
}\n\
\n\
Promise.all = function () {\n\
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])\n\
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)\n\
\n\
  if (!calledWithArray) {\n\
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')\n\
    err.name = 'Warning'\n\
    console.warn(err.stack)\n\
  }\n\
\n\
  return new Promise(function (resolve, reject) {\n\
    if (args.length === 0) return resolve([])\n\
    var remaining = args.length\n\
    function res(i, val) {\n\
      try {\n\
        if (val && (typeof val === 'object' || typeof val === 'function')) {\n\
          var then = val.then\n\
          if (typeof then === 'function') {\n\
            then.call(val, function (val) { res(i, val) }, reject)\n\
            return\n\
          }\n\
        }\n\
        args[i] = val\n\
        if (--remaining === 0) {\n\
          resolve(args);\n\
        }\n\
      } catch (ex) {\n\
        reject(ex)\n\
      }\n\
    }\n\
    for (var i = 0; i < args.length; i++) {\n\
      res(i, args[i])\n\
    }\n\
  })\n\
}\n\
\n\
Promise.reject = function (value) {\n\
  return new Promise(function (resolve, reject) { \n\
    reject(value);\n\
  });\n\
}\n\
\n\
Promise.race = function (values) {\n\
  return new Promise(function (resolve, reject) { \n\
    values.forEach(function(value){\n\
      Promise.resolve(value).then(resolve, reject);\n\
    })\n\
  });\n\
}\n\
\n\
/* Prototype Methods */\n\
\n\
Promise.prototype.done = function (onFulfilled, onRejected) {\n\
  var self = arguments.length ? this.then.apply(this, arguments) : this\n\
  self.then(null, function (err) {\n\
    asap(function () {\n\
      throw err\n\
    })\n\
  })\n\
}\n\
\n\
Promise.prototype.nodeify = function (callback) {\n\
  if (typeof callback != 'function') return this\n\
\n\
  this.then(function (value) {\n\
    asap(function () {\n\
      callback(null, value)\n\
    })\n\
  }, function (err) {\n\
    asap(function () {\n\
      callback(err)\n\
    })\n\
  })\n\
}\n\
\n\
Promise.prototype['catch'] = function (onRejected) {\n\
  return this.then(null, onRejected);\n\
}\n\
\n\
//# sourceURL=components/then/promise/5.0.0/index.js"
));

require.register("then~promise@5.0.0/core.js", Function("exports, module",
"'use strict';\n\
\n\
var asap = require(\"johntron~asap@master\")\n\
\n\
module.exports = Promise\n\
function Promise(fn) {\n\
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')\n\
  if (typeof fn !== 'function') throw new TypeError('not a function')\n\
  var state = null\n\
  var value = null\n\
  var deferreds = []\n\
  var self = this\n\
\n\
  this.then = function(onFulfilled, onRejected) {\n\
    return new Promise(function(resolve, reject) {\n\
      handle(new Handler(onFulfilled, onRejected, resolve, reject))\n\
    })\n\
  }\n\
\n\
  function handle(deferred) {\n\
    if (state === null) {\n\
      deferreds.push(deferred)\n\
      return\n\
    }\n\
    asap(function() {\n\
      var cb = state ? deferred.onFulfilled : deferred.onRejected\n\
      if (cb === null) {\n\
        (state ? deferred.resolve : deferred.reject)(value)\n\
        return\n\
      }\n\
      var ret\n\
      try {\n\
        ret = cb(value)\n\
      }\n\
      catch (e) {\n\
        deferred.reject(e)\n\
        return\n\
      }\n\
      deferred.resolve(ret)\n\
    })\n\
  }\n\
\n\
  function resolve(newValue) {\n\
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure\n\
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')\n\
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {\n\
        var then = newValue.then\n\
        if (typeof then === 'function') {\n\
          doResolve(then.bind(newValue), resolve, reject)\n\
          return\n\
        }\n\
      }\n\
      state = true\n\
      value = newValue\n\
      finale()\n\
    } catch (e) { reject(e) }\n\
  }\n\
\n\
  function reject(newValue) {\n\
    state = false\n\
    value = newValue\n\
    finale()\n\
  }\n\
\n\
  function finale() {\n\
    for (var i = 0, len = deferreds.length; i < len; i++)\n\
      handle(deferreds[i])\n\
    deferreds = null\n\
  }\n\
\n\
  doResolve(fn, resolve, reject)\n\
}\n\
\n\
\n\
function Handler(onFulfilled, onRejected, resolve, reject){\n\
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null\n\
  this.onRejected = typeof onRejected === 'function' ? onRejected : null\n\
  this.resolve = resolve\n\
  this.reject = reject\n\
}\n\
\n\
/**\n\
 * Take a potentially misbehaving resolver function and make sure\n\
 * onFulfilled and onRejected are only called once.\n\
 *\n\
 * Makes no guarantees about asynchrony.\n\
 */\n\
function doResolve(fn, onFulfilled, onRejected) {\n\
  var done = false;\n\
  try {\n\
    fn(function (value) {\n\
      if (done) return\n\
      done = true\n\
      onFulfilled(value)\n\
    }, function (reason) {\n\
      if (done) return\n\
      done = true\n\
      onRejected(reason)\n\
    })\n\
  } catch (ex) {\n\
    if (done) return\n\
    done = true\n\
    onRejected(ex)\n\
  }\n\
}\n\
\n\
//# sourceURL=components/then/promise/5.0.0/core.js"
));

require.modules["then-promise"] = require.modules["then~promise@5.0.0"];
require.modules["then~promise"] = require.modules["then~promise@5.0.0"];
require.modules["promise"] = require.modules["then~promise@5.0.0"];


require.register("mozilla~localforage@0.7.0", Function("exports, module",
"(function() {\n\
    'use strict';\n\
\n\
    // Promises!\n\
    var Promise = (typeof module !== 'undefined' && module.exports) ?\n\
                  require(\"then~promise@5.0.0\") : this.Promise;\n\
\n\
    // Avoid those magic constants!\n\
    var MODULE_TYPE_DEFINE = 1;\n\
    var MODULE_TYPE_EXPORT = 2;\n\
    var MODULE_TYPE_WINDOW = 3;\n\
\n\
    // Attaching to window (i.e. no module loader) is the assumed,\n\
    // simple default.\n\
    var moduleType = MODULE_TYPE_WINDOW;\n\
\n\
    // Find out what kind of module setup we have; if none, we'll just attach\n\
    // localForage to the main window.\n\
    if (typeof define === 'function' && define.amd) {\n\
        moduleType = MODULE_TYPE_DEFINE;\n\
    } else if (typeof module !== 'undefined' && module.exports) {\n\
        moduleType = MODULE_TYPE_EXPORT;\n\
    }\n\
\n\
    // Initialize IndexedDB; fall back to vendor-prefixed versions if needed.\n\
    var indexedDB = indexedDB || this.indexedDB || this.webkitIndexedDB ||\n\
                    this.mozIndexedDB || this.OIndexedDB ||\n\
                    this.msIndexedDB;\n\
\n\
    // Check for WebSQL.\n\
    var openDatabase = this.openDatabase;\n\
\n\
    // The actual localForage object that we expose as a module or via a global.\n\
    // It's extended by pulling in one of our other libraries.\n\
    var _this = this;\n\
    var localForage = {\n\
        INDEXEDDB: 'asyncStorage',\n\
        LOCALSTORAGE: 'localStorageWrapper',\n\
        WEBSQL: 'webSQLStorage',\n\
\n\
        _config: {\n\
            description: '',\n\
            name: 'localforage',\n\
            // Default DB size is _JUST UNDER_ 5MB, as it's the highest size\n\
            // we can use without a prompt.\n\
            size: 4980736,\n\
            storeName: 'keyvaluepairs',\n\
            version: 1.0\n\
        },\n\
\n\
        // Set any config values for localForage; can be called anytime before\n\
        // the first API call (e.g. `getItem`, `setItem`).\n\
        // We loop through options so we don't overwrite existing config\n\
        // values.\n\
        config: function(options) {\n\
            // If the options argument is an object, we use it to set values.\n\
            // Otherwise, we return either a specified config value or all\n\
            // config values.\n\
            if (typeof(options) === 'object') {\n\
                // If localforage is ready and fully initialized, we can't set\n\
                // any new configuration values. Instead, we return an error.\n\
                if (this._ready) {\n\
                    return new Error(\"Can't call config() after localforage \" +\n\
                                     \"has been used.\");\n\
                }\n\
\n\
                for (var i in options) {\n\
                    this._config[i] = options[i];\n\
                }\n\
\n\
                return true;\n\
            } else if (typeof(options) === 'string') {\n\
                return this._config[options];\n\
            } else {\n\
                return this._config;\n\
            }\n\
        },\n\
\n\
        driver: function() {\n\
            return this._driver || null;\n\
        },\n\
\n\
        _ready: Promise.reject(new Error(\"setDriver() wasn't called\")),\n\
\n\
        setDriver: function(driverName, callback) {\n\
            var driverSet = new Promise(function(resolve, reject) {\n\
                if ((!indexedDB && driverName === localForage.INDEXEDDB) ||\n\
                    (!openDatabase && driverName === localForage.WEBSQL)) {\n\
                    reject(localForage);\n\
\n\
                    return;\n\
                }\n\
\n\
                localForage._ready = null;\n\
\n\
                // We allow localForage to be declared as a module or as a library\n\
                // available without AMD/require.js.\n\
                if (moduleType === MODULE_TYPE_DEFINE) {\n\
                    require([driverName], function(lib) {\n\
                        localForage._extend(lib);\n\
\n\
                        resolve(localForage);\n\
                    });\n\
\n\
                    // Return here so we don't resolve the promise twice.\n\
                    return;\n\
                } else if (moduleType === MODULE_TYPE_EXPORT) {\n\
                    // Making it browserify friendly\n\
                    var driver;\n\
                    switch (driverName) {\n\
                        case localForage.INDEXEDDB:\n\
                            driver = require(\"mozilla~localforage@0.7.0/src/drivers/indexeddb.js\");\n\
                            break;\n\
                        case localForage.LOCALSTORAGE:\n\
                            driver = require(\"mozilla~localforage@0.7.0/src/drivers/localstorage.js\");\n\
                            break;\n\
                        case localForage.WEBSQL:\n\
                            driver = require(\"mozilla~localforage@0.7.0/src/drivers/websql.js\");\n\
                    }\n\
\n\
                    localForage._extend(driver);\n\
                } else {\n\
                    localForage._extend(_this[driverName]);\n\
                }\n\
\n\
                resolve(localForage);\n\
            });\n\
\n\
            driverSet.then(callback, callback);\n\
\n\
            return driverSet;\n\
        },\n\
\n\
        ready: function(callback) {\n\
            if (this._ready === null) {\n\
                this._ready = this._initStorage(this._config);\n\
            }\n\
\n\
            this._ready.then(callback, callback);\n\
\n\
            return this._ready;\n\
        },\n\
\n\
        _extend: function(libraryMethodsAndProperties) {\n\
            for (var i in libraryMethodsAndProperties) {\n\
                if (libraryMethodsAndProperties.hasOwnProperty(i)) {\n\
                    this[i] = libraryMethodsAndProperties[i];\n\
                }\n\
            }\n\
        }\n\
    };\n\
\n\
    // Select our storage library.\n\
    var storageLibrary;\n\
    // Check to see if IndexedDB is available and if it is the latest\n\
    // implementation; it's our preferred backend library. We use \"_spec_test\"\n\
    // as the name of the database because it's not the one we'll operate on,\n\
    // but it's useful to make sure its using the right spec.\n\
    // See: https://github.com/mozilla/localForage/issues/128\n\
    if (indexedDB && indexedDB.open('_localforage_spec_test', 1).onupgradeneeded === null ) {\n\
        storageLibrary = localForage.INDEXEDDB;\n\
    } else if (openDatabase) { // WebSQL is available, so we'll use that.\n\
        storageLibrary = localForage.WEBSQL;\n\
    } else { // If nothing else is available, we use localStorage.\n\
        storageLibrary = localForage.LOCALSTORAGE;\n\
    }\n\
\n\
    // If window.localForageConfig is set, use it for configuration.\n\
    if (this.localForageConfig) {\n\
        localForage.config = this.localForageConfig;\n\
    }\n\
\n\
    // Set the (default) driver.\n\
    localForage.setDriver(storageLibrary);\n\
\n\
    // We allow localForage to be declared as a module or as a library\n\
    // available without AMD/require.js.\n\
    if (moduleType === MODULE_TYPE_DEFINE) {\n\
        define(function() {\n\
            return localForage;\n\
        });\n\
    } else if (moduleType === MODULE_TYPE_EXPORT) {\n\
        module.exports = localForage;\n\
    } else {\n\
        this.localforage = localForage;\n\
    }\n\
}).call(this);\n\
\n\
//# sourceURL=components/mozilla/localforage/0.7.0/src/localforage.js"
));

require.register("mozilla~localforage@0.7.0/src/drivers/indexeddb.js", Function("exports, module",
"// Some code originally from async_storage.js in\n\
// [Gaia](https://github.com/mozilla-b2g/gaia).\n\
(function() {\n\
    'use strict';\n\
\n\
    // Originally found in https://github.com/mozilla-b2g/gaia/blob/e8f624e4cc9ea945727278039b3bc9bcb9f8667a/shared/js/async_storage.js\n\
\n\
    // Promises!\n\
    var Promise = (typeof module !== 'undefined' && module.exports) ?\n\
                  require(\"then~promise@5.0.0\") : this.Promise;\n\
\n\
    var db = null;\n\
    var dbInfo = {};\n\
\n\
    // Initialize IndexedDB; fall back to vendor-prefixed versions if needed.\n\
    var indexedDB = indexedDB || this.indexedDB || this.webkitIndexedDB ||\n\
                    this.mozIndexedDB || this.OIndexedDB ||\n\
                    this.msIndexedDB;\n\
\n\
    // If IndexedDB isn't available, we get outta here!\n\
    if (!indexedDB) {\n\
        return;\n\
    }\n\
\n\
    // Open the IndexedDB database (automatically creates one if one didn't\n\
    // previously exist), using any options set in window.localForageConfig.\n\
    function _initStorage(options) {\n\
        if (options) {\n\
            for (var i in options) {\n\
                dbInfo[i] = options[i];\n\
            }\n\
        }\n\
\n\
        return new Promise(function(resolve, reject) {\n\
            var openreq = indexedDB.open(dbInfo.name, dbInfo.version);\n\
            openreq.onerror = function withStoreOnError() {\n\
                reject(openreq.error.name);\n\
            };\n\
            openreq.onupgradeneeded = function withStoreOnUpgradeNeeded() {\n\
                // First time setup: create an empty object store\n\
                openreq.result.createObjectStore(dbInfo.storeName);\n\
            };\n\
            openreq.onsuccess = function withStoreOnSuccess() {\n\
                db = openreq.result;\n\
                resolve();\n\
            };\n\
        });\n\
    }\n\
\n\
    function getItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readonly')\n\
                              .objectStore(dbInfo.storeName);\n\
                var req = store.get(key);\n\
\n\
                req.onsuccess = function() {\n\
                    var value = req.result;\n\
                    if (value === undefined) {\n\
                        value = null;\n\
                    }\n\
\n\
                    if (callback) {\n\
                        callback(value);\n\
                    }\n\
\n\
                    resolve(value);\n\
                };\n\
\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(null, req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    function setItem(key, value, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readwrite')\n\
                              .objectStore(dbInfo.storeName);\n\
\n\
                // Cast to undefined so the value passed to callback/promise is\n\
                // the same as what one would get out of `getItem()` later.\n\
                // This leads to some weirdness (setItem('foo', undefined) will\n\
                // return \"null\"), but it's not my fault localStorage is our\n\
                // baseline and that it's weird.\n\
                if (value === undefined) {\n\
                    value = null;\n\
                }\n\
\n\
                var req = store.put(value, key);\n\
                req.onsuccess = function() {\n\
                    if (callback) {\n\
                        callback(value);\n\
                    }\n\
\n\
                    resolve(value);\n\
                };\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(null, req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    function removeItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readwrite')\n\
                              .objectStore(dbInfo.storeName);\n\
\n\
                // We use `['delete']` instead of `.delete` because IE 8 will\n\
                // throw a fit if it sees the reserved word \"delete\" in this\n\
                // scenario. See: https://github.com/mozilla/localForage/pull/67\n\
                //\n\
                // This can be removed once we no longer care about IE 8, for\n\
                // what that's worth.\n\
                // TODO: Write a test against this? Maybe IE in general? Also,\n\
                // make sure the minify step doesn't optimise this to `.delete`,\n\
                // though it currently doesn't.\n\
                var req = store['delete'](key);\n\
                req.onsuccess = function() {\n\
                    if (callback) {\n\
                        callback();\n\
                    }\n\
\n\
                    resolve();\n\
                };\n\
\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
\n\
                // The request will be aborted if we've exceeded our storage\n\
                // space. In this case, we will reject with a specific\n\
                // \"QuotaExceededError\".\n\
                req.onabort = function(event) {\n\
                    var error = event.target.error;\n\
                    if (error.name === 'QuotaExceededError') {\n\
                        if (callback) {\n\
                            callback(error.name);\n\
                        }\n\
\n\
                        reject(error.name);\n\
                    }\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    function clear(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readwrite')\n\
                              .objectStore(dbInfo.storeName);\n\
                var req = store.clear();\n\
\n\
                req.onsuccess = function() {\n\
                    if (callback) {\n\
                        callback();\n\
                    }\n\
\n\
                    resolve();\n\
                };\n\
\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(null, req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    function length(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readonly')\n\
                              .objectStore(dbInfo.storeName);\n\
                var req = store.count();\n\
\n\
                req.onsuccess = function() {\n\
                    if (callback) {\n\
                        callback(req.result);\n\
                    }\n\
\n\
                    resolve(req.result);\n\
                };\n\
\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(null, req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    function key(n, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            if (n < 0) {\n\
                if (callback) {\n\
                    callback(null);\n\
                }\n\
\n\
                resolve(null);\n\
\n\
                return;\n\
            }\n\
\n\
            _this.ready().then(function() {\n\
                var store = db.transaction(dbInfo.storeName, 'readonly')\n\
                              .objectStore(dbInfo.storeName);\n\
\n\
                var advanced = false;\n\
                var req = store.openCursor();\n\
                req.onsuccess = function() {\n\
                    var cursor = req.result;\n\
                    if (!cursor) {\n\
                        // this means there weren't enough keys\n\
                        if (callback) {\n\
                            callback(null);\n\
                        }\n\
\n\
                        resolve(null);\n\
\n\
                        return;\n\
                    }\n\
\n\
                    if (n === 0) {\n\
                        // We have the first key, return it if that's what they\n\
                        // wanted.\n\
                        if (callback) {\n\
                            callback(cursor.key);\n\
                        }\n\
\n\
                        resolve(cursor.key);\n\
                    } else {\n\
                        if (!advanced) {\n\
                            // Otherwise, ask the cursor to skip ahead n\n\
                            // records.\n\
                            advanced = true;\n\
                            cursor.advance(n);\n\
                        } else {\n\
                            // When we get here, we've got the nth key.\n\
                            if (callback) {\n\
                                callback(cursor.key);\n\
                            }\n\
\n\
                            resolve(cursor.key);\n\
                        }\n\
                    }\n\
                };\n\
\n\
                req.onerror = function() {\n\
                    if (callback) {\n\
                        callback(null, req.error.name);\n\
                    }\n\
\n\
                    reject(req.error.name);\n\
                };\n\
            });\n\
        });\n\
    }\n\
\n\
    var asyncStorage = {\n\
        _driver: 'asyncStorage',\n\
        _initStorage: _initStorage,\n\
        getItem: getItem,\n\
        setItem: setItem,\n\
        removeItem: removeItem,\n\
        clear: clear,\n\
        length: length,\n\
        key: key\n\
    };\n\
\n\
    if (typeof define === 'function' && define.amd) {\n\
        define('asyncStorage', function() {\n\
            return asyncStorage;\n\
        });\n\
    } else if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = asyncStorage;\n\
    } else {\n\
        this.asyncStorage = asyncStorage;\n\
    }\n\
}).call(this);\n\
\n\
//# sourceURL=components/mozilla/localforage/0.7.0/src/drivers/indexeddb.js"
));

require.register("mozilla~localforage@0.7.0/src/drivers/localstorage.js", Function("exports, module",
"// If IndexedDB isn't available, we'll fall back to localStorage.\n\
// Note that this will have considerable performance and storage\n\
// side-effects (all data will be serialized on save and only data that\n\
// can be converted to a string via `JSON.stringify()` will be saved).\n\
(function() {\n\
    'use strict';\n\
\n\
    var keyPrefix = '';\n\
    var dbInfo = {};\n\
    // Promises!\n\
    var Promise = (typeof module !== 'undefined' && module.exports) ?\n\
                  require(\"then~promise@5.0.0\") : this.Promise;\n\
    var localStorage = null;\n\
\n\
    // If the app is running inside a Google Chrome packaged webapp, or some\n\
    // other context where localStorage isn't available, we don't use\n\
    // localStorage. This feature detection is preferred over the old\n\
    // `if (window.chrome && window.chrome.runtime)` code.\n\
    // See: https://github.com/mozilla/localForage/issues/68\n\
    try {\n\
        // Initialize localStorage and create a variable to use throughout\n\
        // the code.\n\
        localStorage = this.localStorage;\n\
    } catch (e) {\n\
        return;\n\
    }\n\
\n\
    // Config the localStorage backend, using options set in\n\
    // window.localForageConfig.\n\
    function _initStorage(options) {\n\
        if (options) {\n\
            for (var i in options) {\n\
                dbInfo[i] = options[i];\n\
            }\n\
        }\n\
\n\
        keyPrefix = dbInfo.name + '/';\n\
\n\
        return Promise.resolve();\n\
    }\n\
\n\
    var SERIALIZED_MARKER = '__lfsc__:';\n\
    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;\n\
\n\
    // OMG the serializations!\n\
    var TYPE_ARRAYBUFFER = 'arbf';\n\
    var TYPE_BLOB = 'blob';\n\
    var TYPE_INT8ARRAY = 'si08';\n\
    var TYPE_UINT8ARRAY = 'ui08';\n\
    var TYPE_UINT8CLAMPEDARRAY = 'uic8';\n\
    var TYPE_INT16ARRAY = 'si16';\n\
    var TYPE_INT32ARRAY = 'si32';\n\
    var TYPE_UINT16ARRAY = 'ur16';\n\
    var TYPE_UINT32ARRAY = 'ui32';\n\
    var TYPE_FLOAT32ARRAY = 'fl32';\n\
    var TYPE_FLOAT64ARRAY = 'fl64';\n\
    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;\n\
\n\
    // Remove all keys from the datastore, effectively destroying all data in\n\
    // the app's key/value store!\n\
    function clear(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve) {\n\
            _this.ready().then(function() {\n\
                localStorage.clear();\n\
\n\
                if (callback) {\n\
                    callback();\n\
                }\n\
\n\
                resolve();\n\
            });\n\
        });\n\
    }\n\
\n\
    // Retrieve an item from the store. Unlike the original async_storage\n\
    // library in Gaia, we don't modify return values at all. If a key's value\n\
    // is `undefined`, we pass that value to the callback function.\n\
    function getItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                try {\n\
                    var result = localStorage.getItem(keyPrefix + key);\n\
\n\
                    // If a result was found, parse it from the serialized\n\
                    // string into a JS object. If result isn't truthy, the key\n\
                    // is likely undefined and we'll pass it straight to the\n\
                    // callback.\n\
                    if (result) {\n\
                        result = _deserialize(result);\n\
                    }\n\
\n\
                    if (callback) {\n\
                        callback(result, null);\n\
                    }\n\
\n\
                    resolve(result);\n\
                } catch (e) {\n\
                    if (callback) {\n\
                        callback(null, e);\n\
                    }\n\
\n\
                    reject(e);\n\
                }\n\
            });\n\
        });\n\
    }\n\
\n\
    // Same as localStorage's key() method, except takes a callback.\n\
    function key(n, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve) {\n\
            _this.ready().then(function() {\n\
                var result = localStorage.key(n);\n\
\n\
                // Remove the prefix from the key, if a key is found.\n\
                if (result) {\n\
                    result = result.substring(keyPrefix.length);\n\
                }\n\
\n\
                if (callback) {\n\
                    callback(result);\n\
                }\n\
                resolve(result);\n\
            });\n\
        });\n\
    }\n\
\n\
    // Supply the number of keys in the datastore to the callback function.\n\
    function length(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve) {\n\
            _this.ready().then(function() {\n\
                var result = localStorage.length;\n\
\n\
                if (callback) {\n\
                    callback(result);\n\
                }\n\
\n\
                resolve(result);\n\
            });\n\
        });\n\
    }\n\
\n\
    // Remove an item from the store, nice and simple.\n\
    function removeItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve) {\n\
            _this.ready().then(function() {\n\
                localStorage.removeItem(keyPrefix + key);\n\
\n\
                if (callback) {\n\
                    callback();\n\
                }\n\
\n\
                resolve();\n\
            });\n\
        });\n\
    }\n\
\n\
    // Deserialize data we've inserted into a value column/field. We place\n\
    // special markers into our strings to mark them as encoded; this isn't\n\
    // as nice as a meta field, but it's the only sane thing we can do whilst\n\
    // keeping localStorage support intact.\n\
    //\n\
    // Oftentimes this will just deserialize JSON content, but if we have a\n\
    // special marker (SERIALIZED_MARKER, defined above), we will extract\n\
    // some kind of arraybuffer/binary data/typed array out of the string.\n\
    function _deserialize(value) {\n\
        // If we haven't marked this string as being specially serialized (i.e.\n\
        // something other than serialized JSON), we can just return it and be\n\
        // done with it.\n\
        if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {\n\
            return JSON.parse(value);\n\
        }\n\
\n\
        // The following code deals with deserializing some kind of Blob or\n\
        // TypedArray. First we separate out the type of data we're dealing\n\
        // with from the data itself.\n\
        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);\n\
        var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);\n\
\n\
        // Fill the string into a ArrayBuffer.\n\
        var buffer = new ArrayBuffer(serializedString.length * 2); // 2 bytes for each char\n\
        var bufferView = new Uint16Array(buffer);\n\
        for (var i = serializedString.length - 1; i >= 0; i--) {\n\
            bufferView[i] = serializedString.charCodeAt(i);\n\
        }\n\
\n\
        // Return the right type based on the code/type set during\n\
        // serialization.\n\
        switch (type) {\n\
            case TYPE_ARRAYBUFFER:\n\
                return buffer;\n\
            case TYPE_BLOB:\n\
                return new Blob([buffer]);\n\
            case TYPE_INT8ARRAY:\n\
                return new Int8Array(buffer);\n\
            case TYPE_UINT8ARRAY:\n\
                return new Uint8Array(buffer);\n\
            case TYPE_UINT8CLAMPEDARRAY:\n\
                return new Uint8ClampedArray(buffer);\n\
            case TYPE_INT16ARRAY:\n\
                return new Int16Array(buffer);\n\
            case TYPE_UINT16ARRAY:\n\
                return new Uint16Array(buffer);\n\
            case TYPE_INT32ARRAY:\n\
                return new Int32Array(buffer);\n\
            case TYPE_UINT32ARRAY:\n\
                return new Uint32Array(buffer);\n\
            case TYPE_FLOAT32ARRAY:\n\
                return new Float32Array(buffer);\n\
            case TYPE_FLOAT64ARRAY:\n\
                return new Float64Array(buffer);\n\
            default:\n\
                throw new Error('Unkown type: ' + type);\n\
        }\n\
    }\n\
\n\
    // Converts a buffer to a string to store, serialized, in the backend\n\
    // storage library.\n\
    function _bufferToString(buffer) {\n\
        var str = '';\n\
        var uint16Array = new Uint16Array(buffer);\n\
\n\
        try {\n\
            str = String.fromCharCode.apply(null, uint16Array);\n\
        } catch (e) {\n\
            // This is a fallback implementation in case the first one does\n\
            // not work. This is required to get the phantomjs passing...\n\
            for (var i = 0; i < uint16Array.length; i++) {\n\
                str += String.fromCharCode(uint16Array[i]);\n\
            }\n\
        }\n\
\n\
        return str;\n\
    }\n\
\n\
    // Serialize a value, afterwards executing a callback (which usually\n\
    // instructs the `setItem()` callback/promise to be executed). This is how\n\
    // we store binary data with localStorage.\n\
    function _serialize(value, callback) {\n\
        var valueString = '';\n\
        if (value) {\n\
            valueString = value.toString();\n\
        }\n\
\n\
        // Cannot use `value instanceof ArrayBuffer` or such here, as these\n\
        // checks fail when running the tests using casper.js...\n\
        //\n\
        // TODO: See why those tests fail and use a better solution.\n\
        if (value && (value.toString() === '[object ArrayBuffer]' ||\n\
                      value.buffer && value.buffer.toString() === '[object ArrayBuffer]')) {\n\
            // Convert binary arrays to a string and prefix the string with\n\
            // a special marker.\n\
            var buffer;\n\
            var marker = SERIALIZED_MARKER;\n\
\n\
            if (value instanceof ArrayBuffer) {\n\
                buffer = value;\n\
                marker += TYPE_ARRAYBUFFER;\n\
            } else {\n\
                buffer = value.buffer;\n\
\n\
                if (valueString === '[object Int8Array]') {\n\
                    marker += TYPE_INT8ARRAY;\n\
                } else if (valueString === '[object Uint8Array]') {\n\
                    marker += TYPE_UINT8ARRAY;\n\
                } else if (valueString === '[object Uint8ClampedArray]') {\n\
                    marker += TYPE_UINT8CLAMPEDARRAY;\n\
                } else if (valueString === '[object Int16Array]') {\n\
                    marker += TYPE_INT16ARRAY;\n\
                } else if (valueString === '[object Uint16Array]') {\n\
                    marker += TYPE_UINT16ARRAY;\n\
                } else if (valueString === '[object Int32Array]') {\n\
                    marker += TYPE_INT32ARRAY;\n\
                } else if (valueString === '[object Uint32Array]') {\n\
                    marker += TYPE_UINT32ARRAY;\n\
                } else if (valueString === '[object Float32Array]') {\n\
                    marker += TYPE_FLOAT32ARRAY;\n\
                } else if (valueString === '[object Float64Array]') {\n\
                    marker += TYPE_FLOAT64ARRAY;\n\
                } else {\n\
                    callback(new Error(\"Failed to get type for BinaryArray\"));\n\
                }\n\
            }\n\
\n\
            callback(marker + _bufferToString(buffer));\n\
        } else if (valueString === \"[object Blob]\") {\n\
            // Conver the blob to a binaryArray and then to a string.\n\
            var fileReader = new FileReader();\n\
\n\
            fileReader.onload = function() {\n\
                var str = _bufferToString(this.result);\n\
\n\
                callback(SERIALIZED_MARKER + TYPE_BLOB + str);\n\
            };\n\
\n\
            fileReader.readAsArrayBuffer(value);\n\
        } else {\n\
            try {\n\
                callback(JSON.stringify(value));\n\
            } catch (e) {\n\
                if (window.console && window.console.error) {\n\
                    window.console.error(\"Couldn't convert value into a JSON string: \", value);\n\
                }\n\
\n\
                callback(null, e);\n\
            }\n\
        }\n\
    }\n\
\n\
    // Set a key's value and run an optional callback once the value is set.\n\
    // Unlike Gaia's implementation, the callback function is passed the value,\n\
    // in case you want to operate on that value only after you're sure it\n\
    // saved, or something like that.\n\
    function setItem(key, value, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                // Convert undefined values to null.\n\
                // https://github.com/mozilla/localForage/pull/42\n\
                if (value === undefined) {\n\
                    value = null;\n\
                }\n\
\n\
                // Save the original value to pass to the callback.\n\
                var originalValue = value;\n\
\n\
                _serialize(value, function(value, error) {\n\
                    if (error) {\n\
                        if (callback) {\n\
                            callback(null, error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    } else {\n\
                        try {\n\
                            localStorage.setItem(keyPrefix + key, value);\n\
                        } catch (e) {\n\
                            // localStorage capacity exceeded.\n\
                            // TODO: Make this a specific error/event.\n\
                            if (e.name === 'QuotaExceededError' ||\n\
                                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {\n\
                                if (callback) {\n\
                                    callback(null, e);\n\
                                }\n\
\n\
                                reject(e);\n\
                            }\n\
                        }\n\
\n\
                        if (callback) {\n\
                            callback(originalValue);\n\
                        }\n\
\n\
                        resolve(originalValue);\n\
                    }\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    var localStorageWrapper = {\n\
        _driver: 'localStorageWrapper',\n\
        _initStorage: _initStorage,\n\
        // Default API, from Gaia/localStorage.\n\
        getItem: getItem,\n\
        setItem: setItem,\n\
        removeItem: removeItem,\n\
        clear: clear,\n\
        length: length,\n\
        key: key\n\
    };\n\
\n\
    if (typeof define === 'function' && define.amd) {\n\
        define('localStorageWrapper', function() {\n\
            return localStorageWrapper;\n\
        });\n\
    } else if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = localStorageWrapper;\n\
    } else {\n\
        this.localStorageWrapper = localStorageWrapper;\n\
    }\n\
}).call(this);\n\
\n\
//# sourceURL=components/mozilla/localforage/0.7.0/src/drivers/localstorage.js"
));

require.register("mozilla~localforage@0.7.0/src/drivers/websql.js", Function("exports, module",
"/*\n\
 * Includes code from:\n\
 *\n\
 * base64-arraybuffer\n\
 * https://github.com/niklasvh/base64-arraybuffer\n\
 *\n\
 * Copyright (c) 2012 Niklas von Hertzen\n\
 * Licensed under the MIT license.\n\
 */\n\
(function() {\n\
    'use strict';\n\
\n\
    // Sadly, the best way to save binary data in WebSQL is Base64 serializing\n\
    // it, so this is how we store it to prevent very strange errors with less\n\
    // verbose ways of binary <-> string data storage.\n\
    var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n\
\n\
    // Promises!\n\
    var Promise = (typeof module !== 'undefined' && module.exports) ?\n\
                  require(\"then~promise@5.0.0\") : this.Promise;\n\
\n\
    var openDatabase = this.openDatabase;\n\
    var db = null;\n\
    var dbInfo = {};\n\
\n\
    var SERIALIZED_MARKER = '__lfsc__:';\n\
    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;\n\
\n\
    // OMG the serializations!\n\
    var TYPE_ARRAYBUFFER = 'arbf';\n\
    var TYPE_BLOB = 'blob';\n\
    var TYPE_INT8ARRAY = 'si08';\n\
    var TYPE_UINT8ARRAY = 'ui08';\n\
    var TYPE_UINT8CLAMPEDARRAY = 'uic8';\n\
    var TYPE_INT16ARRAY = 'si16';\n\
    var TYPE_INT32ARRAY = 'si32';\n\
    var TYPE_UINT16ARRAY = 'ur16';\n\
    var TYPE_UINT32ARRAY = 'ui32';\n\
    var TYPE_FLOAT32ARRAY = 'fl32';\n\
    var TYPE_FLOAT64ARRAY = 'fl64';\n\
    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;\n\
\n\
    // If WebSQL methods aren't available, we can stop now.\n\
    if (!openDatabase) {\n\
        return;\n\
    }\n\
\n\
    // Open the WebSQL database (automatically creates one if one didn't\n\
    // previously exist), using any options set in window.localForageConfig.\n\
    function _initStorage(options) {\n\
        var _this = this;\n\
\n\
        if (options) {\n\
            for (var i in dbInfo) {\n\
                dbInfo[i] = typeof(options[i]) !== 'string' ? options[i].toString() : options[i];\n\
            }\n\
        }\n\
\n\
        return new Promise(function(resolve) {\n\
            // Open the database; the openDatabase API will automatically\n\
            // create it for us if it doesn't exist.\n\
            try {\n\
                db = openDatabase(dbInfo.name, dbInfo.version,\n\
                                  dbInfo.description, dbInfo.size);\n\
            } catch (e) {\n\
                return _this.setDriver('localStorageWrapper').then(resolve);\n\
            }\n\
\n\
            // Create our key/value table if it doesn't exist.\n\
            db.transaction(function (t) {\n\
                t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + \n\
                             ' (id INTEGER PRIMARY KEY, key unique, value)', [], function() {\n\
                    resolve();\n\
                }, null);\n\
            });\n\
        });\n\
    }\n\
\n\
    function getItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                db.transaction(function (t) {\n\
                    t.executeSql('SELECT * FROM ' + dbInfo.storeName + \n\
                                 ' WHERE key = ? LIMIT 1', [key], function (t, results) {\n\
                        var result = results.rows.length ? results.rows.item(0).value : null;\n\
\n\
                        // Check to see if this is serialized content we need to\n\
                        // unpack.\n\
                        if (result) {\n\
                            result = _deserialize(result);\n\
                        }\n\
\n\
                        if (callback) {\n\
                            callback(result);\n\
                        }\n\
\n\
                        resolve(result);\n\
                    }, function(t, error) {\n\
                        if (callback) {\n\
                            callback(null, error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    });\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    function setItem(key, value, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                // The localStorage API doesn't return undefined values in an\n\
                // \"expected\" way, so undefined is always cast to null in all\n\
                // drivers. See: https://github.com/mozilla/localForage/pull/42\n\
                if (value === undefined) {\n\
                    value = null;\n\
                }\n\
\n\
                // Save the original value to pass to the callback.\n\
                var originalValue = value;\n\
\n\
                _serialize(value, function(value, error) {\n\
                    if (error) {\n\
                        reject(error);\n\
                    } else {\n\
                        db.transaction(function (t) {\n\
                            t.executeSql('INSERT OR REPLACE INTO ' + dbInfo.storeName + \n\
                                         ' (key, value) VALUES (?, ?)', [key, value], function() {\n\
                                if (callback) {\n\
                                    callback(originalValue);\n\
                                }\n\
\n\
                                resolve(originalValue);\n\
                            }, function(t, error) {\n\
                                if (callback) {\n\
                                    callback(null, error);\n\
                                }\n\
\n\
                                reject(error);\n\
                            });\n\
                        }, function(sqlError) { // The transaction failed; check\n\
                                                // to see if it's a quota error.\n\
                            if (sqlError.code === sqlError.QUOTA_ERR) {\n\
                                // We reject the callback outright for now, but\n\
                                // it's worth trying to re-run the transaction.\n\
                                // Even if the user accepts the prompt to use\n\
                                // more storage on Safari, this error will\n\
                                // be called.\n\
                                //\n\
                                // TODO: Try to re-run the transaction.\n\
                                if (callback) {\n\
                                    callback(null, sqlError);\n\
                                }\n\
\n\
                                reject(sqlError);\n\
                            }\n\
                        });\n\
                    }\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    function removeItem(key, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                db.transaction(function (t) {\n\
                    t.executeSql('DELETE FROM ' + dbInfo.storeName + \n\
                                 ' WHERE key = ?', [key], function() {\n\
                        if (callback) {\n\
                            callback();\n\
                        }\n\
\n\
                        resolve();\n\
                    }, function(t, error) {\n\
                        if (callback) {\n\
                            callback(error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    });\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    // Deletes every item in the table.\n\
    // TODO: Find out if this resets the AUTO_INCREMENT number.\n\
    function clear(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                db.transaction(function (t) {\n\
                    t.executeSql('DELETE FROM ' + dbInfo.storeName, [], function() {\n\
                        if (callback) {\n\
                            callback();\n\
                        }\n\
\n\
                        resolve();\n\
                    }, function(t, error) {\n\
                        if (callback) {\n\
                            callback(error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    });\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    // Does a simple `COUNT(key)` to get the number of items stored in\n\
    // localForage.\n\
    function length(callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                db.transaction(function (t) {\n\
                    // Ahhh, SQL makes this one soooooo easy.\n\
                    t.executeSql('SELECT COUNT(key) as c FROM ' + \n\
                                 dbInfo.storeName, [], function (t, results) {\n\
                        var result = results.rows.item(0).c;\n\
\n\
                        if (callback) {\n\
                            callback(result);\n\
                        }\n\
\n\
                        resolve(result);\n\
                    }, function(t, error) {\n\
                        if (callback) {\n\
                            callback(null, error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    });\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    // Return the key located at key index X; essentially gets the key from a\n\
    // `WHERE id = ?`. This is the most efficient way I can think to implement\n\
    // this rarely-used (in my experience) part of the API, but it can seem\n\
    // inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so\n\
    // the ID of each key will change every time it's updated. Perhaps a stored\n\
    // procedure for the `setItem()` SQL would solve this problem?\n\
    // TODO: Don't change ID on `setItem()`.\n\
    function key(n, callback) {\n\
        var _this = this;\n\
        return new Promise(function(resolve, reject) {\n\
            _this.ready().then(function() {\n\
                db.transaction(function (t) {\n\
                    t.executeSql('SELECT key FROM ' + dbInfo.storeName +\n\
                                 ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {\n\
                        var result = results.rows.length ? results.rows.item(0).key : null;\n\
\n\
                        if (callback) {\n\
                            callback(result);\n\
                        }\n\
\n\
                        resolve(result);\n\
                    }, function(t, error) {\n\
                        if (callback) {\n\
                            callback(null, error);\n\
                        }\n\
\n\
                        reject(error);\n\
                    });\n\
                });\n\
            });\n\
        });\n\
    }\n\
\n\
    // Converts a buffer to a string to store, serialized, in the backend\n\
    // storage library.\n\
    function _bufferToString(buffer) {\n\
        // base64-arraybuffer\n\
        var bytes = new Uint8Array(buffer);\n\
        var i;\n\
        var base64String = '';\n\
\n\
        for (i = 0; i < bytes.length; i += 3) {\n\
            /*jslint bitwise: true */\n\
            base64String += BASE_CHARS[bytes[i] >> 2];\n\
            base64String += BASE_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];\n\
            base64String += BASE_CHARS[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];\n\
            base64String += BASE_CHARS[bytes[i + 2] & 63];\n\
        }\n\
\n\
        if ((bytes.length % 3) === 2) {\n\
            base64String = base64String.substring(0, base64String.length - 1) + \"=\";\n\
        } else if (bytes.length % 3 === 1) {\n\
            base64String = base64String.substring(0, base64String.length - 2) + \"==\";\n\
        }\n\
\n\
        return base64String;\n\
    }\n\
\n\
    // Deserialize data we've inserted into a value column/field. We place\n\
    // special markers into our strings to mark them as encoded; this isn't\n\
    // as nice as a meta field, but it's the only sane thing we can do whilst\n\
    // keeping localStorage support intact.\n\
    //\n\
    // Oftentimes this will just deserialize JSON content, but if we have a\n\
    // special marker (SERIALIZED_MARKER, defined above), we will extract\n\
    // some kind of arraybuffer/binary data/typed array out of the string.\n\
    function _deserialize(value) {\n\
        // If we haven't marked this string as being specially serialized (i.e.\n\
        // something other than serialized JSON), we can just return it and be\n\
        // done with it.\n\
        if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {\n\
            return JSON.parse(value);\n\
        }\n\
\n\
        // The following code deals with deserializing some kind of Blob or\n\
        // TypedArray. First we separate out the type of data we're dealing\n\
        // with from the data itself.\n\
        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);\n\
        var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);\n\
\n\
        // Fill the string into a ArrayBuffer.\n\
        var bufferLength = serializedString.length * 0.75;\n\
        var len = serializedString.length;\n\
        var i;\n\
        var p = 0;\n\
        var encoded1, encoded2, encoded3, encoded4;\n\
\n\
        if (serializedString[serializedString.length - 1] === \"=\") {\n\
            bufferLength--;\n\
            if (serializedString[serializedString.length - 2] === \"=\") {\n\
                bufferLength--;\n\
            }\n\
        }\n\
\n\
        var buffer = new ArrayBuffer(bufferLength);\n\
        var bytes = new Uint8Array(buffer);\n\
\n\
        for (i = 0; i < len; i+=4) {\n\
            encoded1 = BASE_CHARS.indexOf(serializedString[i]);\n\
            encoded2 = BASE_CHARS.indexOf(serializedString[i+1]);\n\
            encoded3 = BASE_CHARS.indexOf(serializedString[i+2]);\n\
            encoded4 = BASE_CHARS.indexOf(serializedString[i+3]);\n\
\n\
            /*jslint bitwise: true */\n\
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);\n\
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);\n\
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);\n\
        }\n\
\n\
        // Return the right type based on the code/type set during\n\
        // serialization.\n\
        switch (type) {\n\
            case TYPE_ARRAYBUFFER:\n\
                return buffer;\n\
            case TYPE_BLOB:\n\
                return new Blob([buffer]);\n\
            case TYPE_INT8ARRAY:\n\
                return new Int8Array(buffer);\n\
            case TYPE_UINT8ARRAY:\n\
                return new Uint8Array(buffer);\n\
            case TYPE_UINT8CLAMPEDARRAY:\n\
                return new Uint8ClampedArray(buffer);\n\
            case TYPE_INT16ARRAY:\n\
                return new Int16Array(buffer);\n\
            case TYPE_UINT16ARRAY:\n\
                return new Uint16Array(buffer);\n\
            case TYPE_INT32ARRAY:\n\
                return new Int32Array(buffer);\n\
            case TYPE_UINT32ARRAY:\n\
                return new Uint32Array(buffer);\n\
            case TYPE_FLOAT32ARRAY:\n\
                return new Float32Array(buffer);\n\
            case TYPE_FLOAT64ARRAY:\n\
                return new Float64Array(buffer);\n\
            default:\n\
                throw new Error('Unkown type: ' + type);\n\
        }\n\
    }\n\
\n\
    // Serialize a value, afterwards executing a callback (which usually\n\
    // instructs the `setItem()` callback/promise to be executed). This is how\n\
    // we store binary data with localStorage.\n\
    function _serialize(value, callback) {\n\
        var valueString = '';\n\
        if (value) {\n\
            valueString = value.toString();\n\
        }\n\
\n\
        // Cannot use `value instanceof ArrayBuffer` or such here, as these\n\
        // checks fail when running the tests using casper.js...\n\
        //\n\
        // TODO: See why those tests fail and use a better solution.\n\
        if (value && (value.toString() === '[object ArrayBuffer]' ||\n\
                      value.buffer && value.buffer.toString() === '[object ArrayBuffer]')) {\n\
            // Convert binary arrays to a string and prefix the string with\n\
            // a special marker.\n\
            var buffer;\n\
            var marker = SERIALIZED_MARKER;\n\
\n\
            if (value instanceof ArrayBuffer) {\n\
                buffer = value;\n\
                marker += TYPE_ARRAYBUFFER;\n\
            } else {\n\
                buffer = value.buffer;\n\
\n\
                if (valueString === '[object Int8Array]') {\n\
                    marker += TYPE_INT8ARRAY;\n\
                } else if (valueString === '[object Uint8Array]') {\n\
                    marker += TYPE_UINT8ARRAY;\n\
                } else if (valueString === '[object Uint8ClampedArray]') {\n\
                    marker += TYPE_UINT8CLAMPEDARRAY;\n\
                } else if (valueString === '[object Int16Array]') {\n\
                    marker += TYPE_INT16ARRAY;\n\
                } else if (valueString === '[object Uint16Array]') {\n\
                    marker += TYPE_UINT16ARRAY;\n\
                } else if (valueString === '[object Int32Array]') {\n\
                    marker += TYPE_INT32ARRAY;\n\
                } else if (valueString === '[object Uint32Array]') {\n\
                    marker += TYPE_UINT32ARRAY;\n\
                } else if (valueString === '[object Float32Array]') {\n\
                    marker += TYPE_FLOAT32ARRAY;\n\
                } else if (valueString === '[object Float64Array]') {\n\
                    marker += TYPE_FLOAT64ARRAY;\n\
                } else {\n\
                    callback(new Error(\"Failed to get type for BinaryArray\"));\n\
                }\n\
            }\n\
\n\
            callback(marker + _bufferToString(buffer));\n\
        } else if (valueString === \"[object Blob]\") {\n\
            // Conver the blob to a binaryArray and then to a string.\n\
            var fileReader = new FileReader();\n\
\n\
            fileReader.onload = function() {\n\
                var str = _bufferToString(this.result);\n\
\n\
                callback(SERIALIZED_MARKER + TYPE_BLOB + str);\n\
            };\n\
\n\
            fileReader.readAsArrayBuffer(value);\n\
        } else {\n\
            try {\n\
                callback(JSON.stringify(value));\n\
            } catch (e) {\n\
                if (window.console && window.console.error) {\n\
                    window.console.error(\"Couldn't convert value into a JSON string: \", value);\n\
                }\n\
\n\
                callback(null, e);\n\
            }\n\
        }\n\
    }\n\
\n\
    var webSQLStorage = {\n\
        _driver: 'webSQLStorage',\n\
        _initStorage: _initStorage,\n\
        getItem: getItem,\n\
        setItem: setItem,\n\
        removeItem: removeItem,\n\
        clear: clear,\n\
        length: length,\n\
        key: key\n\
    };\n\
\n\
    if (typeof define === 'function' && define.amd) {\n\
        define('webSQLStorage', function() {\n\
            return webSQLStorage;\n\
        });\n\
    } else if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = webSQLStorage;\n\
    } else {\n\
        this.webSQLStorage = webSQLStorage;\n\
    }\n\
}).call(this);\n\
\n\
//# sourceURL=components/mozilla/localforage/0.7.0/src/drivers/websql.js"
));

require.modules["mozilla-localforage"] = require.modules["mozilla~localforage@0.7.0"];
require.modules["mozilla~localforage"] = require.modules["mozilla~localforage@0.7.0"];
require.modules["localforage"] = require.modules["mozilla~localforage@0.7.0"];


require.register("chaijs~assertion-error@1.0.0", Function("exports, module",
"/*!\n\
 * assertion-error\n\
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Return a function that will copy properties from\n\
 * one object to another excluding any originally\n\
 * listed. Returned function will create a new `{}`.\n\
 *\n\
 * @param {String} excluded properties ...\n\
 * @return {Function}\n\
 */\n\
\n\
function exclude () {\n\
  var excludes = [].slice.call(arguments);\n\
\n\
  function excludeProps (res, obj) {\n\
    Object.keys(obj).forEach(function (key) {\n\
      if (!~excludes.indexOf(key)) res[key] = obj[key];\n\
    });\n\
  }\n\
\n\
  return function extendExclude () {\n\
    var args = [].slice.call(arguments)\n\
      , i = 0\n\
      , res = {};\n\
\n\
    for (; i < args.length; i++) {\n\
      excludeProps(res, args[i]);\n\
    }\n\
\n\
    return res;\n\
  };\n\
};\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
module.exports = AssertionError;\n\
\n\
/**\n\
 * ### AssertionError\n\
 *\n\
 * An extension of the JavaScript `Error` constructor for\n\
 * assertion and validation scenarios.\n\
 *\n\
 * @param {String} message\n\
 * @param {Object} properties to include (optional)\n\
 * @param {callee} start stack function (optional)\n\
 */\n\
\n\
function AssertionError (message, _props, ssf) {\n\
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')\n\
    , props = extend(_props || {});\n\
\n\
  // default values\n\
  this.message = message || 'Unspecified AssertionError';\n\
  this.showDiff = false;\n\
\n\
  // copy from properties\n\
  for (var key in props) {\n\
    this[key] = props[key];\n\
  }\n\
\n\
  // capture stack trace\n\
  ssf = ssf || arguments.callee;\n\
  if (ssf && Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, ssf);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Inherit from Error.prototype\n\
 */\n\
\n\
AssertionError.prototype = Object.create(Error.prototype);\n\
\n\
/*!\n\
 * Statically set name\n\
 */\n\
\n\
AssertionError.prototype.name = 'AssertionError';\n\
\n\
/*!\n\
 * Ensure correct constructor\n\
 */\n\
\n\
AssertionError.prototype.constructor = AssertionError;\n\
\n\
/**\n\
 * Allow errors to be converted to JSON for static transfer.\n\
 *\n\
 * @param {Boolean} include stack (default: `true`)\n\
 * @return {Object} object that can be `JSON.stringify`\n\
 */\n\
\n\
AssertionError.prototype.toJSON = function (stack) {\n\
  var extend = exclude('constructor', 'toJSON', 'stack')\n\
    , props = extend({ name: this.name }, this);\n\
\n\
  // include stack if exists and not turned off\n\
  if (false !== stack && this.stack) {\n\
    props.stack = this.stack;\n\
  }\n\
\n\
  return props;\n\
};\n\
\n\
//# sourceURL=components/chaijs/assertion-error/1.0.0/index.js"
));

require.modules["chaijs-assertion-error"] = require.modules["chaijs~assertion-error@1.0.0"];
require.modules["chaijs~assertion-error"] = require.modules["chaijs~assertion-error@1.0.0"];
require.modules["assertion-error"] = require.modules["chaijs~assertion-error@1.0.0"];


require.register("chaijs~type-detect@0.1.1", Function("exports, module",
"/*!\n\
 * type-detect\n\
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
var exports = module.exports = getType;\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Array]': 'array'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object Function]': 'function'\n\
  , '[object Arguments]': 'arguments'\n\
  , '[object Date]': 'date'\n\
};\n\
\n\
/**\n\
 * ### typeOf (obj)\n\
 *\n\
 * Use several different techniques to determine\n\
 * the type of object being tested.\n\
 *\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {String} object type\n\
 * @api public\n\
 */\n\
\n\
function getType (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
}\n\
\n\
exports.Library = Library;\n\
\n\
/**\n\
 * ### Library\n\
 *\n\
 * Create a repository for custom type detection.\n\
 *\n\
 * ```js\n\
 * var lib = new type.Library;\n\
 * ```\n\
 *\n\
 */\n\
\n\
function Library () {\n\
  this.tests = {};\n\
}\n\
\n\
/**\n\
 * #### .of (obj)\n\
 *\n\
 * Expose replacement `typeof` detection to the library.\n\
 *\n\
 * ```js\n\
 * if ('string' === lib.of('hello world')) {\n\
 *   // ...\n\
 * }\n\
 * ```\n\
 *\n\
 * @param {Mixed} object to test\n\
 * @return {String} type\n\
 */\n\
\n\
Library.prototype.of = getType;\n\
\n\
/**\n\
 * #### .define (type, test)\n\
 *\n\
 * Add a test to for the `.test()` assertion.\n\
 *\n\
 * Can be defined as a regular expression:\n\
 *\n\
 * ```js\n\
 * lib.define('int', /^[0-9]+$/);\n\
 * ```\n\
 *\n\
 * ... or as a function:\n\
 *\n\
 * ```js\n\
 * lib.define('bln', function (obj) {\n\
 *   if ('boolean' === lib.of(obj)) return true;\n\
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];\n\
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();\n\
 *   return !! ~blns.indexOf(obj);\n\
 * });\n\
 * ```\n\
 *\n\
 * @param {String} type\n\
 * @param {RegExp|Function} test\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.define = function (type, test) {\n\
  if (arguments.length === 1) return this.tests[type];\n\
  this.tests[type] = test;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * #### .test (obj, test)\n\
 *\n\
 * Assert that an object is of type. Will first\n\
 * check natives, and if that does not pass it will\n\
 * use the user defined custom tests.\n\
 *\n\
 * ```js\n\
 * assert(lib.test('1', 'int'));\n\
 * assert(lib.test('yes', 'bln'));\n\
 * ```\n\
 *\n\
 * @param {Mixed} object\n\
 * @param {String} type\n\
 * @return {Boolean} result\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.test = function (obj, type) {\n\
  if (type === getType(obj)) return true;\n\
  var test = this.tests[type];\n\
\n\
  if (test && 'regexp' === getType(test)) {\n\
    return test.test(obj);\n\
  } else if (test && 'function' === getType(test)) {\n\
    return test(obj);\n\
  } else {\n\
    throw new ReferenceError('Type test \"' + type + '\" not defined or invalid.');\n\
  }\n\
};\n\
\n\
//# sourceURL=components/chaijs/type-detect/0.1.1/lib/type.js"
));

require.modules["chaijs-type-detect"] = require.modules["chaijs~type-detect@0.1.1"];
require.modules["chaijs~type-detect"] = require.modules["chaijs~type-detect@0.1.1"];
require.modules["type-detect"] = require.modules["chaijs~type-detect@0.1.1"];


require.register("chaijs~deep-eql@0.1.3", Function("exports, module",
"/*!\n\
 * deep-eql\n\
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var type = require(\"chaijs~type-detect@0.1.1\");\n\
\n\
/*!\n\
 * Buffer.isBuffer browser shim\n\
 */\n\
\n\
var Buffer;\n\
try { Buffer = require(\"buffer\").Buffer; }\n\
catch(ex) {\n\
  Buffer = {};\n\
  Buffer.isBuffer = function() { return false; }\n\
}\n\
\n\
/*!\n\
 * Primary Export\n\
 */\n\
\n\
module.exports = deepEqual;\n\
\n\
/**\n\
 * Assert super-strict (egal) equality between\n\
 * two objects of any type.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @param {Array} memoised (optional)\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function deepEqual(a, b, m) {\n\
  if (sameValue(a, b)) {\n\
    return true;\n\
  } else if ('date' === type(a)) {\n\
    return dateEqual(a, b);\n\
  } else if ('regexp' === type(a)) {\n\
    return regexpEqual(a, b);\n\
  } else if (Buffer.isBuffer(a)) {\n\
    return bufferEqual(a, b);\n\
  } else if ('arguments' === type(a)) {\n\
    return argumentsEqual(a, b, m);\n\
  } else if (!typeEqual(a, b)) {\n\
    return false;\n\
  } else if (('object' !== type(a) && 'object' !== type(b))\n\
  && ('array' !== type(a) && 'array' !== type(b))) {\n\
    return sameValue(a, b);\n\
  } else {\n\
    return objectEqual(a, b, m);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Strict (egal) equality test. Ensures that NaN always\n\
 * equals NaN and `-0` does not equal `+0`.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function sameValue(a, b) {\n\
  if (a === b) return a !== 0 || 1 / a === 1 / b;\n\
  return a !== a && b !== b;\n\
}\n\
\n\
/*!\n\
 * Compare the types of two given objects and\n\
 * return if they are equal. Note that an Array\n\
 * has a type of `array` (not `object`) and arguments\n\
 * have a type of `arguments` (not `array`/`object`).\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function typeEqual(a, b) {\n\
  return type(a) === type(b);\n\
}\n\
\n\
/*!\n\
 * Compare two Date objects by asserting that\n\
 * the time values are equal using `saveValue`.\n\
 *\n\
 * @param {Date} a\n\
 * @param {Date} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function dateEqual(a, b) {\n\
  if ('date' !== type(b)) return false;\n\
  return sameValue(a.getTime(), b.getTime());\n\
}\n\
\n\
/*!\n\
 * Compare two regular expressions by converting them\n\
 * to string and checking for `sameValue`.\n\
 *\n\
 * @param {RegExp} a\n\
 * @param {RegExp} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function regexpEqual(a, b) {\n\
  if ('regexp' !== type(b)) return false;\n\
  return sameValue(a.toString(), b.toString());\n\
}\n\
\n\
/*!\n\
 * Assert deep equality of two `arguments` objects.\n\
 * Unfortunately, these must be sliced to arrays\n\
 * prior to test to ensure no bad behavior.\n\
 *\n\
 * @param {Arguments} a\n\
 * @param {Arguments} b\n\
 * @param {Array} memoize (optional)\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function argumentsEqual(a, b, m) {\n\
  if ('arguments' !== type(b)) return false;\n\
  a = [].slice.call(a);\n\
  b = [].slice.call(b);\n\
  return deepEqual(a, b, m);\n\
}\n\
\n\
/*!\n\
 * Get enumerable properties of a given object.\n\
 *\n\
 * @param {Object} a\n\
 * @return {Array} property names\n\
 */\n\
\n\
function enumerable(a) {\n\
  var res = [];\n\
  for (var key in a) res.push(key);\n\
  return res;\n\
}\n\
\n\
/*!\n\
 * Simple equality for flat iterable objects\n\
 * such as Arrays or Node.js buffers.\n\
 *\n\
 * @param {Iterable} a\n\
 * @param {Iterable} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function iterableEqual(a, b) {\n\
  if (a.length !==  b.length) return false;\n\
\n\
  var i = 0;\n\
  var match = true;\n\
\n\
  for (; i < a.length; i++) {\n\
    if (a[i] !== b[i]) {\n\
      match = false;\n\
      break;\n\
    }\n\
  }\n\
\n\
  return match;\n\
}\n\
\n\
/*!\n\
 * Extension to `iterableEqual` specifically\n\
 * for Node.js Buffers.\n\
 *\n\
 * @param {Buffer} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function bufferEqual(a, b) {\n\
  if (!Buffer.isBuffer(b)) return false;\n\
  return iterableEqual(a, b);\n\
}\n\
\n\
/*!\n\
 * Block for `objectEqual` ensuring non-existing\n\
 * values don't get in.\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function isValue(a) {\n\
  return a !== null && a !== undefined;\n\
}\n\
\n\
/*!\n\
 * Recursively check the equality of two objects.\n\
 * Once basic sameness has been established it will\n\
 * defer to `deepEqual` for each enumerable key\n\
 * in the object.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function objectEqual(a, b, m) {\n\
  if (!isValue(a) || !isValue(b)) {\n\
    return false;\n\
  }\n\
\n\
  if (a.prototype !== b.prototype) {\n\
    return false;\n\
  }\n\
\n\
  var i;\n\
  if (m) {\n\
    for (i = 0; i < m.length; i++) {\n\
      if ((m[i][0] === a && m[i][1] === b)\n\
      ||  (m[i][0] === b && m[i][1] === a)) {\n\
        return true;\n\
      }\n\
    }\n\
  } else {\n\
    m = [];\n\
  }\n\
\n\
  try {\n\
    var ka = enumerable(a);\n\
    var kb = enumerable(b);\n\
  } catch (ex) {\n\
    return false;\n\
  }\n\
\n\
  ka.sort();\n\
  kb.sort();\n\
\n\
  if (!iterableEqual(ka, kb)) {\n\
    return false;\n\
  }\n\
\n\
  m.push([ a, b ]);\n\
\n\
  var key;\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!deepEqual(a[key], b[key], m)) {\n\
      return false;\n\
    }\n\
  }\n\
\n\
  return true;\n\
}\n\
\n\
//# sourceURL=components/chaijs/deep-eql/0.1.3/lib/eql.js"
));

require.modules["chaijs-deep-eql"] = require.modules["chaijs~deep-eql@0.1.3"];
require.modules["chaijs~deep-eql"] = require.modules["chaijs~deep-eql@0.1.3"];
require.modules["deep-eql"] = require.modules["chaijs~deep-eql@0.1.3"];


require.register("chaijs~chai@1.9.1", Function("exports, module",
"module.exports = require(\"chaijs~chai@1.9.1/lib/chai.js\");\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/index.js"
));

require.register("chaijs~chai@1.9.1/lib/chai.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var used = []\n\
  , exports = module.exports = {};\n\
\n\
/*!\n\
 * Chai version\n\
 */\n\
\n\
exports.version = '1.9.1';\n\
\n\
/*!\n\
 * Assertion Error\n\
 */\n\
\n\
exports.AssertionError = require(\"chaijs~assertion-error@1.0.0\");\n\
\n\
/*!\n\
 * Utils for plugins (not exported)\n\
 */\n\
\n\
var util = require(\"chaijs~chai@1.9.1/lib/chai/utils/index.js\");\n\
\n\
/**\n\
 * # .use(function)\n\
 *\n\
 * Provides a way to extend the internals of Chai\n\
 *\n\
 * @param {Function}\n\
 * @returns {this} for chaining\n\
 * @api public\n\
 */\n\
\n\
exports.use = function (fn) {\n\
  if (!~used.indexOf(fn)) {\n\
    fn(this, util);\n\
    used.push(fn);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/*!\n\
 * Configuration\n\
 */\n\
\n\
var config = require(\"chaijs~chai@1.9.1/lib/chai/config.js\");\n\
exports.config = config;\n\
\n\
/*!\n\
 * Primary `Assertion` prototype\n\
 */\n\
\n\
var assertion = require(\"chaijs~chai@1.9.1/lib/chai/assertion.js\");\n\
exports.use(assertion);\n\
\n\
/*!\n\
 * Core Assertions\n\
 */\n\
\n\
var core = require(\"chaijs~chai@1.9.1/lib/chai/core/assertions.js\");\n\
exports.use(core);\n\
\n\
/*!\n\
 * Expect interface\n\
 */\n\
\n\
var expect = require(\"chaijs~chai@1.9.1/lib/chai/interface/expect.js\");\n\
exports.use(expect);\n\
\n\
/*!\n\
 * Should interface\n\
 */\n\
\n\
var should = require(\"chaijs~chai@1.9.1/lib/chai/interface/should.js\");\n\
exports.use(should);\n\
\n\
/*!\n\
 * Assert interface\n\
 */\n\
\n\
var assert = require(\"chaijs~chai@1.9.1/lib/chai/interface/assert.js\");\n\
exports.use(assert);\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/assertion.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var config = require(\"chaijs~chai@1.9.1/lib/chai/config.js\");\n\
\n\
module.exports = function (_chai, util) {\n\
  /*!\n\
   * Module dependencies.\n\
   */\n\
\n\
  var AssertionError = _chai.AssertionError\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  _chai.Assertion = Assertion;\n\
\n\
  /*!\n\
   * Assertion Constructor\n\
   *\n\
   * Creates object for chaining.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  function Assertion (obj, msg, stack) {\n\
    flag(this, 'ssfi', stack || arguments.callee);\n\
    flag(this, 'object', obj);\n\
    flag(this, 'message', msg);\n\
  }\n\
\n\
  Object.defineProperty(Assertion, 'includeStack', {\n\
    get: function() {\n\
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');\n\
      return config.includeStack;\n\
    },\n\
    set: function(value) {\n\
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');\n\
      config.includeStack = value;\n\
    }\n\
  });\n\
\n\
  Object.defineProperty(Assertion, 'showDiff', {\n\
    get: function() {\n\
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');\n\
      return config.showDiff;\n\
    },\n\
    set: function(value) {\n\
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');\n\
      config.showDiff = value;\n\
    }\n\
  });\n\
\n\
  Assertion.addProperty = function (name, fn) {\n\
    util.addProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addMethod = function (name, fn) {\n\
    util.addMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  Assertion.overwriteProperty = function (name, fn) {\n\
    util.overwriteProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteMethod = function (name, fn) {\n\
    util.overwriteMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  /*!\n\
   * ### .assert(expression, message, negateMessage, expected, actual)\n\
   *\n\
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.\n\
   *\n\
   * @name assert\n\
   * @param {Philosophical} expression to be tested\n\
   * @param {String} message to display if fails\n\
   * @param {String} negatedMessage to display if negated expression fails\n\
   * @param {Mixed} expected value (remember to check for negation)\n\
   * @param {Mixed} actual (optional) will default to `this.obj`\n\
   * @api private\n\
   */\n\
\n\
  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {\n\
    var ok = util.test(this, arguments);\n\
    if (true !== showDiff) showDiff = false;\n\
    if (true !== config.showDiff) showDiff = false;\n\
\n\
    if (!ok) {\n\
      var msg = util.getMessage(this, arguments)\n\
        , actual = util.getActual(this, arguments);\n\
      throw new AssertionError(msg, {\n\
          actual: actual\n\
        , expected: expected\n\
        , showDiff: showDiff\n\
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));\n\
    }\n\
  };\n\
\n\
  /*!\n\
   * ### ._obj\n\
   *\n\
   * Quick reference to stored `actual` value for plugin developers.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Object.defineProperty(Assertion.prototype, '_obj',\n\
    { get: function () {\n\
        return flag(this, 'object');\n\
      }\n\
    , set: function (val) {\n\
        flag(this, 'object', val);\n\
      }\n\
  });\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/assertion.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/config.js", Function("exports, module",
"module.exports = {\n\
\n\
  /**\n\
   * ### config.includeStack\n\
   *\n\
   * User configurable property, influences whether stack trace\n\
   * is included in Assertion error message. Default of false\n\
   * suppresses stack trace in the error message.\n\
   *\n\
   *     chai.config.includeStack = true;  // enable stack on error\n\
   *\n\
   * @param {Boolean}\n\
   * @api public\n\
   */\n\
\n\
   includeStack: false,\n\
\n\
  /**\n\
   * ### config.showDiff\n\
   *\n\
   * User configurable property, influences whether or not\n\
   * the `showDiff` flag should be included in the thrown\n\
   * AssertionErrors. `false` will always be `false`; `true`\n\
   * will be true when the assertion has requested a diff\n\
   * be shown.\n\
   *\n\
   * @param {Boolean}\n\
   * @api public\n\
   */\n\
\n\
  showDiff: true,\n\
\n\
  /**\n\
   * ### config.truncateThreshold\n\
   *\n\
   * User configurable property, sets length threshold for actual and\n\
   * expected values in assertion errors. If this threshold is exceeded,\n\
   * the value is truncated.\n\
   *\n\
   * Set it to zero if you want to disable truncating altogether.\n\
   *\n\
   *     chai.config.truncateThreshold = 0;  // disable truncating\n\
   *\n\
   * @param {Number}\n\
   * @api public\n\
   */\n\
\n\
  truncateThreshold: 40\n\
\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/config.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/core/assertions.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, _) {\n\
  var Assertion = chai.Assertion\n\
    , toString = Object.prototype.toString\n\
    , flag = _.flag;\n\
\n\
  /**\n\
   * ### Language Chains\n\
   *\n\
   * The following are provided as chainable getters to\n\
   * improve the readability of your assertions. They\n\
   * do not provide testing capabilities unless they\n\
   * have been overwritten by a plugin.\n\
   *\n\
   * **Chains**\n\
   *\n\
   * - to\n\
   * - be\n\
   * - been\n\
   * - is\n\
   * - that\n\
   * - and\n\
   * - has\n\
   * - have\n\
   * - with\n\
   * - at\n\
   * - of\n\
   * - same\n\
   *\n\
   * @name language chains\n\
   * @api public\n\
   */\n\
\n\
  [ 'to', 'be', 'been'\n\
  , 'is', 'and', 'has', 'have'\n\
  , 'with', 'that', 'at'\n\
  , 'of', 'same' ].forEach(function (chain) {\n\
    Assertion.addProperty(chain, function () {\n\
      return this;\n\
    });\n\
  });\n\
\n\
  /**\n\
   * ### .not\n\
   *\n\
   * Negates any of assertions following in the chain.\n\
   *\n\
   *     expect(foo).to.not.equal('bar');\n\
   *     expect(goodFn).to.not.throw(Error);\n\
   *     expect({ foo: 'baz' }).to.have.property('foo')\n\
   *       .and.not.equal('bar');\n\
   *\n\
   * @name not\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('not', function () {\n\
    flag(this, 'negate', true);\n\
  });\n\
\n\
  /**\n\
   * ### .deep\n\
   *\n\
   * Sets the `deep` flag, later used by the `equal` and\n\
   * `property` assertions.\n\
   *\n\
   *     expect(foo).to.deep.equal({ bar: 'baz' });\n\
   *     expect({ foo: { bar: { baz: 'quux' } } })\n\
   *       .to.have.deep.property('foo.bar.baz', 'quux');\n\
   *\n\
   * @name deep\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('deep', function () {\n\
    flag(this, 'deep', true);\n\
  });\n\
\n\
  /**\n\
   * ### .a(type)\n\
   *\n\
   * The `a` and `an` assertions are aliases that can be\n\
   * used either as language chains or to assert a value's\n\
   * type.\n\
   *\n\
   *     // typeof\n\
   *     expect('test').to.be.a('string');\n\
   *     expect({ foo: 'bar' }).to.be.an('object');\n\
   *     expect(null).to.be.a('null');\n\
   *     expect(undefined).to.be.an('undefined');\n\
   *\n\
   *     // language chain\n\
   *     expect(foo).to.be.an.instanceof(Foo);\n\
   *\n\
   * @name a\n\
   * @alias an\n\
   * @param {String} type\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function an (type, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    type = type.toLowerCase();\n\
    var obj = flag(this, 'object')\n\
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';\n\
\n\
    this.assert(\n\
        type === _.type(obj)\n\
      , 'expected #{this} to be ' + article + type\n\
      , 'expected #{this} not to be ' + article + type\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('an', an);\n\
  Assertion.addChainableMethod('a', an);\n\
\n\
  /**\n\
   * ### .include(value)\n\
   *\n\
   * The `include` and `contain` assertions can be used as either property\n\
   * based language chains or as methods to assert the inclusion of an object\n\
   * in an array or a substring in a string. When used as language chains,\n\
   * they toggle the `contain` flag for the `keys` assertion.\n\
   *\n\
   *     expect([1,2,3]).to.include(2);\n\
   *     expect('foobar').to.contain('foo');\n\
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');\n\
   *\n\
   * @name include\n\
   * @alias contain\n\
   * @param {Object|String|Number} obj\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function includeChainingBehavior () {\n\
    flag(this, 'contains', true);\n\
  }\n\
\n\
  function include (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    var expected = false;\n\
    if (_.type(obj) === 'array' && _.type(val) === 'object') {\n\
      for (var i in obj) {\n\
        if (_.eql(obj[i], val)) {\n\
          expected = true;\n\
          break;\n\
        }\n\
      }\n\
    } else if (_.type(val) === 'object') {\n\
      if (!flag(this, 'negate')) {\n\
        for (var k in val) new Assertion(obj).property(k, val[k]);\n\
        return;\n\
      }\n\
      var subset = {}\n\
      for (var k in val) subset[k] = obj[k]\n\
      expected = _.eql(subset, val);\n\
    } else {\n\
      expected = obj && ~obj.indexOf(val)\n\
    }\n\
    this.assert(\n\
        expected\n\
      , 'expected #{this} to include ' + _.inspect(val)\n\
      , 'expected #{this} to not include ' + _.inspect(val));\n\
  }\n\
\n\
  Assertion.addChainableMethod('include', include, includeChainingBehavior);\n\
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);\n\
\n\
  /**\n\
   * ### .ok\n\
   *\n\
   * Asserts that the target is truthy.\n\
   *\n\
   *     expect('everthing').to.be.ok;\n\
   *     expect(1).to.be.ok;\n\
   *     expect(false).to.not.be.ok;\n\
   *     expect(undefined).to.not.be.ok;\n\
   *     expect(null).to.not.be.ok;\n\
   *\n\
   * @name ok\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('ok', function () {\n\
    this.assert(\n\
        flag(this, 'object')\n\
      , 'expected #{this} to be truthy'\n\
      , 'expected #{this} to be falsy');\n\
  });\n\
\n\
  /**\n\
   * ### .true\n\
   *\n\
   * Asserts that the target is `true`.\n\
   *\n\
   *     expect(true).to.be.true;\n\
   *     expect(1).to.not.be.true;\n\
   *\n\
   * @name true\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('true', function () {\n\
    this.assert(\n\
        true === flag(this, 'object')\n\
      , 'expected #{this} to be true'\n\
      , 'expected #{this} to be false'\n\
      , this.negate ? false : true\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .false\n\
   *\n\
   * Asserts that the target is `false`.\n\
   *\n\
   *     expect(false).to.be.false;\n\
   *     expect(0).to.not.be.false;\n\
   *\n\
   * @name false\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('false', function () {\n\
    this.assert(\n\
        false === flag(this, 'object')\n\
      , 'expected #{this} to be false'\n\
      , 'expected #{this} to be true'\n\
      , this.negate ? true : false\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .null\n\
   *\n\
   * Asserts that the target is `null`.\n\
   *\n\
   *     expect(null).to.be.null;\n\
   *     expect(undefined).not.to.be.null;\n\
   *\n\
   * @name null\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('null', function () {\n\
    this.assert(\n\
        null === flag(this, 'object')\n\
      , 'expected #{this} to be null'\n\
      , 'expected #{this} not to be null'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .undefined\n\
   *\n\
   * Asserts that the target is `undefined`.\n\
   *\n\
   *     expect(undefined).to.be.undefined;\n\
   *     expect(null).to.not.be.undefined;\n\
   *\n\
   * @name undefined\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('undefined', function () {\n\
    this.assert(\n\
        undefined === flag(this, 'object')\n\
      , 'expected #{this} to be undefined'\n\
      , 'expected #{this} not to be undefined'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .exist\n\
   *\n\
   * Asserts that the target is neither `null` nor `undefined`.\n\
   *\n\
   *     var foo = 'hi'\n\
   *       , bar = null\n\
   *       , baz;\n\
   *\n\
   *     expect(foo).to.exist;\n\
   *     expect(bar).to.not.exist;\n\
   *     expect(baz).to.not.exist;\n\
   *\n\
   * @name exist\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('exist', function () {\n\
    this.assert(\n\
        null != flag(this, 'object')\n\
      , 'expected #{this} to exist'\n\
      , 'expected #{this} to not exist'\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .empty\n\
   *\n\
   * Asserts that the target's length is `0`. For arrays, it checks\n\
   * the `length` property. For objects, it gets the count of\n\
   * enumerable keys.\n\
   *\n\
   *     expect([]).to.be.empty;\n\
   *     expect('').to.be.empty;\n\
   *     expect({}).to.be.empty;\n\
   *\n\
   * @name empty\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('empty', function () {\n\
    var obj = flag(this, 'object')\n\
      , expected = obj;\n\
\n\
    if (Array.isArray(obj) || 'string' === typeof object) {\n\
      expected = obj.length;\n\
    } else if (typeof obj === 'object') {\n\
      expected = Object.keys(obj).length;\n\
    }\n\
\n\
    this.assert(\n\
        !expected\n\
      , 'expected #{this} to be empty'\n\
      , 'expected #{this} not to be empty'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .arguments\n\
   *\n\
   * Asserts that the target is an arguments object.\n\
   *\n\
   *     function test () {\n\
   *       expect(arguments).to.be.arguments;\n\
   *     }\n\
   *\n\
   * @name arguments\n\
   * @alias Arguments\n\
   * @api public\n\
   */\n\
\n\
  function checkArguments () {\n\
    var obj = flag(this, 'object')\n\
      , type = Object.prototype.toString.call(obj);\n\
    this.assert(\n\
        '[object Arguments]' === type\n\
      , 'expected #{this} to be arguments but got ' + type\n\
      , 'expected #{this} to not be arguments'\n\
    );\n\
  }\n\
\n\
  Assertion.addProperty('arguments', checkArguments);\n\
  Assertion.addProperty('Arguments', checkArguments);\n\
\n\
  /**\n\
   * ### .equal(value)\n\
   *\n\
   * Asserts that the target is strictly equal (`===`) to `value`.\n\
   * Alternately, if the `deep` flag is set, asserts that\n\
   * the target is deeply equal to `value`.\n\
   *\n\
   *     expect('hello').to.equal('hello');\n\
   *     expect(42).to.equal(42);\n\
   *     expect(1).to.not.equal(true);\n\
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });\n\
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });\n\
   *\n\
   * @name equal\n\
   * @alias equals\n\
   * @alias eq\n\
   * @alias deep.equal\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEqual (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'deep')) {\n\
      return this.eql(val);\n\
    } else {\n\
      this.assert(\n\
          val === obj\n\
        , 'expected #{this} to equal #{exp}'\n\
        , 'expected #{this} to not equal #{exp}'\n\
        , val\n\
        , this._obj\n\
        , true\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('equal', assertEqual);\n\
  Assertion.addMethod('equals', assertEqual);\n\
  Assertion.addMethod('eq', assertEqual);\n\
\n\
  /**\n\
   * ### .eql(value)\n\
   *\n\
   * Asserts that the target is deeply equal to `value`.\n\
   *\n\
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });\n\
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);\n\
   *\n\
   * @name eql\n\
   * @alias eqls\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEql(obj, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    this.assert(\n\
        _.eql(obj, flag(this, 'object'))\n\
      , 'expected #{this} to deeply equal #{exp}'\n\
      , 'expected #{this} to not deeply equal #{exp}'\n\
      , obj\n\
      , this._obj\n\
      , true\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('eql', assertEql);\n\
  Assertion.addMethod('eqls', assertEql);\n\
\n\
  /**\n\
   * ### .above(value)\n\
   *\n\
   * Asserts that the target is greater than `value`.\n\
   *\n\
   *     expect(10).to.be.above(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *\n\
   * @name above\n\
   * @alias gt\n\
   * @alias greaterThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertAbove (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len > n\n\
        , 'expected #{this} to have a length above #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj > n\n\
        , 'expected #{this} to be above ' + n\n\
        , 'expected #{this} to be at most ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('above', assertAbove);\n\
  Assertion.addMethod('gt', assertAbove);\n\
  Assertion.addMethod('greaterThan', assertAbove);\n\
\n\
  /**\n\
   * ### .least(value)\n\
   *\n\
   * Asserts that the target is greater than or equal to `value`.\n\
   *\n\
   *     expect(10).to.be.at.least(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.least(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);\n\
   *\n\
   * @name least\n\
   * @alias gte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLeast (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= n\n\
        , 'expected #{this} to have a length at least #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= n\n\
        , 'expected #{this} to be at least ' + n\n\
        , 'expected #{this} to be below ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('least', assertLeast);\n\
  Assertion.addMethod('gte', assertLeast);\n\
\n\
  /**\n\
   * ### .below(value)\n\
   *\n\
   * Asserts that the target is less than `value`.\n\
   *\n\
   *     expect(5).to.be.below(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *\n\
   * @name below\n\
   * @alias lt\n\
   * @alias lessThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertBelow (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len < n\n\
        , 'expected #{this} to have a length below #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj < n\n\
        , 'expected #{this} to be below ' + n\n\
        , 'expected #{this} to be at least ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('below', assertBelow);\n\
  Assertion.addMethod('lt', assertBelow);\n\
  Assertion.addMethod('lessThan', assertBelow);\n\
\n\
  /**\n\
   * ### .most(value)\n\
   *\n\
   * Asserts that the target is less than or equal to `value`.\n\
   *\n\
   *     expect(5).to.be.at.most(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.most(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);\n\
   *\n\
   * @name most\n\
   * @alias lte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertMost (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len <= n\n\
        , 'expected #{this} to have a length at most #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj <= n\n\
        , 'expected #{this} to be at most ' + n\n\
        , 'expected #{this} to be above ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('most', assertMost);\n\
  Assertion.addMethod('lte', assertMost);\n\
\n\
  /**\n\
   * ### .within(start, finish)\n\
   *\n\
   * Asserts that the target is within a range.\n\
   *\n\
   *     expect(7).to.be.within(5,10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a length range. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name within\n\
   * @param {Number} start lowerbound inclusive\n\
   * @param {Number} finish upperbound inclusive\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('within', function (start, finish, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , range = start + '..' + finish;\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= start && len <= finish\n\
        , 'expected #{this} to have a length within ' + range\n\
        , 'expected #{this} to not have a length within ' + range\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= start && obj <= finish\n\
        , 'expected #{this} to be within ' + range\n\
        , 'expected #{this} to not be within ' + range\n\
      );\n\
    }\n\
  });\n\
\n\
  /**\n\
   * ### .instanceof(constructor)\n\
   *\n\
   * Asserts that the target is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , Chai = new Tea('chai');\n\
   *\n\
   *     expect(Chai).to.be.an.instanceof(Tea);\n\
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);\n\
   *\n\
   * @name instanceof\n\
   * @param {Constructor} constructor\n\
   * @param {String} message _optional_\n\
   * @alias instanceOf\n\
   * @api public\n\
   */\n\
\n\
  function assertInstanceOf (constructor, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var name = _.getName(constructor);\n\
    this.assert(\n\
        flag(this, 'object') instanceof constructor\n\
      , 'expected #{this} to be an instance of ' + name\n\
      , 'expected #{this} to not be an instance of ' + name\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('instanceof', assertInstanceOf);\n\
  Assertion.addMethod('instanceOf', assertInstanceOf);\n\
\n\
  /**\n\
   * ### .property(name, [value])\n\
   *\n\
   * Asserts that the target has a property `name`, optionally asserting that\n\
   * the value of that property is strictly equal to  `value`.\n\
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep\n\
   * references into objects and arrays.\n\
   *\n\
   *     // simple referencing\n\
   *     var obj = { foo: 'bar' };\n\
   *     expect(obj).to.have.property('foo');\n\
   *     expect(obj).to.have.property('foo', 'bar');\n\
   *\n\
   *     // deep referencing\n\
   *     var deepObj = {\n\
   *         green: { tea: 'matcha' }\n\
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]\n\
   *     };\n\
\n\
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');\n\
   *\n\
   * You can also use an array as the starting point of a `deep.property`\n\
   * assertion, or traverse nested arrays.\n\
   *\n\
   *     var arr = [\n\
   *         [ 'chai', 'matcha', 'konacha' ]\n\
   *       , [ { tea: 'chai' }\n\
   *         , { tea: 'matcha' }\n\
   *         , { tea: 'konacha' } ]\n\
   *     ];\n\
   *\n\
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');\n\
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');\n\
   *\n\
   * Furthermore, `property` changes the subject of the assertion\n\
   * to be the value of that property from the original object. This\n\
   * permits for further chainable assertions on that property.\n\
   *\n\
   *     expect(obj).to.have.property('foo')\n\
   *       .that.is.a('string');\n\
   *     expect(deepObj).to.have.property('green')\n\
   *       .that.is.an('object')\n\
   *       .that.deep.equals({ tea: 'matcha' });\n\
   *     expect(deepObj).to.have.property('teas')\n\
   *       .that.is.an('array')\n\
   *       .with.deep.property('[2]')\n\
   *         .that.deep.equals({ tea: 'konacha' });\n\
   *\n\
   * @name property\n\
   * @alias deep.property\n\
   * @param {String} name\n\
   * @param {Mixed} value (optional)\n\
   * @param {String} message _optional_\n\
   * @returns value of property for chaining\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('property', function (name, val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
\n\
    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '\n\
      , negate = flag(this, 'negate')\n\
      , obj = flag(this, 'object')\n\
      , value = flag(this, 'deep')\n\
        ? _.getPathValue(name, obj)\n\
        : obj[name];\n\
\n\
    if (negate && undefined !== val) {\n\
      if (undefined === value) {\n\
        msg = (msg != null) ? msg + ': ' : '';\n\
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));\n\
      }\n\
    } else {\n\
      this.assert(\n\
          undefined !== value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)\n\
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));\n\
    }\n\
\n\
    if (undefined !== val) {\n\
      this.assert(\n\
          val === value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'\n\
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'\n\
        , val\n\
        , value\n\
      );\n\
    }\n\
\n\
    flag(this, 'object', value);\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .ownProperty(name)\n\
   *\n\
   * Asserts that the target has an own property `name`.\n\
   *\n\
   *     expect('test').to.have.ownProperty('length');\n\
   *\n\
   * @name ownProperty\n\
   * @alias haveOwnProperty\n\
   * @param {String} name\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertOwnProperty (name, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        obj.hasOwnProperty(name)\n\
      , 'expected #{this} to have own property ' + _.inspect(name)\n\
      , 'expected #{this} to not have own property ' + _.inspect(name)\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('ownProperty', assertOwnProperty);\n\
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);\n\
\n\
  /**\n\
   * ### .length(value)\n\
   *\n\
   * Asserts that the target's `length` property has\n\
   * the expected value.\n\
   *\n\
   *     expect([ 1, 2, 3]).to.have.length(3);\n\
   *     expect('foobar').to.have.length(6);\n\
   *\n\
   * Can also be used as a chain precursor to a value\n\
   * comparison for the length property.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name length\n\
   * @alias lengthOf\n\
   * @param {Number} length\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLengthChain () {\n\
    flag(this, 'doLength', true);\n\
  }\n\
\n\
  function assertLength (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).to.have.property('length');\n\
    var len = obj.length;\n\
\n\
    this.assert(\n\
        len == n\n\
      , 'expected #{this} to have a length of #{exp} but got #{act}'\n\
      , 'expected #{this} to not have a length of #{act}'\n\
      , n\n\
      , len\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('length', assertLength, assertLengthChain);\n\
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);\n\
\n\
  /**\n\
   * ### .match(regexp)\n\
   *\n\
   * Asserts that the target matches a regular expression.\n\
   *\n\
   *     expect('foobar').to.match(/^foo/);\n\
   *\n\
   * @name match\n\
   * @param {RegExp} RegularExpression\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('match', function (re, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        re.exec(obj)\n\
      , 'expected #{this} to match ' + re\n\
      , 'expected #{this} not to match ' + re\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .string(string)\n\
   *\n\
   * Asserts that the string target contains another string.\n\
   *\n\
   *     expect('foobar').to.have.string('bar');\n\
   *\n\
   * @name string\n\
   * @param {String} string\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('string', function (str, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('string');\n\
\n\
    this.assert(\n\
        ~obj.indexOf(str)\n\
      , 'expected #{this} to contain ' + _.inspect(str)\n\
      , 'expected #{this} to not contain ' + _.inspect(str)\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .keys(key1, [key2], [...])\n\
   *\n\
   * Asserts that the target has exactly the given keys, or\n\
   * asserts the inclusion of some keys when using the\n\
   * `include` or `contain` modifiers.\n\
   *\n\
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);\n\
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');\n\
   *\n\
   * @name keys\n\
   * @alias key\n\
   * @param {String...|Array} keys\n\
   * @api public\n\
   */\n\
\n\
  function assertKeys (keys) {\n\
    var obj = flag(this, 'object')\n\
      , str\n\
      , ok = true;\n\
\n\
    keys = keys instanceof Array\n\
      ? keys\n\
      : Array.prototype.slice.call(arguments);\n\
\n\
    if (!keys.length) throw new Error('keys required');\n\
\n\
    var actual = Object.keys(obj)\n\
      , len = keys.length;\n\
\n\
    // Inclusion\n\
    ok = keys.every(function(key){\n\
      return ~actual.indexOf(key);\n\
    });\n\
\n\
    // Strict\n\
    if (!flag(this, 'negate') && !flag(this, 'contains')) {\n\
      ok = ok && keys.length == actual.length;\n\
    }\n\
\n\
    // Key string\n\
    if (len > 1) {\n\
      keys = keys.map(function(key){\n\
        return _.inspect(key);\n\
      });\n\
      var last = keys.pop();\n\
      str = keys.join(', ') + ', and ' + last;\n\
    } else {\n\
      str = _.inspect(keys[0]);\n\
    }\n\
\n\
    // Form\n\
    str = (len > 1 ? 'keys ' : 'key ') + str;\n\
\n\
    // Have / include\n\
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;\n\
\n\
    // Assertion\n\
    this.assert(\n\
        ok\n\
      , 'expected #{this} to ' + str\n\
      , 'expected #{this} to not ' + str\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('keys', assertKeys);\n\
  Assertion.addMethod('key', assertKeys);\n\
\n\
  /**\n\
   * ### .throw(constructor)\n\
   *\n\
   * Asserts that the function target will throw a specific error, or specific type of error\n\
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test\n\
   * for the error's message.\n\
   *\n\
   *     var err = new ReferenceError('This is a bad function.');\n\
   *     var fn = function () { throw err; }\n\
   *     expect(fn).to.throw(ReferenceError);\n\
   *     expect(fn).to.throw(Error);\n\
   *     expect(fn).to.throw(/bad function/);\n\
   *     expect(fn).to.not.throw('good function');\n\
   *     expect(fn).to.throw(ReferenceError, /bad function/);\n\
   *     expect(fn).to.throw(err);\n\
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));\n\
   *\n\
   * Please note that when a throw expectation is negated, it will check each\n\
   * parameter independently, starting with error constructor type. The appropriate way\n\
   * to check for the existence of a type of error but for a message that does not match\n\
   * is to use `and`.\n\
   *\n\
   *     expect(fn).to.throw(ReferenceError)\n\
   *        .and.not.throw(/good function/);\n\
   *\n\
   * @name throw\n\
   * @alias throws\n\
   * @alias Throw\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {String|RegExp} expected error message\n\
   * @param {String} message _optional_\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @returns error for chaining (null if no error)\n\
   * @api public\n\
   */\n\
\n\
  function assertThrows (constructor, errMsg, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('function');\n\
\n\
    var thrown = false\n\
      , desiredError = null\n\
      , name = null\n\
      , thrownError = null;\n\
\n\
    if (arguments.length === 0) {\n\
      errMsg = null;\n\
      constructor = null;\n\
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {\n\
      errMsg = constructor;\n\
      constructor = null;\n\
    } else if (constructor && constructor instanceof Error) {\n\
      desiredError = constructor;\n\
      constructor = null;\n\
      errMsg = null;\n\
    } else if (typeof constructor === 'function') {\n\
      name = constructor.prototype.name || constructor.name;\n\
      if (name === 'Error' && constructor !== Error) {\n\
        name = (new constructor()).name;\n\
      }\n\
    } else {\n\
      constructor = null;\n\
    }\n\
\n\
    try {\n\
      obj();\n\
    } catch (err) {\n\
      // first, check desired error\n\
      if (desiredError) {\n\
        this.assert(\n\
            err === desiredError\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp}'\n\
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
\n\
        flag(this, 'object', err);\n\
        return this;\n\
      }\n\
\n\
      // next, check constructor\n\
      if (constructor) {\n\
        this.assert(\n\
            err instanceof constructor\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'\n\
          , name\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
\n\
        if (!errMsg) {\n\
          flag(this, 'object', err);\n\
          return this;\n\
        }\n\
      }\n\
\n\
      // next, check message\n\
      var message = 'object' === _.type(err) && \"message\" in err\n\
        ? err.message\n\
        : '' + err;\n\
\n\
      if ((message != null) && errMsg && errMsg instanceof RegExp) {\n\
        this.assert(\n\
            errMsg.exec(message)\n\
          , 'expected #{this} to throw error matching #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not matching #{exp}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        flag(this, 'object', err);\n\
        return this;\n\
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {\n\
        this.assert(\n\
            ~message.indexOf(errMsg)\n\
          , 'expected #{this} to throw error including #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not including #{act}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        flag(this, 'object', err);\n\
        return this;\n\
      } else {\n\
        thrown = true;\n\
        thrownError = err;\n\
      }\n\
    }\n\
\n\
    var actuallyGot = ''\n\
      , expectedThrown = name !== null\n\
        ? name\n\
        : desiredError\n\
          ? '#{exp}' //_.inspect(desiredError)\n\
          : 'an error';\n\
\n\
    if (thrown) {\n\
      actuallyGot = ' but #{act} was thrown'\n\
    }\n\
\n\
    this.assert(\n\
        thrown === true\n\
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot\n\
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot\n\
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)\n\
    );\n\
\n\
    flag(this, 'object', thrownError);\n\
  };\n\
\n\
  Assertion.addMethod('throw', assertThrows);\n\
  Assertion.addMethod('throws', assertThrows);\n\
  Assertion.addMethod('Throw', assertThrows);\n\
\n\
  /**\n\
   * ### .respondTo(method)\n\
   *\n\
   * Asserts that the object or class target will respond to a method.\n\
   *\n\
   *     Klass.prototype.bar = function(){};\n\
   *     expect(Klass).to.respondTo('bar');\n\
   *     expect(obj).to.respondTo('bar');\n\
   *\n\
   * To check if a constructor will respond to a static function,\n\
   * set the `itself` flag.\n\
   *\n\
   *     Klass.baz = function(){};\n\
   *     expect(Klass).itself.to.respondTo('baz');\n\
   *\n\
   * @name respondTo\n\
   * @param {String} method\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('respondTo', function (method, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , itself = flag(this, 'itself')\n\
      , context = ('function' === _.type(obj) && !itself)\n\
        ? obj.prototype[method]\n\
        : obj[method];\n\
\n\
    this.assert(\n\
        'function' === typeof context\n\
      , 'expected #{this} to respond to ' + _.inspect(method)\n\
      , 'expected #{this} to not respond to ' + _.inspect(method)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .itself\n\
   *\n\
   * Sets the `itself` flag, later used by the `respondTo` assertion.\n\
   *\n\
   *     function Foo() {}\n\
   *     Foo.bar = function() {}\n\
   *     Foo.prototype.baz = function() {}\n\
   *\n\
   *     expect(Foo).itself.to.respondTo('bar');\n\
   *     expect(Foo).itself.not.to.respondTo('baz');\n\
   *\n\
   * @name itself\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('itself', function () {\n\
    flag(this, 'itself', true);\n\
  });\n\
\n\
  /**\n\
   * ### .satisfy(method)\n\
   *\n\
   * Asserts that the target passes a given truth test.\n\
   *\n\
   *     expect(1).to.satisfy(function(num) { return num > 0; });\n\
   *\n\
   * @name satisfy\n\
   * @param {Function} matcher\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('satisfy', function (matcher, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        matcher(obj)\n\
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)\n\
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)\n\
      , this.negate ? false : true\n\
      , matcher(obj)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .closeTo(expected, delta)\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     expect(1.5).to.be.closeTo(1, 0.5);\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('closeTo', function (expected, delta, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        Math.abs(obj - expected) <= delta\n\
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta\n\
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta\n\
    );\n\
  });\n\
\n\
  function isSubsetOf(subset, superset, cmp) {\n\
    return subset.every(function(elem) {\n\
      if (!cmp) return superset.indexOf(elem) !== -1;\n\
\n\
      return superset.some(function(elem2) {\n\
        return cmp(elem, elem2);\n\
      });\n\
    })\n\
  }\n\
\n\
  /**\n\
   * ### .members(set)\n\
   *\n\
   * Asserts that the target is a superset of `set`,\n\
   * or that the target and `set` have the same strictly-equal (===) members.\n\
   * Alternately, if the `deep` flag is set, set members are compared for deep\n\
   * equality.\n\
   *\n\
   *     expect([1, 2, 3]).to.include.members([3, 2]);\n\
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);\n\
   *\n\
   *     expect([4, 2]).to.have.members([2, 4]);\n\
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);\n\
   *\n\
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);\n\
   *\n\
   * @name members\n\
   * @param {Array} set\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('members', function (subset, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
\n\
    new Assertion(obj).to.be.an('array');\n\
    new Assertion(subset).to.be.an('array');\n\
\n\
    var cmp = flag(this, 'deep') ? _.eql : undefined;\n\
\n\
    if (flag(this, 'contains')) {\n\
      return this.assert(\n\
          isSubsetOf(subset, obj, cmp)\n\
        , 'expected #{this} to be a superset of #{act}'\n\
        , 'expected #{this} to not be a superset of #{act}'\n\
        , obj\n\
        , subset\n\
      );\n\
    }\n\
\n\
    this.assert(\n\
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)\n\
        , 'expected #{this} to have the same members as #{act}'\n\
        , 'expected #{this} to not have the same members as #{act}'\n\
        , obj\n\
        , subset\n\
    );\n\
  });\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/core/assertions.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/interface/assert.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
\n\
module.exports = function (chai, util) {\n\
\n\
  /*!\n\
   * Chai dependencies.\n\
   */\n\
\n\
  var Assertion = chai.Assertion\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  /**\n\
   * ### assert(expression, message)\n\
   *\n\
   * Write your own test expressions.\n\
   *\n\
   *     assert('foo' !== 'bar', 'foo is not bar');\n\
   *     assert(Array.isArray([]), 'empty arrays are arrays');\n\
   *\n\
   * @param {Mixed} expression to test for truthiness\n\
   * @param {String} message to display on error\n\
   * @name assert\n\
   * @api public\n\
   */\n\
\n\
  var assert = chai.assert = function (express, errmsg) {\n\
    var test = new Assertion(null, null, chai.assert);\n\
    test.assert(\n\
        express\n\
      , errmsg\n\
      , '[ negation message unavailable ]'\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .fail(actual, expected, [message], [operator])\n\
   *\n\
   * Throw a failure. Node.js `assert` module-compatible.\n\
   *\n\
   * @name fail\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @param {String} operator\n\
   * @api public\n\
   */\n\
\n\
  assert.fail = function (actual, expected, message, operator) {\n\
    message = message || 'assert.fail()';\n\
    throw new chai.AssertionError(message, {\n\
        actual: actual\n\
      , expected: expected\n\
      , operator: operator\n\
    }, assert.fail);\n\
  };\n\
\n\
  /**\n\
   * ### .ok(object, [message])\n\
   *\n\
   * Asserts that `object` is truthy.\n\
   *\n\
   *     assert.ok('everything', 'everything is ok');\n\
   *     assert.ok(false, 'this will fail');\n\
   *\n\
   * @name ok\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.ok = function (val, msg) {\n\
    new Assertion(val, msg).is.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .notOk(object, [message])\n\
   *\n\
   * Asserts that `object` is falsy.\n\
   *\n\
   *     assert.notOk('everything', 'this will fail');\n\
   *     assert.notOk(false, 'this will pass');\n\
   *\n\
   * @name notOk\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notOk = function (val, msg) {\n\
    new Assertion(val, msg).is.not.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .equal(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict equality (`==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.equal(3, '3', '== coerces values to strings');\n\
   *\n\
   * @name equal\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.equal = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg, assert.equal);\n\
\n\
    test.assert(\n\
        exp == flag(test, 'object')\n\
      , 'expected #{this} to equal #{exp}'\n\
      , 'expected #{this} to not equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .notEqual(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notEqual(3, 4, 'these numbers are not equal');\n\
   *\n\
   * @name notEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notEqual = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg, assert.notEqual);\n\
\n\
    test.assert(\n\
        exp != flag(test, 'object')\n\
      , 'expected #{this} to not equal #{exp}'\n\
      , 'expected #{this} to equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .strictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict equality (`===`) of `actual` and `expected`.\n\
   *\n\
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');\n\
   *\n\
   * @name strictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.strictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notStrictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict inequality (`!==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');\n\
   *\n\
   * @name notStrictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notStrictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .deepEqual(actual, expected, [message])\n\
   *\n\
   * Asserts that `actual` is deeply equal to `expected`.\n\
   *\n\
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });\n\
   *\n\
   * @name deepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepEqual(actual, expected, [message])\n\
   *\n\
   * Assert that `actual` is not deeply equal to `expected`.\n\
   *\n\
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });\n\
   *\n\
   * @name notDeepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .isTrue(value, [message])\n\
   *\n\
   * Asserts that `value` is true.\n\
   *\n\
   *     var teaServed = true;\n\
   *     assert.isTrue(teaServed, 'the tea has been served');\n\
   *\n\
   * @name isTrue\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isTrue = function (val, msg) {\n\
    new Assertion(val, msg).is['true'];\n\
  };\n\
\n\
  /**\n\
   * ### .isFalse(value, [message])\n\
   *\n\
   * Asserts that `value` is false.\n\
   *\n\
   *     var teaServed = false;\n\
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');\n\
   *\n\
   * @name isFalse\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFalse = function (val, msg) {\n\
    new Assertion(val, msg).is['false'];\n\
  };\n\
\n\
  /**\n\
   * ### .isNull(value, [message])\n\
   *\n\
   * Asserts that `value` is null.\n\
   *\n\
   *     assert.isNull(err, 'there was no error');\n\
   *\n\
   * @name isNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNull = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNull(value, [message])\n\
   *\n\
   * Asserts that `value` is not null.\n\
   *\n\
   *     var tea = 'tasty chai';\n\
   *     assert.isNotNull(tea, 'great, time for tea!');\n\
   *\n\
   * @name isNotNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNull = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isUndefined(value, [message])\n\
   *\n\
   * Asserts that `value` is `undefined`.\n\
   *\n\
   *     var tea;\n\
   *     assert.isUndefined(tea, 'no tea defined');\n\
   *\n\
   * @name isUndefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isUndefined = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isDefined(value, [message])\n\
   *\n\
   * Asserts that `value` is not `undefined`.\n\
   *\n\
   *     var tea = 'cup of chai';\n\
   *     assert.isDefined(tea, 'tea has been defined');\n\
   *\n\
   * @name isDefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isDefined = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is a function.\n\
   *\n\
   *     function serveTea() { return 'cup of tea'; };\n\
   *     assert.isFunction(serveTea, 'great, we can have tea now');\n\
   *\n\
   * @name isFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a function.\n\
   *\n\
   *     var serveTea = [ 'heat', 'pour', 'sip' ];\n\
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');\n\
   *\n\
   * @name isNotFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isObject(value, [message])\n\
   *\n\
   * Asserts that `value` is an object (as revealed by\n\
   * `Object.prototype.toString`).\n\
   *\n\
   *     var selection = { name: 'Chai', serve: 'with spices' };\n\
   *     assert.isObject(selection, 'tea selection is an object');\n\
   *\n\
   * @name isObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isObject = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotObject(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an object.\n\
   *\n\
   *     var selection = 'chai'\n\
   *     assert.isNotObject(selection, 'tea selection is not an object');\n\
   *     assert.isNotObject(null, 'null is not an object');\n\
   *\n\
   * @name isNotObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotObject = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isArray(value, [message])\n\
   *\n\
   * Asserts that `value` is an array.\n\
   *\n\
   *     var menu = [ 'green', 'chai', 'oolong' ];\n\
   *     assert.isArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isArray = function (val, msg) {\n\
    new Assertion(val, msg).to.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotArray(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an array.\n\
   *\n\
   *     var menu = 'green|chai|oolong';\n\
   *     assert.isNotArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isNotArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotArray = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isString(value, [message])\n\
   *\n\
   * Asserts that `value` is a string.\n\
   *\n\
   *     var teaOrder = 'chai';\n\
   *     assert.isString(teaOrder, 'order placed');\n\
   *\n\
   * @name isString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isString = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotString(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a string.\n\
   *\n\
   *     var teaOrder = 4;\n\
   *     assert.isNotString(teaOrder, 'order placed');\n\
   *\n\
   * @name isNotString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotString = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is a number.\n\
   *\n\
   *     var cups = 2;\n\
   *     assert.isNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNumber\n\
   * @param {Number} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a number.\n\
   *\n\
   *     var cups = '2 cups please';\n\
   *     assert.isNotNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNotNumber\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is a boolean.\n\
   *\n\
   *     var teaReady = true\n\
   *       , teaServed = false;\n\
   *\n\
   *     assert.isBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a boolean.\n\
   *\n\
   *     var teaReady = 'yep'\n\
   *       , teaServed = 'nope';\n\
   *\n\
   *     assert.isNotBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isNotBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isNotBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .typeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');\n\
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');\n\
   *     assert.typeOf('tea', 'string', 'we have a string');\n\
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');\n\
   *     assert.typeOf(null, 'null', 'we have a null');\n\
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');\n\
   *\n\
   * @name typeOf\n\
   * @param {Mixed} value\n\
   * @param {String} name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.typeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notTypeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is _not_ `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');\n\
   *\n\
   * @name notTypeOf\n\
   * @param {Mixed} value\n\
   * @param {String} typeof name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notTypeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .instanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts that `value` is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new Tea('chai');\n\
   *\n\
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');\n\
   *\n\
   * @name instanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.instanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notInstanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts `value` is not an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new String('chai');\n\
   *\n\
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');\n\
   *\n\
   * @name notInstanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInstanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .include(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` includes `needle`. Works\n\
   * for strings and arrays.\n\
   *\n\
   *     assert.include('foobar', 'bar', 'foobar contains string \"bar\"');\n\
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');\n\
   *\n\
   * @name include\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.include = function (exp, inc, msg) {\n\
    new Assertion(exp, msg, assert.include).include(inc);\n\
  };\n\
\n\
  /**\n\
   * ### .notInclude(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` does not include `needle`. Works\n\
   * for strings and arrays.\n\
   *i\n\
   *     assert.notInclude('foobar', 'baz', 'string not include substring');\n\
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');\n\
   *\n\
   * @name notInclude\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInclude = function (exp, inc, msg) {\n\
    new Assertion(exp, msg, assert.notInclude).not.include(inc);\n\
  };\n\
\n\
  /**\n\
   * ### .match(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` matches the regular expression `regexp`.\n\
   *\n\
   *     assert.match('foobar', /^foo/, 'regexp matches');\n\
   *\n\
   * @name match\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.match = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .notMatch(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` does not match the regular expression `regexp`.\n\
   *\n\
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');\n\
   *\n\
   * @name notMatch\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notMatch = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.not.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .property(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`.\n\
   *\n\
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');\n\
   *\n\
   * @name property\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.property = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`.\n\
   *\n\
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');\n\
   *\n\
   * @name notProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .deepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, which can be a\n\
   * string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');\n\
   *\n\
   * @name deepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`, which\n\
   * can be a string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');\n\
   *\n\
   * @name notDeepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`.\n\
   *\n\
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');\n\
   *\n\
   * @name propertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`.\n\
   *\n\
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');\n\
   *\n\
   * @name propertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`. `property` can use dot- and bracket-notation for deep\n\
   * reference.\n\
   *\n\
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');\n\
   *\n\
   * @name deepPropertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`. `property` can use dot- and\n\
   * bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');\n\
   *\n\
   * @name deepPropertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .lengthOf(object, length, [message])\n\
   *\n\
   * Asserts that `object` has a `length` property with the expected value.\n\
   *\n\
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');\n\
   *     assert.lengthOf('foobar', 5, 'string has length of 6');\n\
   *\n\
   * @name lengthOf\n\
   * @param {Mixed} object\n\
   * @param {Number} length\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.lengthOf = function (exp, len, msg) {\n\
    new Assertion(exp, msg).to.have.length(len);\n\
  };\n\
\n\
  /**\n\
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])\n\
   *\n\
   * Asserts that `function` will throw an error that is an instance of\n\
   * `constructor`, or alternately that it will throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.throw(fn, 'function throws a reference error');\n\
   *     assert.throw(fn, /function throws a reference error/);\n\
   *     assert.throw(fn, ReferenceError);\n\
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');\n\
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);\n\
   *\n\
   * @name throws\n\
   * @alias throw\n\
   * @alias Throw\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.Throw = function (fn, errt, errs, msg) {\n\
    if ('string' === typeof errt || errt instanceof RegExp) {\n\
      errs = errt;\n\
      errt = null;\n\
    }\n\
\n\
    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);\n\
    return flag(assertErr, 'object');\n\
  };\n\
\n\
  /**\n\
   * ### .doesNotThrow(function, [constructor/regexp], [message])\n\
   *\n\
   * Asserts that `function` will _not_ throw an error that is an instance of\n\
   * `constructor`, or alternately that it will not throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.doesNotThrow(fn, Error, 'function does not throw');\n\
   *\n\
   * @name doesNotThrow\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.doesNotThrow = function (fn, type, msg) {\n\
    if ('string' === typeof type) {\n\
      msg = type;\n\
      type = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.not.Throw(type);\n\
  };\n\
\n\
  /**\n\
   * ### .operator(val1, operator, val2, [message])\n\
   *\n\
   * Compares two values using `operator`.\n\
   *\n\
   *     assert.operator(1, '<', 2, 'everything is ok');\n\
   *     assert.operator(1, '>', 2, 'this will fail');\n\
   *\n\
   * @name operator\n\
   * @param {Mixed} val1\n\
   * @param {String} operator\n\
   * @param {Mixed} val2\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.operator = function (val, operator, val2, msg) {\n\
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {\n\
      throw new Error('Invalid operator \"' + operator + '\"');\n\
    }\n\
    var test = new Assertion(eval(val + operator + val2), msg);\n\
    test.assert(\n\
        true === flag(test, 'object')\n\
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)\n\
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );\n\
  };\n\
\n\
  /**\n\
   * ### .closeTo(actual, expected, delta, [message])\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} actual\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.closeTo = function (act, exp, delta, msg) {\n\
    new Assertion(act, msg).to.be.closeTo(exp, delta);\n\
  };\n\
\n\
  /**\n\
   * ### .sameMembers(set1, set2, [message])\n\
   *\n\
   * Asserts that `set1` and `set2` have the same members.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');\n\
   *\n\
   * @name sameMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.sameMembers = function (set1, set2, msg) {\n\
    new Assertion(set1, msg).to.have.same.members(set2);\n\
  }\n\
\n\
  /**\n\
   * ### .includeMembers(superset, subset, [message])\n\
   *\n\
   * Asserts that `subset` is included in `superset`.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');\n\
   *\n\
   * @name includeMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.includeMembers = function (superset, subset, msg) {\n\
    new Assertion(superset, msg).to.include.members(subset);\n\
  }\n\
\n\
  /*!\n\
   * Undocumented / untested\n\
   */\n\
\n\
  assert.ifError = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.ok;\n\
  };\n\
\n\
  /*!\n\
   * Aliases.\n\
   */\n\
\n\
  (function alias(name, as){\n\
    assert[as] = assert[name];\n\
    return alias;\n\
  })\n\
  ('Throw', 'throw')\n\
  ('Throw', 'throws');\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/interface/assert.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/interface/expect.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  chai.expect = function (val, message) {\n\
    return new chai.Assertion(val, message);\n\
  };\n\
};\n\
\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/interface/expect.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/interface/should.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  var Assertion = chai.Assertion;\n\
\n\
  function loadShould () {\n\
    // explicitly define this method as function as to have it's name to include as `ssfi`\n\
    function shouldGetter() {\n\
      if (this instanceof String || this instanceof Number) {\n\
        return new Assertion(this.constructor(this), null, shouldGetter);\n\
      } else if (this instanceof Boolean) {\n\
        return new Assertion(this == true, null, shouldGetter);\n\
      }\n\
      return new Assertion(this, null, shouldGetter);\n\
    }\n\
    function shouldSetter(value) {\n\
      // See https://github.com/chaijs/chai/issues/86: this makes\n\
      // `whatever.should = someValue` actually set `someValue`, which is\n\
      // especially useful for `global.should = require('chai').should()`.\n\
      //\n\
      // Note that we have to use [[DefineProperty]] instead of [[Put]]\n\
      // since otherwise we would trigger this very setter!\n\
      Object.defineProperty(this, 'should', {\n\
        value: value,\n\
        enumerable: true,\n\
        configurable: true,\n\
        writable: true\n\
      });\n\
    }\n\
    // modify Object.prototype to have `should`\n\
    Object.defineProperty(Object.prototype, 'should', {\n\
      set: shouldSetter\n\
      , get: shouldGetter\n\
      , configurable: true\n\
    });\n\
\n\
    var should = {};\n\
\n\
    should.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.equal(val2);\n\
    };\n\
\n\
    should.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.Throw(errt, errs);\n\
    };\n\
\n\
    should.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.exist;\n\
    }\n\
\n\
    // negation\n\
    should.not = {}\n\
\n\
    should.not.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.not.equal(val2);\n\
    };\n\
\n\
    should.not.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.not.Throw(errt, errs);\n\
    };\n\
\n\
    should.not.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.not.exist;\n\
    }\n\
\n\
    should['throw'] = should['Throw'];\n\
    should.not['throw'] = should.not['Throw'];\n\
\n\
    return should;\n\
  };\n\
\n\
  chai.should = loadShould;\n\
  chai.Should = loadShould;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/interface/should.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/addChainableMethod.js", Function("exports, module",
"/*!\n\
 * Chai - addChainingMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var transferFlags = require(\"chaijs~chai@1.9.1/lib/chai/utils/transferFlags.js\");\n\
var flag = require(\"chaijs~chai@1.9.1/lib/chai/utils/flag.js\");\n\
var config = require(\"chaijs~chai@1.9.1/lib/chai/config.js\");\n\
\n\
/*!\n\
 * Module variables\n\
 */\n\
\n\
// Check whether `__proto__` is supported\n\
var hasProtoSupport = '__proto__' in Object;\n\
\n\
// Without `__proto__` support, this module will need to add properties to a function.\n\
// However, some Function.prototype methods cannot be overwritten,\n\
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).\n\
var excludeNames = /^(?:length|name|arguments|caller)$/;\n\
\n\
// Cache `Function` properties\n\
var call  = Function.prototype.call,\n\
    apply = Function.prototype.apply;\n\
\n\
/**\n\
 * ### addChainableMethod (ctx, name, method, chainingBehavior)\n\
 *\n\
 * Adds a method to an object, such that the method can also be chained.\n\
 *\n\
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);\n\
 *\n\
 * The result can then be used as both a method assertion, executing both `method` and\n\
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *     expect(fooStr).to.be.foo.equal('foo');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for `name`, when called\n\
 * @param {Function} chainingBehavior function to be called every time the property is accessed\n\
 * @name addChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  if (typeof chainingBehavior !== 'function') {\n\
    chainingBehavior = function () { };\n\
  }\n\
\n\
  var chainableBehavior = {\n\
      method: method\n\
    , chainingBehavior: chainingBehavior\n\
  };\n\
\n\
  // save the methods so we can overwrite them later, if we need to.\n\
  if (!ctx.__methods) {\n\
    ctx.__methods = {};\n\
  }\n\
  ctx.__methods[name] = chainableBehavior;\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        chainableBehavior.chainingBehavior.call(this);\n\
\n\
        var assert = function assert() {\n\
          var old_ssfi = flag(this, 'ssfi');\n\
          if (old_ssfi && config.includeStack === false)\n\
            flag(this, 'ssfi', assert);\n\
          var result = chainableBehavior.method.apply(this, arguments);\n\
          return result === undefined ? this : result;\n\
        };\n\
\n\
        // Use `__proto__` if available\n\
        if (hasProtoSupport) {\n\
          // Inherit all properties from the object by replacing the `Function` prototype\n\
          var prototype = assert.__proto__ = Object.create(this);\n\
          // Restore the `call` and `apply` methods from `Function`\n\
          prototype.call = call;\n\
          prototype.apply = apply;\n\
        }\n\
        // Otherwise, redefine all properties (slow!)\n\
        else {\n\
          var asserterNames = Object.getOwnPropertyNames(ctx);\n\
          asserterNames.forEach(function (asserterName) {\n\
            if (!excludeNames.test(asserterName)) {\n\
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);\n\
              Object.defineProperty(assert, asserterName, pd);\n\
            }\n\
          });\n\
        }\n\
\n\
        transferFlags(this, assert);\n\
        return assert;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/addChainableMethod.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/addMethod.js", Function("exports, module",
"/*!\n\
 * Chai - addMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var config = require(\"chaijs~chai@1.9.1/lib/chai/config.js\");\n\
\n\
/**\n\
 * ### .addMethod (ctx, name, method)\n\
 *\n\
 * Adds a method to the prototype of an object.\n\
 *\n\
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for name\n\
 * @name addMethod\n\
 * @api public\n\
 */\n\
var flag = require(\"chaijs~chai@1.9.1/lib/chai/utils/flag.js\");\n\
\n\
module.exports = function (ctx, name, method) {\n\
  ctx[name] = function () {\n\
    var old_ssfi = flag(this, 'ssfi');\n\
    if (old_ssfi && config.includeStack === false)\n\
      flag(this, 'ssfi', ctx[name]);\n\
    var result = method.apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/addMethod.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/addProperty.js", Function("exports, module",
"/*!\n\
 * Chai - addProperty utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### addProperty (ctx, name, getter)\n\
 *\n\
 * Adds a property to the prototype of an object.\n\
 *\n\
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.instanceof(Foo);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.foo;\n\
 *\n\
 * @param {Object} ctx object to which the property is added\n\
 * @param {String} name of property to add\n\
 * @param {Function} getter function to be used for name\n\
 * @name addProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter.call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/addProperty.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/flag.js", Function("exports, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### flag(object ,key, [value])\n\
 *\n\
 * Get or set a flag value on an object. If a\n\
 * value is provided it will be set, else it will\n\
 * return the currently set value or `undefined` if\n\
 * the value is not set.\n\
 *\n\
 *     utils.flag(this, 'foo', 'bar'); // setter\n\
 *     utils.flag(this, 'foo'); // getter, returns `bar`\n\
 *\n\
 * @param {Object} object (constructed Assertion\n\
 * @param {String} key\n\
 * @param {Mixed} value (optional)\n\
 * @name flag\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj, key, value) {\n\
  var flags = obj.__flags || (obj.__flags = Object.create(null));\n\
  if (arguments.length === 3) {\n\
    flags[key] = value;\n\
  } else {\n\
    return flags[key];\n\
  }\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/flag.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getActual.js", Function("exports, module",
"/*!\n\
 * Chai - getActual utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getActual(object, [actual])\n\
 *\n\
 * Returns the `actual` value for an Assertion\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  return args.length > 4 ? args[4] : obj._obj;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getActual.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getEnumerableProperties.js", Function("exports, module",
"/*!\n\
 * Chai - getEnumerableProperties utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getEnumerableProperties(object)\n\
 *\n\
 * This allows the retrieval of enumerable property names of an object,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getEnumerableProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getEnumerableProperties(object) {\n\
  var result = [];\n\
  for (var name in object) {\n\
    result.push(name);\n\
  }\n\
  return result;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getEnumerableProperties.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getMessage.js", Function("exports, module",
"/*!\n\
 * Chai - message composition utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require(\"chaijs~chai@1.9.1/lib/chai/utils/flag.js\")\n\
  , getActual = require(\"chaijs~chai@1.9.1/lib/chai/utils/getActual.js\")\n\
  , inspect = require(\"chaijs~chai@1.9.1/lib/chai/utils/inspect.js\")\n\
  , objDisplay = require(\"chaijs~chai@1.9.1/lib/chai/utils/objDisplay.js\");\n\
\n\
/**\n\
 * ### .getMessage(object, message, negateMessage)\n\
 *\n\
 * Construct the error message based on flags\n\
 * and template tags. Template tags will return\n\
 * a stringified inspection of the object referenced.\n\
 *\n\
 * Message template tags:\n\
 * - `#{this}` current asserted object\n\
 * - `#{act}` actual value\n\
 * - `#{exp}` expected value\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 * @name getMessage\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , val = flag(obj, 'object')\n\
    , expected = args[3]\n\
    , actual = getActual(obj, args)\n\
    , msg = negate ? args[2] : args[1]\n\
    , flagMsg = flag(obj, 'message');\n\
\n\
  msg = msg || '';\n\
  msg = msg\n\
    .replace(/#{this}/g, objDisplay(val))\n\
    .replace(/#{act}/g, objDisplay(actual))\n\
    .replace(/#{exp}/g, objDisplay(expected));\n\
\n\
  return flagMsg ? flagMsg + ': ' + msg : msg;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getMessage.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getName.js", Function("exports, module",
"/*!\n\
 * Chai - getName utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getName(func)\n\
 *\n\
 * Gets the name of a function, in a cross-browser way.\n\
 *\n\
 * @param {Function} a function (usually a constructor)\n\
 */\n\
\n\
module.exports = function (func) {\n\
  if (func.name) return func.name;\n\
\n\
  var match = /^\\s?function ([^(]*)\\(/.exec(func);\n\
  return match && match[1] ? match[1] : \"\";\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getName.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getPathValue.js", Function("exports, module",
"/*!\n\
 * Chai - getPathValue utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * @see https://github.com/logicalparadox/filtr\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getPathValue(path, object)\n\
 *\n\
 * This allows the retrieval of values in an\n\
 * object given a string path.\n\
 *\n\
 *     var obj = {\n\
 *         prop1: {\n\
 *             arr: ['a', 'b', 'c']\n\
 *           , str: 'Hello'\n\
 *         }\n\
 *       , prop2: {\n\
 *             arr: [ { nested: 'Universe' } ]\n\
 *           , str: 'Hello again!'\n\
 *         }\n\
 *     }\n\
 *\n\
 * The following would be the results.\n\
 *\n\
 *     getPathValue('prop1.str', obj); // Hello\n\
 *     getPathValue('prop1.att[2]', obj); // b\n\
 *     getPathValue('prop2.arr[0].nested', obj); // Universe\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} object\n\
 * @returns {Object} value or `undefined`\n\
 * @name getPathValue\n\
 * @api public\n\
 */\n\
\n\
var getPathValue = module.exports = function (path, obj) {\n\
  var parsed = parsePath(path);\n\
  return _getPathValue(parsed, obj);\n\
};\n\
\n\
/*!\n\
 * ## parsePath(path)\n\
 *\n\
 * Helper function used to parse string object\n\
 * paths. Use in conjunction with `_getPathValue`.\n\
 *\n\
 *      var parsed = parsePath('myobject.property.subprop');\n\
 *\n\
 * ### Paths:\n\
 *\n\
 * * Can be as near infinitely deep and nested\n\
 * * Arrays are also valid using the formal `myobject.document[3].property`.\n\
 *\n\
 * @param {String} path\n\
 * @returns {Object} parsed\n\
 * @api private\n\
 */\n\
\n\
function parsePath (path) {\n\
  var str = path.replace(/\\[/g, '.[')\n\
    , parts = str.match(/(\\\\\\.|[^.]+?)+/g);\n\
  return parts.map(function (value) {\n\
    var re = /\\[(\\d+)\\]$/\n\
      , mArr = re.exec(value)\n\
    if (mArr) return { i: parseFloat(mArr[1]) };\n\
    else return { p: value };\n\
  });\n\
};\n\
\n\
/*!\n\
 * ## _getPathValue(parsed, obj)\n\
 *\n\
 * Helper companion function for `.parsePath` that returns\n\
 * the value located at the parsed address.\n\
 *\n\
 *      var value = getPathValue(parsed, obj);\n\
 *\n\
 * @param {Object} parsed definition from `parsePath`.\n\
 * @param {Object} object to search against\n\
 * @returns {Object|Undefined} value\n\
 * @api private\n\
 */\n\
\n\
function _getPathValue (parsed, obj) {\n\
  var tmp = obj\n\
    , res;\n\
  for (var i = 0, l = parsed.length; i < l; i++) {\n\
    var part = parsed[i];\n\
    if (tmp) {\n\
      if ('undefined' !== typeof part.p)\n\
        tmp = tmp[part.p];\n\
      else if ('undefined' !== typeof part.i)\n\
        tmp = tmp[part.i];\n\
      if (i == (l - 1)) res = tmp;\n\
    } else {\n\
      res = undefined;\n\
    }\n\
  }\n\
  return res;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getPathValue.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/getProperties.js", Function("exports, module",
"/*!\n\
 * Chai - getProperties utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getProperties(object)\n\
 *\n\
 * This allows the retrieval of property names of an object, enumerable or not,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getProperties(object) {\n\
  var result = Object.getOwnPropertyNames(subject);\n\
\n\
  function addProperty(property) {\n\
    if (result.indexOf(property) === -1) {\n\
      result.push(property);\n\
    }\n\
  }\n\
\n\
  var proto = Object.getPrototypeOf(subject);\n\
  while (proto !== null) {\n\
    Object.getOwnPropertyNames(proto).forEach(addProperty);\n\
    proto = Object.getPrototypeOf(proto);\n\
  }\n\
\n\
  return result;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/getProperties.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/index.js", Function("exports, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Main exports\n\
 */\n\
\n\
var exports = module.exports = {};\n\
\n\
/*!\n\
 * test utility\n\
 */\n\
\n\
exports.test = require(\"chaijs~chai@1.9.1/lib/chai/utils/test.js\");\n\
\n\
/*!\n\
 * type utility\n\
 */\n\
\n\
exports.type = require(\"chaijs~chai@1.9.1/lib/chai/utils/type.js\");\n\
\n\
/*!\n\
 * message utility\n\
 */\n\
\n\
exports.getMessage = require(\"chaijs~chai@1.9.1/lib/chai/utils/getMessage.js\");\n\
\n\
/*!\n\
 * actual utility\n\
 */\n\
\n\
exports.getActual = require(\"chaijs~chai@1.9.1/lib/chai/utils/getActual.js\");\n\
\n\
/*!\n\
 * Inspect util\n\
 */\n\
\n\
exports.inspect = require(\"chaijs~chai@1.9.1/lib/chai/utils/inspect.js\");\n\
\n\
/*!\n\
 * Object Display util\n\
 */\n\
\n\
exports.objDisplay = require(\"chaijs~chai@1.9.1/lib/chai/utils/objDisplay.js\");\n\
\n\
/*!\n\
 * Flag utility\n\
 */\n\
\n\
exports.flag = require(\"chaijs~chai@1.9.1/lib/chai/utils/flag.js\");\n\
\n\
/*!\n\
 * Flag transferring utility\n\
 */\n\
\n\
exports.transferFlags = require(\"chaijs~chai@1.9.1/lib/chai/utils/transferFlags.js\");\n\
\n\
/*!\n\
 * Deep equal utility\n\
 */\n\
\n\
exports.eql = require(\"chaijs~deep-eql@0.1.3\");\n\
\n\
/*!\n\
 * Deep path value\n\
 */\n\
\n\
exports.getPathValue = require(\"chaijs~chai@1.9.1/lib/chai/utils/getPathValue.js\");\n\
\n\
/*!\n\
 * Function name\n\
 */\n\
\n\
exports.getName = require(\"chaijs~chai@1.9.1/lib/chai/utils/getName.js\");\n\
\n\
/*!\n\
 * add Property\n\
 */\n\
\n\
exports.addProperty = require(\"chaijs~chai@1.9.1/lib/chai/utils/addProperty.js\");\n\
\n\
/*!\n\
 * add Method\n\
 */\n\
\n\
exports.addMethod = require(\"chaijs~chai@1.9.1/lib/chai/utils/addMethod.js\");\n\
\n\
/*!\n\
 * overwrite Property\n\
 */\n\
\n\
exports.overwriteProperty = require(\"chaijs~chai@1.9.1/lib/chai/utils/overwriteProperty.js\");\n\
\n\
/*!\n\
 * overwrite Method\n\
 */\n\
\n\
exports.overwriteMethod = require(\"chaijs~chai@1.9.1/lib/chai/utils/overwriteMethod.js\");\n\
\n\
/*!\n\
 * Add a chainable method\n\
 */\n\
\n\
exports.addChainableMethod = require(\"chaijs~chai@1.9.1/lib/chai/utils/addChainableMethod.js\");\n\
\n\
/*!\n\
 * Overwrite chainable method\n\
 */\n\
\n\
exports.overwriteChainableMethod = require(\"chaijs~chai@1.9.1/lib/chai/utils/overwriteChainableMethod.js\");\n\
\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/index.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/inspect.js", Function("exports, module",
"// This is (almost) directly from Node.js utils\n\
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js\n\
\n\
var getName = require(\"chaijs~chai@1.9.1/lib/chai/utils/getName.js\");\n\
var getProperties = require(\"chaijs~chai@1.9.1/lib/chai/utils/getProperties.js\");\n\
var getEnumerableProperties = require(\"chaijs~chai@1.9.1/lib/chai/utils/getEnumerableProperties.js\");\n\
\n\
module.exports = inspect;\n\
\n\
/**\n\
 * Echos the value of a value. Trys to print the value out\n\
 * in the best way possible given the different types.\n\
 *\n\
 * @param {Object} obj The object to print out.\n\
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)\n\
 *    properties of objects.\n\
 * @param {Number} depth Depth in which to descend in object. Default is 2.\n\
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the\n\
 *    output. Default is false (no coloring).\n\
 */\n\
function inspect(obj, showHidden, depth, colors) {\n\
  var ctx = {\n\
    showHidden: showHidden,\n\
    seen: [],\n\
    stylize: function (str) { return str; }\n\
  };\n\
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));\n\
}\n\
\n\
// https://gist.github.com/1044128/\n\
var getOuterHTML = function(element) {\n\
  if ('outerHTML' in element) return element.outerHTML;\n\
  var ns = \"http://www.w3.org/1999/xhtml\";\n\
  var container = document.createElementNS(ns, '_');\n\
  var elemProto = (window.HTMLElement || window.Element).prototype;\n\
  var xmlSerializer = new XMLSerializer();\n\
  var html;\n\
  if (document.xmlVersion) {\n\
    return xmlSerializer.serializeToString(element);\n\
  } else {\n\
    container.appendChild(element.cloneNode(false));\n\
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');\n\
    container.innerHTML = '';\n\
    return html;\n\
  }\n\
};\n\
\n\
// Returns true if object is a DOM element.\n\
var isDOMElement = function (object) {\n\
  if (typeof HTMLElement === 'object') {\n\
    return object instanceof HTMLElement;\n\
  } else {\n\
    return object &&\n\
      typeof object === 'object' &&\n\
      object.nodeType === 1 &&\n\
      typeof object.nodeName === 'string';\n\
  }\n\
};\n\
\n\
function formatValue(ctx, value, recurseTimes) {\n\
  // Provide a hook for user-specified inspect functions.\n\
  // Check that value is an object with an inspect function on it\n\
  if (value && typeof value.inspect === 'function' &&\n\
      // Filter out the util module, it's inspect function is special\n\
      value.inspect !== exports.inspect &&\n\
      // Also filter out any prototype objects using the circular check.\n\
      !(value.constructor && value.constructor.prototype === value)) {\n\
    var ret = value.inspect(recurseTimes);\n\
    if (typeof ret !== 'string') {\n\
      ret = formatValue(ctx, ret, recurseTimes);\n\
    }\n\
    return ret;\n\
  }\n\
\n\
  // Primitive types cannot have properties\n\
  var primitive = formatPrimitive(ctx, value);\n\
  if (primitive) {\n\
    return primitive;\n\
  }\n\
\n\
  // If it's DOM elem, get outer HTML.\n\
  if (isDOMElement(value)) {\n\
    return getOuterHTML(value);\n\
  }\n\
\n\
  // Look up the keys of the object.\n\
  var visibleKeys = getEnumerableProperties(value);\n\
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;\n\
\n\
  // Some type of object without properties can be shortcutted.\n\
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,\n\
  // a `stack` plus `description` property; ignore those for consistency.\n\
  if (keys.length === 0 || (isError(value) && (\n\
      (keys.length === 1 && keys[0] === 'stack') ||\n\
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')\n\
     ))) {\n\
    if (typeof value === 'function') {\n\
      var name = getName(value);\n\
      var nameSuffix = name ? ': ' + name : '';\n\
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');\n\
    }\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    }\n\
    if (isDate(value)) {\n\
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');\n\
    }\n\
    if (isError(value)) {\n\
      return formatError(value);\n\
    }\n\
  }\n\
\n\
  var base = '', array = false, braces = ['{', '}'];\n\
\n\
  // Make Array say that they are Array\n\
  if (isArray(value)) {\n\
    array = true;\n\
    braces = ['[', ']'];\n\
  }\n\
\n\
  // Make functions say that they are functions\n\
  if (typeof value === 'function') {\n\
    var name = getName(value);\n\
    var nameSuffix = name ? ': ' + name : '';\n\
    base = ' [Function' + nameSuffix + ']';\n\
  }\n\
\n\
  // Make RegExps say that they are RegExps\n\
  if (isRegExp(value)) {\n\
    base = ' ' + RegExp.prototype.toString.call(value);\n\
  }\n\
\n\
  // Make dates with properties first say the date\n\
  if (isDate(value)) {\n\
    base = ' ' + Date.prototype.toUTCString.call(value);\n\
  }\n\
\n\
  // Make error with message first say the error\n\
  if (isError(value)) {\n\
    return formatError(value);\n\
  }\n\
\n\
  if (keys.length === 0 && (!array || value.length == 0)) {\n\
    return braces[0] + base + braces[1];\n\
  }\n\
\n\
  if (recurseTimes < 0) {\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    } else {\n\
      return ctx.stylize('[Object]', 'special');\n\
    }\n\
  }\n\
\n\
  ctx.seen.push(value);\n\
\n\
  var output;\n\
  if (array) {\n\
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n\
  } else {\n\
    output = keys.map(function(key) {\n\
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n\
    });\n\
  }\n\
\n\
  ctx.seen.pop();\n\
\n\
  return reduceToSingleString(output, base, braces);\n\
}\n\
\n\
\n\
function formatPrimitive(ctx, value) {\n\
  switch (typeof value) {\n\
    case 'undefined':\n\
      return ctx.stylize('undefined', 'undefined');\n\
\n\
    case 'string':\n\
      var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                               .replace(/'/g, \"\\\\'\")\n\
                                               .replace(/\\\\\"/g, '\"') + '\\'';\n\
      return ctx.stylize(simple, 'string');\n\
\n\
    case 'number':\n\
      return ctx.stylize('' + value, 'number');\n\
\n\
    case 'boolean':\n\
      return ctx.stylize('' + value, 'boolean');\n\
  }\n\
  // For some reason typeof null is \"object\", so special case here.\n\
  if (value === null) {\n\
    return ctx.stylize('null', 'null');\n\
  }\n\
}\n\
\n\
\n\
function formatError(value) {\n\
  return '[' + Error.prototype.toString.call(value) + ']';\n\
}\n\
\n\
\n\
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n\
  var output = [];\n\
  for (var i = 0, l = value.length; i < l; ++i) {\n\
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          String(i), true));\n\
    } else {\n\
      output.push('');\n\
    }\n\
  }\n\
  keys.forEach(function(key) {\n\
    if (!key.match(/^\\d+$/)) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          key, true));\n\
    }\n\
  });\n\
  return output;\n\
}\n\
\n\
\n\
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n\
  var name, str;\n\
  if (value.__lookupGetter__) {\n\
    if (value.__lookupGetter__(key)) {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Getter/Setter]', 'special');\n\
      } else {\n\
        str = ctx.stylize('[Getter]', 'special');\n\
      }\n\
    } else {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Setter]', 'special');\n\
      }\n\
    }\n\
  }\n\
  if (visibleKeys.indexOf(key) < 0) {\n\
    name = '[' + key + ']';\n\
  }\n\
  if (!str) {\n\
    if (ctx.seen.indexOf(value[key]) < 0) {\n\
      if (recurseTimes === null) {\n\
        str = formatValue(ctx, value[key], null);\n\
      } else {\n\
        str = formatValue(ctx, value[key], recurseTimes - 1);\n\
      }\n\
      if (str.indexOf('\\n\
') > -1) {\n\
        if (array) {\n\
          str = str.split('\\n\
').map(function(line) {\n\
            return '  ' + line;\n\
          }).join('\\n\
').substr(2);\n\
        } else {\n\
          str = '\\n\
' + str.split('\\n\
').map(function(line) {\n\
            return '   ' + line;\n\
          }).join('\\n\
');\n\
        }\n\
      }\n\
    } else {\n\
      str = ctx.stylize('[Circular]', 'special');\n\
    }\n\
  }\n\
  if (typeof name === 'undefined') {\n\
    if (array && key.match(/^\\d+$/)) {\n\
      return str;\n\
    }\n\
    name = JSON.stringify('' + key);\n\
    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
      name = name.substr(1, name.length - 2);\n\
      name = ctx.stylize(name, 'name');\n\
    } else {\n\
      name = name.replace(/'/g, \"\\\\'\")\n\
                 .replace(/\\\\\"/g, '\"')\n\
                 .replace(/(^\"|\"$)/g, \"'\");\n\
      name = ctx.stylize(name, 'string');\n\
    }\n\
  }\n\
\n\
  return name + ': ' + str;\n\
}\n\
\n\
\n\
function reduceToSingleString(output, base, braces) {\n\
  var numLinesEst = 0;\n\
  var length = output.reduce(function(prev, cur) {\n\
    numLinesEst++;\n\
    if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
    return prev + cur.length + 1;\n\
  }, 0);\n\
\n\
  if (length > 60) {\n\
    return braces[0] +\n\
           (base === '' ? '' : base + '\\n\
 ') +\n\
           ' ' +\n\
           output.join(',\\n\
  ') +\n\
           ' ' +\n\
           braces[1];\n\
  }\n\
\n\
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
}\n\
\n\
function isArray(ar) {\n\
  return Array.isArray(ar) ||\n\
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');\n\
}\n\
\n\
function isRegExp(re) {\n\
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';\n\
}\n\
\n\
function isDate(d) {\n\
  return typeof d === 'object' && objectToString(d) === '[object Date]';\n\
}\n\
\n\
function isError(e) {\n\
  return typeof e === 'object' && objectToString(e) === '[object Error]';\n\
}\n\
\n\
function objectToString(o) {\n\
  return Object.prototype.toString.call(o);\n\
}\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/inspect.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/objDisplay.js", Function("exports, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var inspect = require(\"chaijs~chai@1.9.1/lib/chai/utils/inspect.js\");\n\
var config = require(\"chaijs~chai@1.9.1/lib/chai/config.js\");\n\
\n\
/**\n\
 * ### .objDisplay (object)\n\
 *\n\
 * Determines if an object or an array matches\n\
 * criteria to be inspected in-line for error\n\
 * messages or should be truncated.\n\
 *\n\
 * @param {Mixed} javascript object to inspect\n\
 * @name objDisplay\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = inspect(obj)\n\
    , type = Object.prototype.toString.call(obj);\n\
\n\
  if (config.truncateThreshold && str.length >= config.truncateThreshold) {\n\
    if (type === '[object Function]') {\n\
      return !obj.name || obj.name === ''\n\
        ? '[Function]'\n\
        : '[Function: ' + obj.name + ']';\n\
    } else if (type === '[object Array]') {\n\
      return '[ Array(' + obj.length + ') ]';\n\
    } else if (type === '[object Object]') {\n\
      var keys = Object.keys(obj)\n\
        , kstr = keys.length > 2\n\
          ? keys.splice(0, 2).join(', ') + ', ...'\n\
          : keys.join(', ');\n\
      return '{ Object (' + kstr + ') }';\n\
    } else {\n\
      return str;\n\
    }\n\
  } else {\n\
    return str;\n\
  }\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/objDisplay.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/overwriteMethod.js", Function("exports, module",
"/*!\n\
 * Chai - overwriteMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing method and provides\n\
 * access to previous function. Must return function\n\
 * to be used for name.\n\
 *\n\
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {\n\
 *       return function (str) {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.value).to.equal(str);\n\
 *         } else {\n\
 *           _super.apply(this, arguments);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.equal('bar');\n\
 *\n\
 * @param {Object} ctx object whose method is to be overwritten\n\
 * @param {String} name of method to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @name overwriteMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  var _method = ctx[name]\n\
    , _super = function () { return this; };\n\
\n\
  if (_method && 'function' === typeof _method)\n\
    _super = _method;\n\
\n\
  ctx[name] = function () {\n\
    var result = method(_super).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  }\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/overwriteMethod.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/overwriteProperty.js", Function("exports, module",
"/*!\n\
 * Chai - overwriteProperty utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteProperty (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing property getter and provides\n\
 * access to previous value. Must return function to use as getter.\n\
 *\n\
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {\n\
 *       return function () {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.name).to.equal('bar');\n\
 *         } else {\n\
 *           _super.call(this);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.ok;\n\
 *\n\
 * @param {Object} ctx object whose property is to be overwritten\n\
 * @param {String} name of property to overwrite\n\
 * @param {Function} getter function that returns a getter function to be used for name\n\
 * @name overwriteProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  var _get = Object.getOwnPropertyDescriptor(ctx, name)\n\
    , _super = function () {};\n\
\n\
  if (_get && 'function' === typeof _get.get)\n\
    _super = _get.get\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter(_super).call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/overwriteProperty.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/overwriteChainableMethod.js", Function("exports, module",
"/*!\n\
 * Chai - overwriteChainableMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteChainableMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing chainable method\n\
 * and provides access to the previous function or\n\
 * property.  Must return functions to be used for\n\
 * name.\n\
 *\n\
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',\n\
 *       function (_super) {\n\
 *       }\n\
 *     , function (_super) {\n\
 *       }\n\
 *     );\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.have.length(3);\n\
 *     expect(myFoo).to.have.length.above(3);\n\
 *\n\
 * @param {Object} ctx object whose method / property is to be overwritten\n\
 * @param {String} name of method / property to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @param {Function} chainingBehavior function that returns a function to be used for property\n\
 * @name overwriteChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  var chainableBehavior = ctx.__methods[name];\n\
\n\
  var _chainingBehavior = chainableBehavior.chainingBehavior;\n\
  chainableBehavior.chainingBehavior = function () {\n\
    var result = chainingBehavior(_chainingBehavior).call(this);\n\
    return result === undefined ? this : result;\n\
  };\n\
\n\
  var _method = chainableBehavior.method;\n\
  chainableBehavior.method = function () {\n\
    var result = method(_method).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/overwriteChainableMethod.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/test.js", Function("exports, module",
"/*!\n\
 * Chai - test utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require(\"chaijs~chai@1.9.1/lib/chai/utils/flag.js\");\n\
\n\
/**\n\
 * # test(object, expression)\n\
 *\n\
 * Test and object for expression.\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , expr = args[0];\n\
  return negate ? !expr : expr;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/test.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/transferFlags.js", Function("exports, module",
"/*!\n\
 * Chai - transferFlags utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### transferFlags(assertion, object, includeAll = true)\n\
 *\n\
 * Transfer all the flags for `assertion` to `object`. If\n\
 * `includeAll` is set to `false`, then the base Chai\n\
 * assertion flags (namely `object`, `ssfi`, and `message`)\n\
 * will not be transferred.\n\
 *\n\
 *\n\
 *     var newAssertion = new Assertion();\n\
 *     utils.transferFlags(assertion, newAssertion);\n\
 *\n\
 *     var anotherAsseriton = new Assertion(myObj);\n\
 *     utils.transferFlags(assertion, anotherAssertion, false);\n\
 *\n\
 * @param {Assertion} assertion the assertion to transfer the flags from\n\
 * @param {Object} object the object to transfer the flags too; usually a new assertion\n\
 * @param {Boolean} includeAll\n\
 * @name getAllFlags\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (assertion, object, includeAll) {\n\
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));\n\
\n\
  if (!object.__flags) {\n\
    object.__flags = Object.create(null);\n\
  }\n\
\n\
  includeAll = arguments.length === 3 ? includeAll : true;\n\
\n\
  for (var flag in flags) {\n\
    if (includeAll ||\n\
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {\n\
      object.__flags[flag] = flags[flag];\n\
    }\n\
  }\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/transferFlags.js"
));

require.register("chaijs~chai@1.9.1/lib/chai/utils/type.js", Function("exports, module",
"/*!\n\
 * Chai - type utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Arguments]': 'arguments'\n\
  , '[object Array]': 'array'\n\
  , '[object Date]': 'date'\n\
  , '[object Function]': 'function'\n\
  , '[object Number]': 'number'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object String]': 'string'\n\
};\n\
\n\
/**\n\
 * ### type(object)\n\
 *\n\
 * Better implementation of `typeof` detection that can\n\
 * be used cross-browser. Handles the inconsistencies of\n\
 * Array, `null`, and `undefined` detection.\n\
 *\n\
 *     utils.type({}) // 'object'\n\
 *     utils.type(null) // `null'\n\
 *     utils.type(undefined) // `undefined`\n\
 *     utils.type([]) // `array`\n\
 *\n\
 * @param {Mixed} object to detect type of\n\
 * @name type\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
};\n\
\n\
//# sourceURL=components/chaijs/chai/1.9.1/lib/chai/utils/type.js"
));

require.modules["chaijs-chai"] = require.modules["chaijs~chai@1.9.1"];
require.modules["chaijs~chai"] = require.modules["chaijs~chai@1.9.1"];
require.modules["chai"] = require.modules["chaijs~chai@1.9.1"];


require.register("lru-cache", Function("exports, module",
"var lf = require(\"mozilla~localforage@0.7.0\"),\n\
    Promise = require(\"then~promise@5.0.0\");\n\
\n\
// max size if not specifed\n\
var MAX_SIZE = 100;\n\
\n\
function naiveLength () { return 1; }\n\
\n\
/**\n\
 * create a promise that fails after `ms` milliseconds\n\
 * @param {ms} Number delay in ms\n\
 *\n\
 * @return {Promise}\n\
 */\n\
\n\
function timeout(ms) {\n\
  return new Promise(function(resolve, reject) {\n\
    setTimeout(function() { reject(new Error('timeout')); }, ms || 100);\n\
  });\n\
}\n\
\n\
// function strLength(key, value) {\n\
//   return key.toString().length + JSON.stringify(value || null).length;\n\
// };\n\
\n\
/**\n\
 * hasOwnProperty alias\n\
 * @param  {Object} obj\n\
 * @param  {String} key\n\
 *\n\
 * @return {Boolean}\n\
 */\n\
\n\
function hop (obj, key) {\n\
  return Object.prototype.hasOwnProperty.call(obj, key);\n\
}\n\
\n\
/**\n\
 * Store class\n\
 * thin layer on top of localforage to allow namespacing\n\
 */\n\
\n\
function Store(_) {\n\
  if (!(this instanceof Store)) return new Store(_);\n\
  this._ = _ || '_';\n\
}\n\
\n\
Store.prototype.setItem = function(key, val, cb) {\n\
  return lf.setItem(this._ + key, val, cb);\n\
};\n\
\n\
Store.prototype.getItem = function(key, cb) {\n\
  return lf.getItem(this._ + key, cb);\n\
};\n\
\n\
Store.prototype.removeItem = function(key, cb) {\n\
  return lf.removeItem(this._ + key, cb);\n\
};\n\
\n\
Store.prototype.get = function(cb) {\n\
  return this.getItem('', cb);\n\
};\n\
\n\
Store.prototype.save = function(val, cb) {\n\
  return this.setItem('', val, cb);\n\
};\n\
\n\
/**\n\
 * Entry Class\n\
 * container for lru items\n\
 */\n\
\n\
function Entry (key, value, lu, length, age, loaded) {\n\
  this.key = key;\n\
  this.value = value;\n\
  this.lu = lu;\n\
  this.age = age;\n\
  this.length = length;\n\
  this.loaded = loaded;\n\
}\n\
\n\
/**\n\
 * calculate entry age\n\
 */\n\
\n\
Entry.prototype.getAge = function() {\n\
  return Date.now() - this.age;\n\
};\n\
\n\
/**\n\
 * Cache class\n\
 */\n\
\n\
function Cache(name) {\n\
\n\
  // namespaced storage instance\n\
  this.store = new Store(name || 'lru/');\n\
\n\
  // hash of items by key\n\
  this.items = Object.create(null);\n\
\n\
  // list of items in order of use recency\n\
  this.list = Object.create(null);\n\
}\n\
\n\
/**\n\
 * update cache ls entries\n\
 *\n\
 * @return {Promise}\n\
 */\n\
\n\
Cache.prototype.update = function () {\n\
  var entries;\n\
\n\
  // serialize entries\n\
  entries = Object\n\
    .keys(this.items)\n\
    .map(function (key) {\n\
      var item = this.items[key];\n\
      return {\n\
        key: item.key,\n\
        age: item.age,\n\
        lu: item.lu,\n\
        length: item.length\n\
      };\n\
    }, this);\n\
\n\
  // save it\n\
  return this.store.save(entries);\n\
};\n\
\n\
/**\n\
 * get item in cache\n\
 * get entry value, load value from ls if value is not yet loaded\n\
 *\n\
 * @param {string} key\n\
 * @return {Promise}\n\
 */\n\
\n\
Cache.prototype.get = function (key) {\n\
\n\
  // key does not exist\n\
  if (!hop(this.items, key)) return Promise.resolve();\n\
\n\
  // get item from mem store\n\
  var item = this.items[key];\n\
  if (item.loaded) return Promise.resolve(item);\n\
\n\
  // load item from store\n\
  return this.store\n\
    .getItem(key)\n\
    .then(function(value) {\n\
      item.value = value;\n\
      item.loaded = true;\n\
      return item;\n\
    });\n\
};\n\
\n\
/**\n\
 * check if cache has specified key\n\
 *\n\
 * @param  {String}  key\n\
 * @return {Boolean}\n\
 */\n\
\n\
Cache.prototype.has = function (key) {\n\
  return hop(this.items, key);\n\
};\n\
\n\
/**\n\
 * set value\n\
 * set entry length and store it cache\n\
 *\n\
 * @param {String} key\n\
 * @param {Entry} hit\n\
 *\n\
 * @return {Promise}\n\
 */\n\
\n\
Cache.prototype.set = function (key, hit) {\n\
  this.list[hit.lu] = this.items[key] = hit;\n\
  return this.store.setItem(key, hit.value);\n\
};\n\
\n\
/**\n\
 * delete value\n\
 *\n\
 * @param  {String} key\n\
 */\n\
\n\
Cache.prototype.del = function (key) {\n\
  delete this.items[key];\n\
  return this.store.removeItem(key);\n\
};\n\
\n\
/**\n\
 * reset cache\n\
 */\n\
\n\
Cache.prototype.reset = function () {\n\
  var _this = this,\n\
      promises;\n\
\n\
  promises = Object\n\
    .keys(this.items)\n\
    .map(function(key) {\n\
      return _this.store.removeItem(key);\n\
    });\n\
\n\
  return Promise\n\
    .all(promises)\n\
    .then(function() {\n\
      _this.items = Object.create(null);\n\
      _this.list = Object.create(null);\n\
    });\n\
};\n\
\n\
/**\n\
 * LRU class\n\
 */\n\
\n\
function LRUCache (options) {\n\
  if (!(this instanceof LRUCache)) return new LRUCache(options);\n\
\n\
  if (typeof options === 'number') options = { max: options };\n\
  if (!options) options = {};\n\
\n\
  var cache = new Cache(options.name),\n\
      max = options.max || MAX_SIZE,\n\
      maxAge = options.maxAge || null,\n\
      lengthCalculator = options.length || naiveLength,\n\
      mru = 0, // most recently used\n\
      lru = 0, // least recently used\n\
      length = 0, // number of items in the list\n\
      itemCount = 0;\n\
\n\
  /**\n\
   * @property {Number} max cache max size\n\
   * resize cache when set\n\
   */\n\
\n\
  Object.defineProperty(this, 'max',\n\
    {\n\
      set : function (mL) {\n\
        if (!mL || ('number' !== typeof mL) || mL <= 0 ) mL = MAX_SIZE;\n\
        max = mL;\n\
        if (length > max) trim();\n\
      },\n\
      get : function () { return max; },\n\
      enumerable : true\n\
    });\n\
\n\
  /**\n\
   * @property {Number} length cache length\n\
   */\n\
\n\
  Object.defineProperty(this, 'length',\n\
    {\n\
      get : function () { return length; },\n\
      enumerable : true\n\
    });\n\
\n\
  /**\n\
   * @property {Number} itemCount\n\
   */\n\
\n\
  Object.defineProperty(this, 'itemCount',\n\
    {\n\
      get : function () { return itemCount; },\n\
      enumerable : true\n\
    });\n\
\n\
  /**\n\
   * shift entries in the cache\n\
   * update least recently used\n\
   *\n\
   * @param  {Entry} hit\n\
   */\n\
\n\
  function shiftLU(hit) {\n\
\n\
    // remove hit\n\
    delete cache.list[hit.lu];\n\
\n\
    // update least recently used\n\
    while (lru < mru && !cache.list[lru]) lru++;\n\
  }\n\
\n\
  /**\n\
   * Update LRU\n\
   * update least recently used\n\
   * set hit as most recently used\n\
   *\n\
   * @param  {Entry} hit\n\
   */\n\
\n\
  function use (hit) {\n\
    shiftLU(hit);\n\
    hit.lu = mru++;\n\
\n\
    // set hit as most recently used\n\
    cache.list[hit.lu] = hit;\n\
  }\n\
\n\
  /**\n\
   * delete entry in the cache\n\
   *\n\
   * @param  {Entry} hit\n\
   *\n\
   * @return {Promise}\n\
   */\n\
\n\
  function del(hit) {\n\
    if (!hit) return Promise.reject(new Error('no hit'));\n\
    length -= hit.length;\n\
    itemCount--;\n\
    shiftLU(hit);\n\
    return cache.del(hit.key);\n\
  }\n\
\n\
  /**\n\
   * trim cache\n\
   * remove oldest items until length < max\n\
   *\n\
   * @return {Promise}\n\
   */\n\
\n\
  function trim () {\n\
    var dels = [];\n\
    while (lru < mru && length > max) {\n\
      dels.push(del(cache.list[lru]));\n\
    }\n\
\n\
    return Promise.all(dels);\n\
  }\n\
\n\
  /**\n\
   * Return an array of the keys in the cache.\n\
   *\n\
   * @return {Array}\n\
   */\n\
\n\
  this.keys = function () {\n\
    var keys = new Array(itemCount);\n\
    var i = 0;\n\
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) {\n\
      if (cache.list[k]) {\n\
        var hit = cache.list[k];\n\
        keys[i++] = hit.key;\n\
      }\n\
    }\n\
    return keys;\n\
  };\n\
\n\
  /**\n\
   * get a key in the cache\n\
   * update LRU when `doUse` is true\n\
   * delete expired keys\n\
   *\n\
   * @param  {String} key\n\
   * @param  {Boolean} doUse update LRU\n\
   *\n\
   * @return {Promise} promise of the Entry value\n\
   */\n\
\n\
  function get (key, doUse) {\n\
    return cache\n\
      .get(key)\n\
      .then(function(hit) {\n\
        if (!hit) return;\n\
        if (maxAge && (hit.getAge() > maxAge)) return del(hit);\n\
        if (doUse) use(hit);\n\
        return hit;\n\
      });\n\
  }\n\
\n\
  /**\n\
   * set a value\n\
   *\n\
   * @param {String} key\n\
   * @param {Object} value\n\
   *\n\
   * @return {Promise}\n\
   */\n\
\n\
  this.set = function (key, value) {\n\
    var age = maxAge ? Date.now() : 0,\n\
        len = lengthCalculator(key, value),\n\
        hit = new Entry(key, value, mru++, len, age, true),\n\
        prev = cache.items[key];\n\
\n\
    // oversized objects fall out of cache automatically.\n\
    if (hit.length > max) return Promise.reject(new Error('oversized'));\n\
\n\
    if (prev) {\n\
      length -= prev.length;\n\
      delete cache.items[prev.key];\n\
      delete cache.list[prev.lu];\n\
    }\n\
\n\
    // trim and retry until it works\n\
    function retry() {\n\
      var entry = cache.list[lru];\n\
      if (!entry) throw new Error('fail to set key ' + key);\n\
\n\
      return del(entry).then(function() {\n\
        return cache.set(key, hit);\n\
      });\n\
    }\n\
\n\
    // update cache\n\
    function update() {\n\
      length += hit.length;\n\
      itemCount ++;\n\
      if (length > max) return trim();\n\
      return cache.update();\n\
    }\n\
\n\
    return cache\n\
      .set(key, hit)\n\
      .then(update, retry);\n\
  };\n\
\n\
  /**\n\
   * reset cache\n\
   */\n\
\n\
  this.reset = function () {\n\
    lru = 0;\n\
    mru = 0;\n\
    length = 0;\n\
    itemCount = 0;\n\
    return cache.reset();\n\
  };\n\
\n\
  /**\n\
   * Check if a key is in the cache,\n\
   * without updating the recent-ness or deleting it.\n\
   *\n\
   * @param  {String}  key\n\
   * @return {Boolean}\n\
   */\n\
\n\
  this.has = function (key) {\n\
    if (!cache.has(key)) return false;\n\
    var hit = cache.get(key);\n\
    if (maxAge && (hit.getAge() > maxAge)) return false;\n\
    return true;\n\
  };\n\
\n\
  /**\n\
   * get an entry in the cache\n\
   * update the recent-ness\n\
   *\n\
   * @param  {String} key\n\
   * @return {Entry}\n\
   */\n\
\n\
  this.getEntry = function (key) {\n\
    return get(key, true).then(function(v) {\n\
      if (v) cache.update();\n\
      return v;\n\
    });\n\
  };\n\
\n\
  /**\n\
   * get a key in the cache\n\
   * update the recent-ness\n\
   *\n\
   * @param  {String} key\n\
   * @return {Object}\n\
   */\n\
\n\
  this.get = function (key) {\n\
    return get(key, true).then(function(hit) {\n\
      if (hit) {\n\
        cache.update();\n\
        return hit.value;\n\
      }\n\
    });\n\
  };\n\
\n\
  /**\n\
   * get a key in the cache without updating the recent-ness\n\
   *\n\
   * @param  {String} key\n\
   * @return {Promise}\n\
   */\n\
\n\
  this.peek = function (key) {\n\
    return get(key, false).then(function(hit) {\n\
      if (hit) return hit.value;\n\
    });\n\
  };\n\
\n\
  /**\n\
   * delete a key in the cache\n\
   *\n\
   * @param  {String} key\n\
   * @return {Promise}\n\
   */\n\
\n\
  this.del = function (key) {\n\
    cache.del(key).then(function() {\n\
      cache.update();\n\
    });\n\
  };\n\
\n\
  /**\n\
   * load cache from storage\n\
   *\n\
   * @return {Promise}\n\
   */\n\
\n\
  this.load = function() {\n\
    return Promise\n\
      .race([cache.store.get(), timeout()])\n\
      .then(function(items) {\n\
\n\
        if (!items) return;\n\
\n\
        // init cache items\n\
        items.forEach(function (obj) {\n\
          var entry = new Entry (obj.key, null, obj.lu, obj.length, obj.age);\n\
          entry.length = obj.length;\n\
          cache.items[obj.key] = entry;\n\
          cache.list[entry.lu] = entry;\n\
          length += entry.length;\n\
        });\n\
\n\
        lru = (items[0] && items[0].lu) || 0;\n\
        mru = (items.length && items[items.length - 1].lu) || 0;\n\
        itemCount = items.length;\n\
      });\n\
  };\n\
}\n\
\n\
/*!\n\
 * exports\n\
 */\n\
\n\
module.exports = LRUCache;\n\
\n\
//# sourceURL=index.js"
));

require.modules["lru-cache"] = require.modules["lru-cache"];


require("lru-cache")
