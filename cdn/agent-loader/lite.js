import {BrowserAgent} from "@newrelic/browser-agent/src/custom-loader";

import { Instrument as InstrumentPageViewEvent } from '@newrelic/browser-agent-core/src/features/page_view_event/instrument'
import { Instrument as InstrumentPageViewTiming } from '@newrelic/browser-agent-core/src/features/page_view_timing/instrument'

const agent = new BrowserAgent({
    features: [
        InstrumentPageViewEvent,
        InstrumentPageViewTiming
    ]
})
