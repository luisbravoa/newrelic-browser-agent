
if (!window.NREUM) {
  window.NREUM = {}
}

if (!window.NREUM.o) {
  var win = window
  var doc = win.document
  var XHR = win.XMLHttpRequest

  NREUM.o = {
    ST: setTimeout,
    SI: win.setImmediate,
    CT: clearTimeout,
    XHR: XHR,
    REQ: win.Request,
    EV: win.Event,
    PR: win.Promise,
    MO: win.MutationObserver,
    FETCH: win.fetch
  }
}

module.exports = {
  wrapGlobalEvents: wrapGlobalEvents,
  wrapGlobalFetch: wrapGlobalFetch,
  wrapGlobalRaf: wrapRaf,
  wrapGlobalTimers: wrapTimer,
  wrapXhr: wrapXhr,
  wrapFetch: wrapFetch
}

function wrapGlobalEvents() {
  require('./wrap-events')
}

function wrapGlobalFetch() {
  return require('./wrap-fetch').wrapGlobal()
}

function wrapFetch(ee) {
  return require('./wrap-fetch').wrap(ee)
}

function wrapHistory() {
  require('./wrap-history')
}

function wrapJson() {
  require('./wrap-jsonp')
}

function wrapMutation() {
  require('./wrap-mutation')
}

function wrapPromise() {
  require('./wrap-promise')
}

function wrapRaf() {
  require('./wrap-raf')
}

function wrapTimer() {
  require('./wrap-timer')
}

function wrapXhr() {
  require('./wrap-xhr')
}
