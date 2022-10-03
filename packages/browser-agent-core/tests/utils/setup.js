import { setInfo, setLoaderConfig, setConfiguration, setRuntime } from '../../common/config/config'
import { gosCDN, addToNREUM } from '../../common/window/nreum'
import { ee } from '../../common/event-emitter/contextual-ee'
import { Aggregator } from '../../common/aggregate/aggregator'
import {activateFeatures} from '../../common/util/feature-flags'
import { setAPI } from '../../../../cdn/agent-loader/utils/api'

export function setup(agentIdentifier = (Math.random() + 1).toString(36).substring(7)) {
    const nr = gosCDN()

    setInfo(agentIdentifier, nr.info)
    setConfiguration(agentIdentifier, nr.init)
    setLoaderConfig(agentIdentifier, nr.loader_config)
    setRuntime(agentIdentifier, {})

    const aggregator = new Aggregator({agentIdentifier})
    const baseEE = ee.get(agentIdentifier)

    setAPI(agentIdentifier)

    // Features are activated using the legacy setToken function name via JSONP
    addToNREUM('setToken', (flags) => activateFeatures(flags, agentIdentifier))

    return {agentIdentifier, baseEE, aggregator, nr}
}