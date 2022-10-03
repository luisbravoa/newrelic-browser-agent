/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from '../utils/setup'
import { getRuntime } from '../../common/config/config'
import { drain } from '../../common/drain/drain'
import { initializeAPI } from '../../../../cdn/agent-aggregator/util/api.js'
import { Instrument as MetricsInstrum } from '../../features/metrics/instrument/index'
import { Aggregate as MetricsAggreg } from '../../features/metrics/aggregate/index'

const { aggregator: agg, agentIdentifier, nr } = setup();
// api loads registers several event listeners, but does not have any exports
initializeAPI(agentIdentifier);   // maps finished() which handles 'record-custom'
new MetricsInstrum(agentIdentifier);  // registers 'record-custom' which handles 'storeEventMetrics'
new MetricsAggreg(agentIdentifier, agg); // registers 'storeEventMetrics'

describe('api', () => {
  test('api test', function (done) {
    expect(getRuntime(agentIdentifier).customTransaction).toBeUndefined()
    nr.setPageViewName('bar/baz')
    drain(agentIdentifier, 'api')
    drain(agentIdentifier) // drains 'feature' bucket too
    expect(getRuntime(agentIdentifier).customTransaction).toEqual('http://custom.transaction/bar/baz')
  
    setTimeout(() => {
      nr.finished()
      nr.finished()
      nr.finished()
  
      nr.noticeError(new Error('test'))
  
      var finishedTime = 0
      var cm
  
      try {
        var aggs = agg.take(['cm'])
        cm = aggs.cm
        finishedTime = cm[0].metrics.time.t
      } catch (e) {}
  
      expect(finishedTime).toBeGreaterThan(0)
      expect(cm[1]).toBeUndefined()
  
      nr.finished()
  
      expect(agg.take(['cm'])).toBeNull()
      done()
    }, 100)
  })
})

