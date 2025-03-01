/**
 * @file This file exposes build time environment variables that will be included in the
 * build output of the agent. This file specifically contains the normal environment variables
 * for the NPM agent build and will be overridden by webpack/babel during the build based on the
 * type of build being performed.
 */

import pkgJSON from '../../../package.json'

/**
 * Exposes the version of the agent
 */
export const VERSION = pkgJSON.version

/**
 * Exposes the build type of the agent
 */
export const BUILD_ENV = 'NPM'

/**
 * Exposes the distribution method of the agent
 */
export const DIST_METHOD = 'NPM'
