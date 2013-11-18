/* global describe:true, it:true, beforeEach: true */

var LRU = require('lru-cache'),
    chai = require('chai'),
    expect = chai.expect;

function calcLength(key ,val) {
  return key.length + (JSON.stringify(val)).length;
}


describe('foreach tests', function () {

  beforeEach(function () {
    window.localStorage.clear();
  });

  it('forEach', function () {
    var l = new LRU(9 * calcLength('1', '1'));
    var i;

    for (i = 0; i < 10; i ++) {
      l.set(i.toString(), i.toString(2));
    }

    i = 9;
    l.forEach(function (val, key, cache) {
      expect(cache).to.eq(l);
      expect(key).to.eq(i.toString());
      expect(val).to.eq(i.toString(2));
      i -= 1;
    });

    // get in order of most recently used
    l.get(6);
    l.get(8);

    var order = [ 8, 6, 9, 7, 5 ];
    i = 0;

    l.forEach(function (val, key, cache) {
      var j = order[i ++];
      expect(cache).to.eq(l);
      expect(key).to.eq(j.toString());
      expect(val).to.eq(j.toString(2));
    });

  });

  it('keys() and values()', function () {

    var max = calcLength('1', '1001')
            + calcLength('2', '1000')
            + calcLength('3', '111')
            + calcLength('4', '110')
            + calcLength('5', '101');

    var l = new LRU(max);
    for (var i = 0; i < 10; i ++) {
      l.set(i.toString(), i.toString(2));
    }

    expect(l.keys()).to.deep.eq(['9', '8', '7', '6', '5']);
    expect(l.values()).to.deep.eq(['1001', '1000', '111', '110', '101']);

    // get in order of most recently used
    l.get(6);
    l.get(8);

    expect(l.keys()).to.deep.eq(['8', '6', '9', '7', '5']);
    expect(l.values()).to.deep.eq(['1000', '110', '1001', '111', '101']);

  });
});

