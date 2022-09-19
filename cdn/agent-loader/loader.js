import { BrowserAgent } from "@newrelic/browser-agent-core/common/loader/loader";
import { gosCDN } from "@newrelic/browser-agent-core/common/window/nreum";

new BrowserAgent().start(gosCDN())
