/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { cleanURL } from '../../common/url/clean-url'

var testcases = [
  ['http://domain.com/path?query=5', 'http://domain.com/path', 'http://domain.com/path'],
  ['http://domain.com/path#fragment', 'http://domain.com/path', 'http://domain.com/path#fragment'],
  ['http://domain.com/path?query=5#fragment', 'http://domain.com/path', 'http://domain.com/path#fragment'],
  ['http://domain.com/path?query=5?dumb#fragment', 'http://domain.com/path', 'http://domain.com/path#fragment'],
  ['http://domain.com/path?query=5#fragment#dumb', 'http://domain.com/path', 'http://domain.com/path#fragment#dumb'],
  ['http://domain.com/path?query=5#fragment#dumb?additional_query', 'http://domain.com/path', 'http://domain.com/path#fragment#dumb'],
  ['http://domain.com/path?query=5#fragment/silly/dumber#dumbest?additional_query=silly#what_is_this_even', 'http://domain.com/path', 'http://domain.com/path#fragment/silly/dumber#dumbest']
]

test('cleanURL', function () {
  for (var i = 0; i < testcases.length; i++) {
    var testcase = testcases[i]
    expect(cleanURL(testcase[0])).toEqual(testcase[1])
    expect(cleanURL(testcase[0], true)).toEqual(testcase[2])
  }
})
