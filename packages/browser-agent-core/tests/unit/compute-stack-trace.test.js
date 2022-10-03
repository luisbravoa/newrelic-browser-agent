/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { computeStackTrace } from '../../features/jserrors/aggregate/compute-stack-trace'
import { stringify } from '../../common/util/stringify'
import testcases from '../utils/stack-parse-testcases'

test('computeStackTrace', done => {
  for (var i = 0; i < testcases.length; i++) {
    var testcase = testcases[i]
    t.equal(stringify(computeStackTrace(testcase.stack)), stringify(testcase.info), testcase.message)
  }
  done()
})
