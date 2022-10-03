/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from '../utils/setup'
import { setConfiguration, getConfigurationValue } from '../../common/config/config'

const { agentIdentifier } = setup();

describe('getConfiguration', () => {
  test('returns value from NREUM.init using provided path', () => {
    setConfiguration(agentIdentifier, { a: 123 })
    expect(getConfigurationValue(agentIdentifier, 'a')).toEqual(123)

    setConfiguration(agentIdentifier, { a: { b: 123 } })
    expect(getConfigurationValue(agentIdentifier, 'a.b')).toEqual(123)

    setConfiguration(agentIdentifier, { a: { b: { c: 123 } } })
    expect(getConfigurationValue(agentIdentifier, 'a.b.c')).toEqual(123)
  })

  test('returns undefined when path does not match', () => {
    setConfiguration(agentIdentifier, { a: 123 })
    expect(getConfigurationValue(agentIdentifier, 'b', 456)).toBeUndefined()

    setConfiguration(agentIdentifier, { a: { b: 123 } })
    expect(getConfigurationValue(agentIdentifier, 'a.c', 456)).toBeUndefined()
  })

  test('returns undefined when configuration is missing', () => {
    //delete NREUM.init
    // DEPRECATED case: the underlying config storage is not exposed and it has no deletion method (yet).
    //  Any alternative would be equivalent to the test immediately below.
    //t.equal(getConfigurationValue(agentIdentifier, 'a', 456), undefined)

    setConfiguration(agentIdentifier, {})
    expect(getConfigurationValue(agentIdentifier, 'a', 456)).toBeUndefined()
  })
})
