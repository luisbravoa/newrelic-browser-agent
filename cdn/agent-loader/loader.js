/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// polyfills
// import 'core-js/actual/promise'
// import 'core-js/actual/array/includes'
// import 'core-js/actual/object/assign'
// import 'core-js/actual/object/entries'
/* cdn specific utility files */
// import { stageAggregator } from './utils/importAggregator'
import agentIdentifier from '../shared/agentIdentifier'
/* feature modules */
// import { Instrument as InstrumentPageViewTiming } from '@newrelic/browser-agent-core/features/page-view-timing/instrument'
// import { Instrument as InstrumentMetrics } from '@newrelic/browser-agent-core/features/metrics/instrument'
// import { Instrument as InstrumentErrors } from '@newrelic/browser-agent-core/features/jserrors/instrument'
// import { Instrument as InstrumentXhr } from '@newrelic/browser-agent-core/features/ajax/instrument'
// import { Instrument as InstrumentSessionTrace } from '@newrelic/browser-agent-core/features/session-trace/instrument'
// import { Instrument as InstrumentPageAction } from '@newrelic/browser-agent-core/features/page-action/instrument'
// import { Instrument as InstrumentSpa } from '@newrelic/browser-agent-core/features/spa/instrument'
// common modules
import { getEnabledFeatures } from '@newrelic/browser-agent-core/common/util/enabled-features'
import { configure } from './utils/configure'
import { Aggregator } from '@newrelic/browser-agent-core/common/aggregate/aggregator'
import { initializeAPI } from '../agent-aggregator/util/api'
import { addToNREUM } from '@newrelic/browser-agent-core/common/window/nreum'
import { activateFeatures } from '@newrelic/browser-agent-core/common/util/feature-flags'

// set up the NREUM, api, and internal configs
configure().then(async () => {
    const sharedAggregator = new Aggregator({ agentIdentifier })
    initializeAPI(agentIdentifier)
    // Features are activated using the legacy setToken function name via JSONP
    addToNREUM('setToken', (flags) => activateFeatures(flags, agentIdentifier))
    const enabledFeatures = getEnabledFeatures(agentIdentifier)
    // lite features
    if (enabledFeatures['page_view_event']) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/page-view-event/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics)
    }
    if (enabledFeatures['page_view_timing']) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/page-view-timing/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) // page view timings instrumentation (/loader/timings.js)
    }
    if (enabledFeatures.metrics) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/metrics/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // supportability & custom metrics
    }
    // pro features
    if (enabledFeatures.jserrors) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/jserrors/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // errors
    }
    if (enabledFeatures.ajax) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/ajax/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // ajax
    }
    if (enabledFeatures['session_trace']) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/session-trace/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // session traces
    }
    if (enabledFeatures['page_action']) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/page-action/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // ins (apis)
    }
    // instantiate auto-instrumentation specific to this loader...
    if (enabledFeatures.spa) {
        const { Instrument } = await import('@newrelic/browser-agent-core/features/spa/instrument')
        new Instrument(agentIdentifier, sharedAggregator) // document load (page view event + metrics) } // spa
    }
    // imports the aggregator for 'lite' if no other aggregator takes precedence
    // stageAggregator('spa')
})