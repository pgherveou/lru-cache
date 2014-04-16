/* global DOMException: true, it: true, describe:true, before: true, afterEach: true, it:true */

var LRU = require('lru-cache'),
    lf = require('localforage'),
    Promise = window.Promise,
    chai = require('chai'),
    expect = chai.expect;

lf.setDriver('localStorageWrapper');

/**
 * wait closure
 *
 * @param  {Number} time
 *
 * @return Promise
 */

function wait(time) {
  return function() {
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
  };
}

afterEach(function () {
  return lf.clear();
});

describe('basic tests', function () {

  it('basic', function () {
    var cache = new LRU();

    var p1 = cache
      .set('key', 'value')
      .then(function() {
        return cache.get('key');
      })
      .then(function(val) {
        expect(val).to.eq('value');
      });

    var p2 = cache
      .get('nada')
      .then(function(val) {
        expect(val).to.be.undefined;
      });

    return Promise
      .all([p1, p2])
      .then(function() {
        expect(cache.length).to.eq(1);
      });
  });

  it('least recently set', function () {
    var cache = new LRU(2);

    return Promise.resolve()
      .then(function() { return cache.set('a', 'A'); })
      .then(function() { return cache.set('b', 'B'); })
      .then(function() { return cache.set('c', 'C'); })

      .then(function() { return cache.get('c'); })
      .then(function(v) { expect(v).to.eq('C'); })

      .then(function() { return cache.get('b'); })
      .then(function(v) { expect(v).to.eq('B'); })

      .then(function() { return cache.get('a'); })
      .then(function(v) { expect(v).to.be.undefined; });
  });

  it('lru recently gotten', function () {
    var cache = new LRU(2);

    return Promise.resolve()
      .then(function() { return cache.set('a', 'A'); })
      .then(function() { return cache.set('b', 'B'); })
      .then(function() { return cache.get('a'); })
      .then(function() { return cache.set('c', 'C'); })

      .then(function() { return cache.get('c'); })
      .then(function(v) { expect(v).to.eq('C'); })

      .then(function() { return cache.get('b'); })
      .then(function(v) { expect(v).to.be.undefined; })

      .then(function() { return cache.get('a'); })
      .then(function(v) { expect(v).to.eq('A'); });
  });

  it('del', function () {
    var cache = new LRU();

    return Promise
      .resolve()
      .then(function() { return cache.set('a', 'A'); })
      .then(function() { return cache.del('a'); })
      .then(function() { return cache.get('a'); })
      .then(function(v) { expect(v).to.be.undefined; });
  });

  it('reset', function () {
    var cache = new LRU(10);

    return Promise
      .resolve()
      .then(function() { return cache.set('a', 'A'); })
      .then(function() { return cache.set('b', 'B'); })
      .then(function() { return cache.reset(); })
      .then(function() { expect(cache.length).to.eq(0); })

      .then(function() { return cache.get('a'); })
      .then(function(v) { expect(v).to.be.undefined; })

      .then(function() { return cache.get('b'); })
      .then(function(v) { expect(v).to.be.undefined; });
  });

  it('item too large', function () {
    var cache = new LRU({
      max: 10,
      length: function strLength(key, value) {
        return key.length + value.length;
      }
    });

    return Promise
      .resolve()
      .then(function() { return cache.set('key', 'I am too big to fit!!!'); })
      .catch(function(err) { expect(err.message).to.eq('oversized'); })
      .then(function() { return cache.get('key'); })
      .then(function(v) {
        expect(v).to.be.undefined;
        expect(cache.length).to.eq(0);
      });
  });

  it('drop the old items', function() {
    var cache = new LRU({ maxAge: 300 });

    return Promise
      .resolve()
      .then(function() { return cache.set('a', 'A'); })
      .then(wait(200))
      .then(function() { return cache.get('a'); })
      .then(function(v) { return expect(v).to.eq('A'); })
      .then(wait(400))
      .then(function() { return cache.get('a'); })
      .then(function(v) { return expect(v).to.be.undefined; });
  });

  it('lru update via set', function() {
    var cache = LRU({ max: 2 });

    return Promise
      .resolve()
      .then( function() { return cache.set('foo', 1); })
      .then( function() { return cache.set('bar', 2); })
      .then( function() { return cache.del('bar'); })
      .then( function() { return cache.set('baz', 3); })
      .then( function() { return cache.set('quz', 4); })

      .then( function() { return cache.get('foo'); })
      .then( function(v) { expect(v).to.be.undefined; })

      .then( function() { return cache.get('bar'); })
      .then( function(v) { expect(v).to.be.undefined; })

      .then( function() { return cache.get('baz'); })
      .then( function(v) { expect(v).to.eq(3); })

      .then( function() { return cache.get('quz'); })
      .then( function(v) { expect(v).to.eq(4); });
  });

  it('least recently set w/ peek', function () {
    var cache = LRU({ max: 2 });

    return Promise
      .resolve()
      .then( function() { return cache.set('a', 'A'); })
      .then( function() { return cache.set('b', 'B'); })

      .then( function() { return cache.peek('a'); })
      .then( function(v) { expect(v).to.eq('A'); })

      .then( function() { return cache.set('c', 'C'); })
      .then( function() { return cache.get('c'); })
      .then( function(v) { expect(v).to.eq('C'); })

      .then( function() { return cache.get('b'); })
      .then( function(v) { expect(v).to.eq('B'); })

      .then( function() { return cache.get('a'); })
      .then( function(v) { expect(v).to.be.undefined; });
  });

  it('should delete stuff when ls quotas reached', function () {
    var cache = LRU({ max: Math.Infinity }),
        bigString = '',
        i = 0;

    for (var j = 0 ; j <= 1000000; j++) bigString += j%9;

    return Promise
      .resolve()
      .then(function() { return cache.set('first', 'smallstring'); })

      // store stuff in ls until it fails
      .then(function() {
        while (!localStorage.setItem(i, bigString)) i++;
      })

      .then(function() {
        return cache.set('one-more', bigString);
      })

      .catch(function(err) {
        expect(err.code).to.eq(DOMException.QUOTA_EXCEEDED_ERR);
      })

      // make some space in ls and try again
      .then(function() {
        localStorage.removeItem(0);
        return cache.set('one-more', bigString);
      })

      .then(function() { return cache.get('one-more'); })
      .then(function(v) { expect(v).to.eq(bigString); });
  });

  it('keys()', function () {
    var cache = new LRU({ max: 5 });

    var promises =[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(i) {
      return cache.set(i.toString(), i.toString(2));
    });

    return Promise
      .all(promises)
      .then(function() {
        expect(cache.keys()).to.deep.eq(['9', '8', '7', '6', '5']);
      })

      // get in order of most recently used
      .then(function() { return cache.get(6); })
      .then(function() { return cache.get(8); })
      .then(function() {
        expect(cache.keys()).to.deep.eq(['8', '6', '9', '7', '5']);
      });

  });

});

describe('when reloading', function () {

  before(function() {
    var cache = new LRU();
    return cache.set('key', 'value');
  });

  it('should retrieve existing values', function () {
    var cache = new LRU();

    return cache
      .load()
      .then(function() {
        return cache.getEntry('key');
      })
      .then(function(hit) {
        expect(hit.key).to.eq('key');
        expect(hit.value).to.eq('value');
        expect(hit.lu).to.eq(0);
        expect(hit.age).to.eq(0);
        expect(cache.length).to.eq(1);
      });
  });




});

