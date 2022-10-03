/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import {generateUuid} from '../../common/ids/unique-id'

test('generateId', done => {
  window._log = t.comment

  var uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  var id = generateUuid()
  t.ok(id.match(uuidRe, 'is uuid format'))
  done()
})
