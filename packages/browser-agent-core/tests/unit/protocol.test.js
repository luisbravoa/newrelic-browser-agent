/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import * as win from '../../common/window/win'
import { protocol } from '../../common/url/protocol'

var fileLocation = {
  hash: '',
  host: '',
  hostname: '',
  href: 'file:///Users/jporter/Documents/Code/test.html',
  origin: 'file://',
  pathname: '/Users/jporter/Documents/Code/test.html',
  port: '',
  protocol: 'file:'
}

test('isFileProtocol returns correctly when detecting file protocol', done => {
  win.setWindow({ ...win.getWindow(), location: { ...fileLocation } })

  t.ok(protocol.isFileProtocol(), 'Returned false when protocol is not file protocol')
  t.ok(protocol.supportabilityMetricSent, 'isFileProtocol should send supportability metric if file protocol is detected')
  win.resetWindow()

  t.ok(!protocol.isFileProtocol(), 'Returned false when protocol is not file protocol')
  done()
})
