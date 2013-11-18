/* global describe:true, beforeEach: true, it:true */

var LRU = require('lru-cache'),
    chai = require('chai'),
    expect = chai.expect;

function calcLength(key ,val) {
  return key.length + (JSON.stringify(val)).length;
}


describe('basic tests', function () {

  beforeEach(function () {
    window.localStorage.clear();
  });

  it('basic', function () {
    var cache = new LRU(calcLength('key', 'value'));
    cache.set('key', 'value');
    expect(cache.get('key')).to.eq('value');
    expect(cache.get('nada')).to.be.undefined;
    expect(cache.length).to.eq(calcLength('key', 'value'));
    expect(cache.max).to.eq(10);
  });

  it('least recently set', function () {
    var cache = new LRU(2 * calcLength('a', 'A'));
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');
    expect(cache.get('c')).to.eq('C');
    expect(cache.get('b')).to.eq('B');
    expect(cache.get('a')).to.be.undefined;
  });

  it('lru recently gotten', function () {
    var cache = new LRU(2 * calcLength('a', 'A'));
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.get('a');
    cache.set('c', 'C');
    expect(cache.get('c')).to.eq('C');
    expect(cache.get('b')).to.be.undefined;
    expect(cache.get('a')).to.eq('A');
  });

  it('del', function () {
    var cache = new LRU();
    cache.set('a', 'A');
    cache.del('a');
    expect(cache.get('a')).to.be.undefined;
  });

  it('reset', function () {
    var cache = new LRU(10 * calcLength('a', 'A'));
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.reset();
    expect(cache.length).to.eq(0);
    expect(cache.max).to.eq(10 * calcLength('a', 'A'));
    expect(cache.get('a')).to.be.undefined;
    expect(cache.get('b')).to.be.undefined;
  });


  // Note: `<cache>.dump()` is a debugging tool only. No guarantees are made
  // about the format/layout of the response.
  it('dump', function () {
    var cache = new LRU(10 * calcLength('a', 'A'));
    var d = cache.dump();
    expect(Object.keys(d).length).to.eq(0);
    cache.set('a', 'A');
    d = cache.dump();  // { a: { key: 'a', value: 'A', lu: 0 } }
    expect(d.a).to.be.ok;
    expect(d.a.key).to.eq('a');
    expect(d.a.value).to.eq('A');
    expect(d.a.lu).to.eq(0);

    cache.set('b', 'B');
    cache.get('b');
    d = cache.dump();
    expect(d.b).to.be.ok;
    expect(d.b.key).to.eq('b');
    expect(d.b.value).to.eq('B');
    expect(d.b.lu).to.eq(2);

  });

  it('weighed length item too large', function () {
    var cache = new LRU(10 * calcLength('a', 'A'));

    expect(cache.max).to.eq(10 * calcLength('a', 'A'));

    // should fall out immediately
    cache.set('key', {val: 'way to big to fit in the store'});

    expect(cache.length).to.eq(0);
    expect(cache.get('key')).to.be.undefined;
  });

  it('least recently set', function () {
    var cache = new LRU(calcLength('a', 'DDDD') + calcLength('a', 'CCC'));
    cache.set('a', 'A');
    cache.set('b', 'BB');
    cache.set('c', 'CCC');
    cache.set('d', 'DDDD');
    expect(cache.get('d')).to.eq('DDDD');
    expect(cache.get('c')).to.eq('CCC');
    expect(cache.get('b')).to.be.undefined;
    expect(cache.get('a')).to.be.undefined;
  });

  it('lru recently gotten', function () {
    var max = calcLength('a', 'A') + calcLength('b', 'BB') + calcLength('d', 'DDDD'),
        cache = new LRU(max);

    cache.set('a', 'A');
    cache.set('b', 'BB');
    cache.set('c', 'CCC');
    cache.get('a');
    cache.get('b');
    cache.set('d', 'DDDD');
    expect(cache.get('c')).to.be.undefined;
    expect(cache.get('d')).to.eq('DDDD');
    expect(cache.get('b')).to.eq('BB');
    expect(cache.get('a')).to.eq('A');
  });

  it('set returns proper booleans', function() {
    var cache = new LRU(calcLength('c', 'CCCC'));

    expect(cache.set('a', 'A')).to.be.ok;

    // should return false for max exceeded
    expect(cache.set('b', 'donuts')).to.not.be.ok;

    expect(cache.set('b', 'B')).to.be.ok;
    expect(cache.set('c', 'CCCC')).to.be.ok;
  });

  it('drop the old items', function(done) {
    this.timeout(2000);

    var cache = new LRU({
      max: 5 * calcLength('a', 'A'),
      maxAge: 250
    });

    cache.set('a', 'A');

    setTimeout(function () {
      cache.set('b', 'b');
      expect(cache.get('a')).to.eq('A');
    }, 100);

    setTimeout(function () {
      cache.set('c', 'C');
      expect(cache.get('a')).to.not.be.ok;
    }, 400);

    setTimeout(function () {
      expect(cache.get('b')).to.not.be.ok;
      expect(cache.get('c')).to.eq('C');
    }, 500);

    setTimeout(function () {
      expect(cache.get('c')).to.not.be.ok;
      done();
    }, 700);
  });

  it('lru update via set', function() {
    var cache = LRU({ max: 2 * calcLength('foo', 1) });

    cache.set('foo', 1);
    cache.set('bar', 2);
    cache.del('bar');
    cache.set('baz', 3);
    cache.set('qux', 4);

    expect(cache.get('foo')).to.be.undefined;
    expect(cache.get('bar')).to.be.undefined;
    expect(cache.get('baz')).to.eq(3);
    expect(cache.get('qux')).to.eq(4);
  });

  it('least recently set w/ peek', function () {
    var cache = LRU({ max: 2 * calcLength('a', 'A') });
    cache.set('a', 'A');
    cache.set('b', 'B');
    expect(cache.peek('a')).to.eq('A');
    cache.set('c', 'C');
    expect(cache.get('c')).to.eq('C');
    expect(cache.get('b')).to.eq('B');
    expect(cache.get('a')).to.be.undefined;
  });

  it('should return false when we reach ls max size', function (done) {
    var cache = LRU(),
        bigString = '',
        i = 0;
    for (var j = 0 ; j <= 1000000; j++) bigString += j%9;

    while (cache.set(i, bigString)) i++;
    cache.set('last', 'smallstring');
    expect(cache.get(i-1)).to.be.ok;
    expect(cache.get(i)).to.be.ko;
    expect(cache.get('last')).to.be.ok;
    done();
  });

});
