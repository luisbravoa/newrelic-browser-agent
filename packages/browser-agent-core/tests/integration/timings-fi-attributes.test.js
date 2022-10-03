/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import {setup} from '../utils/setup'
import {drain} from '../../common/drain/drain'
import {handle} from '../../common/event-emitter/handle'
import {Aggregate as PvtAggregate} from '../../features/page-view-timing/aggregate/index'

const {agentIdentifier, aggregator} = setup()

test('sends expected attributes when available', done => {
  const pvtAgg = new PvtAggregate(agentIdentifier, aggregator)

  // override harvest calls, so that no network calls are made
  pvtAgg.scheduler.harvest.send = function() {
    return {}
  }

  // prevent prepareHarvest from clearing timings
  pvtAgg.prepareHarvest = function() {
    return {}
  }

  // drain adds `timing` event listener in the agent/timings module
  drain(agentIdentifier, 'feature')

  var firstInteraction = 1234

  var attributes = {
    type: 'pointerdown',
    fid: 5,
    'net-type': 'cellular',
    'net-etype': '3g',
    'net-rtt': 270,
    'net-dlink': 700
  }

  // simulate first interaction observed
  handle('timing', ['fi', firstInteraction, attributes], undefined, undefined, pvtAgg.ee)

  t.equals(pvtAgg.timings.length, 1, 'there should be only 1 timing (firstInteraction)')
  t.ok(pvtAgg.timings[0].name === 'fi', 'fi should be present')

  const payload = pvtAgg.timings[0].attrs
  t.equal(payload.type, attributes.type, 'interactionType should be present')
  t.equal(payload.fid, attributes.fid, 'fid should be present')
  t.equal(payload['net-type'], attributes['net-type'], 'network type should be present')
  t.equal(payload['net-etype'], attributes['net-etype'], 'network effectiveType should be present')
  t.equal(payload['net-rtt'], attributes['net-rtt'], 'network rtt should be present')
  t.equal(payload['net-dlink'], attributes['net-dlink'], 'network downlink should be present')

  done()
})
