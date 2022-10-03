/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { setup } from '../utils/setup'
import { drain } from '../../common/drain/drain'
import { Aggregate } from '../../features/page-action/aggregate'

const { agentIdentifier, baseEE, aggregator } = setup()
new Aggregate(agentIdentifier, aggregator)

test('parameters not modified', done => {
  let name = 'MyEvent'
  let args = {
    foo: 'bar',
    hello: { world: 'again' }
  }

  baseEE.emit('feat-ins', [])
  drain(agentIdentifier, 'feature')
  baseEE.emit('api-addPageAction', [t, name, args])

  t.deepEqual(args, {
    foo: 'bar',
    hello: { world: 'again' }
  })

  done()
})
