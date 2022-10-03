/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {setup} from '../utils/setup'
import {drain} from '../../common/drain/drain'
import {registerHandler as register} from '../../common/event-emitter/register-handler'

const {baseEE, agentIdentifier} = setup()

describe('drain', () => {

  let eventId = 0
  let bufferId = 0

  test('unbuffered handlers', function (done) {
    let ee = baseEE.get('unbuffered')
    let eventName = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++
    let ctx = ee.context()
    let args = [1, 2, 3]
    let step = 0

    ee.buffer([eventName], bufferName)

    baseEE.on(eventName, function () {
      expect(step++).toEqual(0)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    ee.on(eventName, function () {
      expect(step++).toEqual(1)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    ee.emit(eventName, args, ctx)

    register(eventName, function () {
      jest.fail('should not be called')
      done()
    }, bufferName, baseEE)

    register(eventName, function () {
      expect(step++).toEqual(3)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, ee)

    register(eventName, function () {
      jest.fail('should not be called')
      done()
    }, 'otherGroup', ee)

    expect(step++).toEqual(2)

    drain(agentIdentifier, bufferName)

    expect(step++).toEqual(4)
    done()
  })

  test('unbuffered handlers, early register', function (done) {
    let ee = baseEE.get('early register')
    let eventName = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++
    let ctx = ee.context()
    let args = [1, 2, 3]
    let step = 0

    ee.buffer([eventName], bufferName)

    baseEE.on(eventName, function () {
      expect(step++).toEqual(0)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    ee.on(eventName, function () {
      expect(step++).toEqual(1)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    register(eventName, function () {
      jest.fail('should not be called')
      done()
    }, bufferName, baseEE)

    register(eventName, function () {
      expect(step++).toEqual(3)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, ee)

    register(eventName, function () {
      jest.fail('should not be called')
      done()
    }, 'otherGroup', ee)

    ee.emit(eventName, args, ctx)
    expect(step++).toEqual(2)

    drain(agentIdentifier, bufferName)
    expect(step++).toEqual(4)
    done()
  })

  test('unbuffered handlers, emit after drain', function (done) {
    let ee = baseEE.get('after drain')
    let eventName = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++
    let ctx = ee.context()
    let args = [1, 2, 3]
    let step = 0

    ee.buffer([eventName], bufferName)

    baseEE.on(eventName, function () {
      expect(step++).toEqual(0)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    ee.on(eventName, function () {
      expect(step++).toEqual(2)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    })

    register(eventName, function () {
      expect(step++).toEqual(1)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, baseEE)

    register(eventName, function () {
      expect(step++).toEqual(3)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, ee)

    register(eventName, function () {
      jest.fail('should not be called')
      done()
    }, 'otherGroup', ee)

    drain(agentIdentifier, bufferName)
    ee.emit(eventName, args, ctx)
    expect(step++).toEqual(4)
    done()
  })

  test('emit buffered event in buffered handler', function (done) {
    let ee = baseEE.get('emit while draining')
    let eventName = 'event_' + eventId++
    let otherEvent = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++
    let ctx = ee.context()
    let args = [1, 2, 3]
    let step = 0
    let otherCount = 0

    ee.buffer([eventName], bufferName)
    ee.buffer([otherEvent], bufferName)

    register(eventName, function () {
      expect(step++).toEqual(1)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
      ee.emit(otherEvent, [123], ctx)
    }, bufferName, ee)

    register(otherEvent, function () {
      switch (otherCount++) {
        case 0:
          expect(step++).toEqual(2)
          expect(this).toEqual(ctx)
          expect(Array.prototype.slice.call(arguments)).toEqual(args)
          break
        case 1:
          expect(step++).toEqual(3)
          expect(this).toEqual(ctx)
          expect(Array.prototype.slice.call(arguments)).toEqual([123])
          break
        default:
          jest.fail('should only be called twice')
          done()
      }
    }, bufferName, ee)

    ee.emit(eventName, args, ctx)
    ee.emit(otherEvent, args, ctx)

    expect(step++).toEqual(0)
    drain(agentIdentifier, bufferName)
    expect(step++).toEqual(4)
    done()
  })

  test('emit buffered event in unbuffered handler', function (done) {
    let ee = baseEE.get('emit buffered event in unbuffered handler')
    let eventName = 'event_' + eventId++
    let otherEvent = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++
    let ctx = ee.context()
    let args = [1, 2, 3]
    let step = 0

    ee.buffer([eventName, otherEvent], bufferName)

    register(eventName, function () {
      expect(step++).toEqual(2)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, ee)

    register(otherEvent, function () {
      expect(step++).toEqual(1)
      expect(this).toEqual(ctx)
      expect(Array.prototype.slice.call(arguments)).toEqual(args)
    }, bufferName, ee)

    ee.on(eventName, function () {
      ee.emit(otherEvent, args, ctx)
    })

    ee.emit(eventName, args, ctx)

    expect(step++).toEqual(0)
    drain(agentIdentifier, bufferName)
    expect(step++).toEqual(3)
    done()
  })

  test('does not resume buffering after drain', function (done) {
    let ee = baseEE.get('no buffer after drain')
    let eventName = 'event_' + eventId++
    let bufferName = 'buffer_' + bufferId++

    ee.buffer([eventName], bufferName)
    ee.emit(eventName)
    expect(baseEE.backlog[bufferName].length).toEqual(1)
    drain(agentIdentifier, bufferName)
    ee.buffer([eventName], bufferName)
    ee.emit(eventName)
    expect(baseEE.backlog[bufferName]).toBeNull()
    done()
  })
})
