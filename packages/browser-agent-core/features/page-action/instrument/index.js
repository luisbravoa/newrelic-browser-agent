/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getRuntime } from '../../../common/config/config'
import { InstrumentBase } from '../../../common/util/feature-base'

export class Instrument extends InstrumentBase {
  constructor(agentIdentifier, aggregator) {
    super(agentIdentifier, aggregator, 'page-action')
    const agentRuntime = getRuntime(this.agentIdentifier)
    // Turn on feature
    agentRuntime.features.ins = true

    this.importAggregator()
  }
}
