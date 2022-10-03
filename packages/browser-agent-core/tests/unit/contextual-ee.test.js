/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {ee} from '../../common/event-emitter/contextual-ee'

test('Contextual EE', function (done) {
  ee.on('args-test', function (a, b, c) {
    expect(a).toEqual('a')
    expect(b).toEqual('b')
    expect(c).toEqual('c')
  })
  ee.on('context-test-a', function () {
    this.foo = 'foo'
  })
  ee.on('context-test-b', function () {
    expect(this.foo).toEqual('foo')
  })

  ee.on('multiple-handlers', function () {
    this.count = 1
  })
  ee.on('multiple-handlers', function () {
    this.count += 1
  })
  ee.on('multiple-handlers', function () {
    expect(this.count).toEqual(2)
  })

  ee.emit('args-test', [ 'a', 'b', 'c' ])

  var fooObj = {}
  var aContext = ee.emit('context-test-a', [], fooObj)
  var bContext = ee.emit('context-test-b', [], fooObj)

  // context object returned
  expect(aContext.foo).toEqual('foo')
  // reused objects have the same context
  expect(aContext).toEqual(bContext)
  // Context saved with expected key
  expect(fooObj['nr@context']).toEqual(aContext)

  ee.emit('multiple-handlers', [], {})
  done()
})

test('ee.abort condition met', function (done) {
  ee.aborted = false
  ee.backlog.api = ['foo', 'bar', 'baz']
  ee.backlog.feature = null
  ee.abort()

  expect(ee.aborted).toBeTruthy()
  done()
})

test('ee.abort condition not met', function (done) {
  ee.aborted = false
  ee.backlog.api = null
  ee.backlog.feature = null
  ee.abort()

  expect(ee.aborted).toBeFalsy()
  done()
})

test('EE clears eventBuffer (ee.backlog) after abort', function (done) {
  ee.aborted = false
  if (ee.backlog) {
    delete ee.backlog.feature
  }

  ee.buffer(['eventType'], 'feature')

  // feature backlog is an array
  expect(ee.backlog.feature instanceof Array).toBeTruthy()
  // feature backlog is an empty array
  expect(ee.backlog.feature.length).toEqual(0)

  ee.emit('eventType', [], {})

  // emitted event was buffered
  expect(ee.backlog.feature.length).toEqual(1)

  ee.abort()

  // EE backlog was cleared after abort
  expect(Object.keys(ee.backlog).length).toEqual(0)
  done()
})

test('Forced EE does not buffer events after it has been aborted', function (done) {
  ee.aborted = false
  if (ee.backlog) {
    delete ee.backlog.feature
  }

  ee.buffer(['eventType'], 'feature')
  ee.abort()

  ee.buffer(['eventType'], 'feature')
  ee.emit('eventType', [], {}, true)

  // emitted event was not buffered after ee.abort
  expect(Object.keys(ee.backlog).length).toEqual(0)
  done()
})
