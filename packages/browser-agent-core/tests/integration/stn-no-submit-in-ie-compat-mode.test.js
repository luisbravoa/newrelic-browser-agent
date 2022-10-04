/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { setup } from '../utils/setup'
import '../../common/browser-version/ie-version'
import { Aggregate as StnAggregate } from '../../features/session-trace/aggregate/index'
import { drain } from '../../common/drain/drain'
import { getRuntime } from '../../common/config/config'

const setupData = setup()
const { agentIdentifier, aggregator  } = setupData
getRuntime(agentIdentifier).features.stn = true

var stnAgg = new StnAggregate(agentIdentifier, aggregator)

test('stn aggregator does nothing in ie compatability mode', done => {
  drain(agentIdentifier, 'feature')

  // When a user is running >= IE10 in compatibility mode
  // with standards <= IE9, we should not submit session trace
  // data. The agent avoids submission by bailing out of the
  // STN aggregation code. When the aggregator is required
  // under these circumstances, it will return an empty object
  t.deepEqual(stnAgg.trace, {})
  done()
})
