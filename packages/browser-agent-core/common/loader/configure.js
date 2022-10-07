import { addToNREUM, gosNREUMInitializedAgents } from '../window/nreum'
import { setConfiguration, setInfo, setLoaderConfig, setRuntime } from '../config/config'
import { setAPI } from '../api/api'
import { activateFeatures } from '../util/feature-flags'

export function configure(agentIdentifier, { init, info, loader_config, exposed = true }) {
    const api = {}

    setInfo(agentIdentifier, info)
    setConfiguration(agentIdentifier, init)
    setLoaderConfig(agentIdentifier, loader_config)
    setRuntime(agentIdentifier, {})

    setAPI(agentIdentifier, api)
    gosNREUMInitializedAgents(agentIdentifier, api, 'api')
    gosNREUMInitializedAgents(agentIdentifier, exposed, 'exposed')
    addToNREUM('setToken', (flags) => activateFeatures(flags, agentIdentifier))

    return api
}
