'use strict';

var assert = require('assert');
var Promise = require('promise');
var test = require('./test');
var createTransformer = require('../');

test('render', function () {

test('with tr.render(src, options) => str', function (override) {
  var sentinel = {};
  var localSentinel = {};
  var fnSentinel = {};
  var normalizedSentinel = {};
  override('normalize', function (body) {
    assert(body === fnSentinel);
    return normalizedSentinel;
  });
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    render: function (str, options) {
      assert(str === 'example input');
      assert(options === sentinel);
      return fnSentinel;
    }
  });
  assert(tr.render('example input', sentinel) === normalizedSentinel);
});
test('with tr.compile(src, options) => fn', function (override) {
  var sentinel = {};
  var fnSentinel = {};
  var normalizedSentinel = {};
  override('normalizeFn', function (body) {
    assert(body === fnSentinel);
    return {
      fn: function (locals) {
        return '<br />';
      },
      dependencies: ['example.js']
    };
  });
  override('normalize', function (result) {
    assert.deepEqual(result, {
      body: '<br />',
      dependencies: ['example.js']
    });
    return normalizedSentinel;
  });
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compile: function (str, options) {
      assert(str === 'example input');
      assert(options === sentinel);
      return fnSentinel;
    }
  });
  assert(tr.render('example input', sentinel) === normalizedSentinel);
});
test('render(src, options, locals) - with tr.compile(src, options) => fn', function (override) {
  var nameSentinel = 'jstransformer';
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compile: function (str, options) {
      return function (locals) { return String(locals.name); };
    }
  });
  assert.equal( tr.render( 'example input'
                        , { blah: true }
                        , { name: nameSentinel }).body
              , nameSentinel);
});
test('without any of the above', function () {
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compileAsync: function () {
    }
  });
  assert.throws(function () {
    tr.render('example input', {});
  }, /does not support rendering synchronously/);
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compileFileAsync: function () {
    }
  });
  assert.throws(function () {
    tr.render('example input', {});
  }, /does not support rendering from a string/);
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compileClient: function () {
    }
  });
  assert.throws(function () {
    tr.render('example input', {});
  }, /does not support rendering/);
  assert.throws(function () {
    tr.render('example input', {});
  }, /does not support rendering/);
  var tr = createTransformer({
    name: 'test',
    outputFormat: 'html',
    compile: function () {
      return function () {
        return Promise.resolve('foo');
      };
    }
  });
  assert.throws(function () {
    tr.render('example input', {});
  }, /does not support rendering synchronously/);
});

});
