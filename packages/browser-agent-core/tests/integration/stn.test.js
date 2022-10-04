/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { setup } from '../utils/setup'

import { Instrument as StnInstrument } from '../../features/session-trace/instrument/index'
import { Instrument as AjaxInstrument } from '../../features/ajax/instrument/index'
import { Aggregate as AjaxAggregate } from '../../features/ajax/aggregate/index'
import { Instrument as JsErrorsInstrument } from '../../features/jserrors/instrument/index'
import { Aggregate as JsErrorsAggregate } from '../../features/jserrors/aggregate/index'
import { getRuntime } from '../../common/config/config'

import { Aggregate as StnAggregate } from '../../features/session-trace/aggregate/index'
import { Aggregate as PvtAggregate } from '../../features/page-view-timing/aggregate/index'
import { drain } from '../../common/drain/drain'

const { agentIdentifier, baseEE, aggregator } = setup()
getRuntime(agentIdentifier).features.stn = true

const stnAgg = new StnAggregate(agentIdentifier, aggregator)
const pvtAgg = new PvtAggregate(agentIdentifier, aggregator)

new StnInstrument(agentIdentifier)
new AjaxInstrument(agentIdentifier)
new AjaxAggregate(agentIdentifier, aggregator)
new JsErrorsInstrument(agentIdentifier)
new JsErrorsAggregate(agentIdentifier, aggregator)

drain(agentIdentifier, 'api')

let originalPath = window.location.pathname

if ((window.performance &&
  window.performance.timing &&
  window.performance.getEntriesByType)) {
  runTests()
} else {
  test('unsupported browser', done => {
    t.skip('skipping tests because browser does not have perf timing api')
    done()
  })
}

// create session trace nodes for load events
document.addEventListener('DOMContentLoaded', () => null)
window.addEventListener('load', () => null)

function runTests() {
  const ee = baseEE

  test('wait for trace node generation', done => {
    ee.emit('feat-err', [])
    t.plan(4)
    window.history.pushState(null, '', '#foo')
    window.history.pushState(null, '', '#bar')
    setTimeout(() => t.ok(true), 0)
    let interval = setInterval(() => {
      clearInterval(interval)
      t.ok(true)
    }, 0)
    window.requestAnimationFrame(() => {
      t.ok(true)
      throw new Error('raf error')
    })
    let xhr = new XMLHttpRequest()
    xhr.open('GET', window.location)
    xhr.send()
    xhr.addEventListener('load', () => t.ok(true))
  })

  test('session trace nodes', done => {

    let fiVal = 30
    let fidVal = 8

    pvtAgg.addTiming('load', 20)
    pvtAgg.addTiming('fi', fiVal, { fid: fidVal })

    ee.emit('feat-stn', [])
    drain(agentIdentifier, 'feature')

    const payload = stnAgg.takeSTNs()

    let res = payload.body.res
    let qs = payload.qs

    t.ok(+qs.st > 1404952055986 && Date.now() > +qs.st, 'Start time is between recent time and now ' + qs.st)

    t.test('stn DOMContentLoaded', done => {
      let node = res.filter(function (node) { return node.n === 'DOMContentLoaded' })[0]
      t.ok(node, 'DOMContentLoaded node created')
      t.ok(node.s > 10, 'DOMContentLoaded node has start time ' + node.s)
      t.equal(node.o, 'document', 'DOMContentLoaded node origin ' + node.o)
      done()
    })
    t.test('stn document load', done => {
      let node = res.filter(function (node) { return node.n === 'load' && node.o === 'document' })[0]
      t.ok(node, 'load node created')
      t.ok(node.s > 10, 'load node has start time ' + node.s)
      t.equal(node.o, 'document', 'load node origin ' + node.o)
      done()
    })
    t.test('stn timer', done => {
      let node = res.filter(function (node) { return node.n === 'setInterval' })[0]
      t.ok(node, 'timer node created')
      t.ok(node.s > 10, 'timer node has start time ' + node.s)
      t.equal(node.o, 'window', 'setInterval origin ' + node.o)
      done()
    })
    t.test('stn-raf', done => {
      let node = res.filter(function (node) { return node.n === 'requestAnimationFrame' })[0]
      t.ok(node, 'raf node created')
      t.ok(node.s > 10, 'raf node has start time ' + node.s)
      t.equal(node.o, 'window', 'requestAnimationFrame origin ' + node.o)
      done()
    })
    t.test('stn error', done => {
      let errorNode = res.filter(function (node) { return node.o === 'raf error' })[0]
      t.ok(errorNode, 'error node created')
      t.ok(errorNode.s > 10, 'error node has start time ' + errorNode.s)
      t.equal(errorNode.s, errorNode.e, 'error node has no duration')
      done()
    })
    t.test('stn ajax', done => {
      let ajax = res.filter(function (node) { return node.t === 'ajax' })[0]
      t.ok(ajax, 'ajax node created')
      t.ok((ajax.e - ajax.s) > 1, 'Ajax has some duration')
      t.equal(ajax.n, 'Ajax', 'Ajax name')
      t.equal(ajax.t, 'ajax', 'Ajax type')
      done()
    })
    t.test('stn history', done => {
      let hist = res.filter(function (node) { return node.n === 'history.pushState' })[1]
      t.ok(hist, 'hist node created')
      t.equal(hist.s, hist.e, 'hist node has no duration')
      t.equal(hist.n, 'history.pushState', 'hist name')
      t.equal(hist.o, `${originalPath}#bar`, 'new path')
      t.equal(hist.t, `${originalPath}#foo`, 'old path')
      done()
    })
    t.test('stn pvt items', done => {
      let pvtItems = res.filter(function (node) { return node.n === 'fi' || node.n === 'fid' })
      t.ok(pvtItems.length === 2, 'all pvt items exist')

      for (let i = 0; i < pvtItems.length; i++) {
        let x = pvtItems[i]
        if (x.n === 'fi') {
          t.ok(x.o === 'document', 'FI owner is document')
          t.ok(x.s === x.e, 'FI has no duration')
          t.ok(x.t === 'timing', 'FI is a timing node')
        }
        if (x.n === 'fid') {
          t.ok(x.o === 'document', 'FID owner is document')
          t.ok(x.s === fiVal && x.e === fiVal + fidVal, 'FID has a duration relative to FI')
          t.ok(x.t === 'event', 'FID is an event node')
        }
      }
      done()
    })
    let unknown = res.filter(function (n) { return n.o === 'unknown' })
    t.equal(unknown.length, 0, 'No events with unknown origin')

    done()
  })
}
