/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const testDriver = require('../../../tools/jil/index')
const querypack = require('@newrelic/nr-querypack')

let supported = testDriver.Matcher.withFeature('wrappableAddEventListener')

testDriver.test('onreadystatechange only called once with zone.js', supported, function (t, browser, router) {
  t.plan(5)

  let rumPromise = router.expectRum()
  let eventsPromise = router.expectEvents()
  let loadPromise = browser.safeGet(router.assetURL('spa/zonejs-on-ready-state-change.html', { loader: 'spa', init: { ajax: { deny_list: ['nr-local.net'] }} }))

  Promise.all([eventsPromise, rumPromise, loadPromise])
    .then(([eventsResult]) => {
      let {body, query} = eventsResult
      let interactionTree = querypack.decode(body && body.length ? body : query.e)[0]

      const interactionAttr = interactionTree.children.find(x => x.key === 'counts')

      t.equal(interactionTree.trigger, 'initialPageLoad', 'initial page load should be tracked with an interaction')
      t.ok(!!interactionAttr, 'expect counts child from API')
      t.notOk(interactionTree.isRouteChange, 'The interaction does not include a route change.')
      t.equal(interactionAttr.type, 'stringAttribute')
      // the counts custom attribute is an array of number of times onreadystatechage is called
      // for each state.  state 1 and 3 may be called more than once, 2 and 4 should be called
      // exactly once
      t.ok(interactionTree.children[0].value.match(/^\[0,\d,1,\d,1\]$/), 'onreadystate called expected number of times')
      t.end()
    })
    .catch(fail)

  function fail (err) {
    t.error(err)
    t.end()
  }
})
