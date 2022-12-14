/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { parseUrl } from '../../common/url/parse-url'
import { setDenyList, shouldCollectEvent } from '../../common/deny-list/deny-list'

/* NOTE: This file contains pure unit tests that has no need for the agent at all.
*/
test('domain-only blocks all subdomains and all paths', function (done) {
  setDenyList([
    'foo.com'
  ])

  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a/b')), false)
  t.equals(shouldCollectEvent(parseUrl('http://www.foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.b.foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.b.foo.com/c/d')), false)

  t.equals(shouldCollectEvent(parseUrl('http://oo.com')), true, 'regression for length comparison')

  // other domains are allowed
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), true)

  done()
})

test('subdomain blocks further subdomains, but not parent domain', function (done) {
  setDenyList([
    'bar.foo.com'
  ])

  // deny
  t.equals(shouldCollectEvent(parseUrl('http://bar.foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.bar.foo.com')), false)

  // allow
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), true)
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), true)

  done()
})

test('* blocks all domains', function (done) {
  setDenyList([
    '*'
  ])

  // deny
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.bar.com')), false)

  done()
})

test('path is blocking only with exact match', function (done) {
  setDenyList([
    'foo.com/a'
  ])

  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), true)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/b')), true)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a/b')), true)

  setDenyList([
    'foo.com/a/b'
  ])
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a/b')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com/a')), true)

  done()
})

test('* blocks all domains', function (done) {
  setDenyList([
    '*'
  ])

  // deny
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://a.bar.com')), false)

  done()
})

test('protocol is ignored when not specified', function (done) {
  setDenyList([
    'foo.com'
  ])

  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('https://foo.com')), false)

  done()
})

test('port is ignored when not specified', function (done) {
  setDenyList([
    'foo.com'
  ])

  t.equals(shouldCollectEvent(parseUrl('http://foo.com:8080')), false)
  t.equals(shouldCollectEvent(parseUrl('http://foo.com:8181')), false)

  done()
})

// test unexpected strings that don't represent URLs
test('invalid values', function (done) {
  setDenyList([
    '!@$%^*'
  ])
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), true)
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), true)

  setDenyList([
    '!@$%^*',
    'foo.com'
  ])
  t.equals(shouldCollectEvent(parseUrl('http://foo.com')), false)
  t.equals(shouldCollectEvent(parseUrl('http://bar.com')), true)

  done()
})

test('URL that contains protocol multiple times', function (done) {
  setDenyList([
    'https://example.com/http://foo.bar/'
  ])

  t.equals(shouldCollectEvent(parseUrl('https://example.com/http://foo.bar/')), false)
  t.equals(shouldCollectEvent(parseUrl('https://example.com')), true)

  setDenyList([
    'example.com'
  ])

  t.equals(shouldCollectEvent(parseUrl('https://example.com/http://foo.bar/')), false)

  done()
})
