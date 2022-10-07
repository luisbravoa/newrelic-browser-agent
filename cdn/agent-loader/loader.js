import { BrowserAgent } from "@newrelic/browser-agent-core/common/loader/loader";
import { gosCDN } from "@newrelic/browser-agent-core/common/window/nreum";

const ba = new BrowserAgent()
ba.start(gosCDN()).then(initialized => {

    console.log("ba", ba)
})

