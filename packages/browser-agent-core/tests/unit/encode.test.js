/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as encode from '../../common/url/encode'

test('encode.qs', function (done) {
  expect(encode.qs('Asdf:, :, /@$;')).toEqual('Asdf:,%20:,%20/@$;')
  expect(encode.qs()).toEqual('null')
  expect(encode.qs(undefined)).toEqual( 'null')
  expect(encode.qs(null)).toEqual( 'null')
  done()
})

test('encode.fromArray', function (done) {
  var absurdTest = ['a', 'b', 'c']
  expect(encode.fromArray(absurdTest, 2)).toEqual( 'ab')
  var doubleTest = ['aa', 'bb', 'cc']
  expect(encode.fromArray(doubleTest, 5)).toEqual( 'aabb')
  done()
})

test('encode.obj', function (done) {
  var obj1 = {foo: [1, 2, 3]}
  expect(encode.obj(obj1, 12)).toEqual( '&foo=%5B1,2%5D')

  var obj2 = {bar: ['a', 'b', 'c']}
  expect(encode.obj(obj2, 30)).toEqual( '&bar=%5B%22a%22,%22b%22%5D')

  var circular = {}
  circular.circular = circular
  var obj3 = {bar: ['a', circular, 'c']}
  expect(encode.obj(obj3, 1000)).toEqual( '&bar=%5B%22a%22,null,%22c%22%5D')

  done()
})

test('encode.param', function (done) {
  expect(encode.param('foo', null)).toEqual( '')
  expect(encode.param('foo', 'bar')).toEqual( '&foo=bar')
  expect(encode.param('foo', {})).toEqual( '')
  done()
})
