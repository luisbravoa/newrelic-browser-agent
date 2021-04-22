/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export default class Test {
  constructor (name, spec, fn) {
    this.name = name
    this.spec = spec
    this.fn = fn
  }
}
