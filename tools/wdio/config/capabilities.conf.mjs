import browserList from '../util/browser-list.mjs'
import jilArgs from '../runner/args.mjs'
import { getSauceConnectTunnelName } from '../util/saucelabs.mjs'

function seleniumCapabilities () {
  // We only add one entry per browser so we don't have to mess with versions
  const browsersAdded = new Set()

  return browserList(jilArgs.browsers)
    .filter((browserSpec) => {
      if (!browsersAdded.has(browserSpec.desired.browserName)) {
        browsersAdded.add(browserSpec.desired.browserName)
        return true
      }
      return false
    })
    .map((browserSpec) => ({
      browserName: browserSpec.desired.browserName
    }))
}

function sauceCapabilities () {
  return browserList(jilArgs.browsers).map((browserSpec) => {
    const capability = {
      browserName: browserSpec.desired.browserName,
      platformName: browserSpec.desired.platformName,
      browserVersion: browserSpec.desired.browserVersion
    }

    if (!jilArgs.sauce) {
      capability['sauce:options'] = {
        tunnelName: getSauceConnectTunnelName()
      }
    }

    return capability
  })
}

export default function config () {
  if (jilArgs.selenium) {
    return { capabilities: seleniumCapabilities() }
  } else {
    return { capabilities: sauceCapabilities() }
  }
}
