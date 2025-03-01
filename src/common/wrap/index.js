/**
 * @file Wraps assorted native objects and functions for instrumentation.
 */

import { wrapConsole } from './wrap-console'
import { wrapEvents } from './wrap-events'
import { wrapFetch } from './wrap-fetch'
import { wrapHistory } from './wrap-history'
import { wrapJsonP } from './wrap-jsonp'
import { wrapMutation } from './wrap-mutation'
import { wrapPromise } from './wrap-promise'
import { wrapRaf } from './wrap-raf'
import { wrapTimer } from './wrap-timer'
import { wrapXhr } from './wrap-xhr'

export {
  wrapConsole, wrapEvents, wrapFetch, wrapHistory, wrapJsonP, wrapMutation, wrapPromise, wrapRaf, wrapTimer, wrapXhr
}
