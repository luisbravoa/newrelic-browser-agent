/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { canonicalFunctionName } from '../../features/jserrors/aggregate/canonical-function-name'

test('canonicalFunctionName', done => {
  var testcases = [
    [null, undefined, 'Return undefined if no function name'],
    ['test', 'test', 'Simple function name'],
    ['scope1/scope2/func', 'func', 'Remove Firefox scopes'],
    ['scope1.func', 'func', 'Remove Chrome scopes'],
    ['<anonymous>', undefined, 'Return undefined ending is non-alphanumeric']
  ]

  for (var i = 0; i < testcases.length; i++) {
    var testcase = testcases[i]
    t.equal(canonicalFunctionName(testcase[0]), testcase[1], testcase[2])
  }
  done()
})
