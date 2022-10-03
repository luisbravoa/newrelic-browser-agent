/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'

import {setup} from '../utils/setup'
import {drain} from '../../common/drain/drain'
import {handle} from '../../common/event-emitter/handle'
import {setConfiguration} from "../../common/config/state/init"
import {Aggregate as PvtAggregate} from '../../features/page-view-timing/aggregate/index'

const {agentIdentifier, aggregator} = setup()

test('LCP is not collected on unload when the LCP value occurs after max timeout', done => {
  setConfiguration(agentIdentifier, { page_view_timing: {maxLCPTimeSeconds: 0.5} })

  const pvtAgg = new PvtAggregate(agentIdentifier, aggregator)

  // override harvest calls, so that no network calls are made
  pvtAgg.scheduler.harvest.send = function() {
    return {}
  }

  // prevent prepareHarvest from clearing timings
  pvtAgg.prepareHarvest = function() {
    return {}
  }

  // drain adds `timing` and `lcp` event listeners in the agent/timings module
  drain(agentIdentifier, 'feature')

  setTimeout(function() {
    // simulate LCP observed
    handle('lcp', [{ size: 1, startTime: 1 }], undefined, undefined, pvtAgg.ee)

    // invoke final harvest, which includes harvesting LCP
    pvtAgg.finalHarvest()

    t.equals(pvtAgg.timings.length, 2, 'there should be only 2 timings (pageHide and unload)')
    t.ok(pvtAgg.timings[0].name === 'pageHide', 'should have pageHide timing')
    t.ok(pvtAgg.timings[1].name === 'unload', 'should have unload timing')

    done()
  }, 1000)
})
