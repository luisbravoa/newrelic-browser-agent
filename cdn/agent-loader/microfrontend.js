import { BrowserAgent } from "@newrelic/browser-agent-microfrontend/src";
import { gosCDN } from '@newrelic/browser-agent-core/src/common/window/nreum'

const nr = gosCDN()
nr.mfeLoader = BrowserAgent