/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// represents test and browser/platform combination
export default class DeviceTest {
  constructor (test, browserSpec) {
    this.test = test
    this.browserSpec = browserSpec
  }
}
