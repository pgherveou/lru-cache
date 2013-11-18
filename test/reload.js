/* global describe:true, it:true, beforeEach: true */

var LRU = require('lru-cache'),
    chai = require('chai'),
    expect = chai.expect;

function calcLength(key ,val) {
  return key.length + (JSON.stringify(val)).length;
}

describe('reload tests', function () {

  beforeEach(function () {
    window.localStorage.clear();
  });

  it('basic', function () {
    // set a value
    var cache = new LRU(calcLength('key', 'value'));
    cache.set('key', 'value');

    // recreate cache with ls
    cache = new LRU(calcLength('key', 'value'));

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

    // recreate cache with ls
    cache = new LRU(2 * calcLength('a', 'A'));

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

    // recreate cache with ls
    cache = new LRU(2 * calcLength('a', 'A'));

    expect(cache.get('c')).to.eq('C');
    expect(cache.get('b')).to.be.undefined;
    expect(cache.get('a')).to.eq('A');
  });

});

