/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { setup } from '../utils/setup'
import { setConfiguration } from '../../common/config/config'
import { Instrument as MetricsInstrum } from '../../features/metrics/instrument/index'
import { Aggregate as MetricsAggreg } from '../../features/metrics/aggregate/index'
import * as obfuscate from '../../common/util/obfuscate'
import * as win from '../../common/window/win'

const { aggregator, agentIdentifier } = setup();
new MetricsInstrum(agentIdentifier);
new MetricsAggreg(agentIdentifier, aggregator);
const obfuscatorInst = new obfuscate.Obfuscator({ agentIdentifier });

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

var validationCases = [
  {
    name: 'Invalid: missing regex',
    expected: false,
    rule: {
      replacement: 'missing-regex-field'
    }
  },
  {
    // this case is okay because when replacement is null, replacement defaults to '*'
    name: 'Valid: missing replacement',
    expected: true,
    rule: {
      regex: 'missing-replacment-field'
    }
  },
  {
    name: 'Invalid regex type (must be string or RegExp)',
    expected: false,
    rule: {
      regex: {},
      replacement: 'invalid regex type'
    }
  },
  {
    name: 'Invalid replacement type (must be string)',
    expected: false,
    rule: {
      regex: 'invalid-replacement-type',
      replacement: {}
    }
  },
  {
    name: 'Valid string regex',
    expected: true,
    rule: {
      regex: 'pii',
      replacement: 'obfuscated'
    }
  },
  {
    name: 'Valid RegExp regex',
    expected: true,
    rule: {
      regex: /[i]/g,
      replacement: 'obfuscated'
    }
  }
]

describe('Obfuscation validateRules input', done => {
  validationCases.forEach(function (testCase) {
    test(testCase.name, done => {
      var result = obfuscate.validateRules([testCase.rule])
      t.equal(testCase.expected, result, 'expecting ' + testCase.expected)
      done()
    })
  })
})

test('Should Obfuscate', done => {
  setConfiguration(agentIdentifier, {
    obfuscate: validationCases.filter(x => x.expected).map(x => x.rule)
  });

  t.ok(obfuscatorInst.shouldObfuscate(), 'When init.obfuscate is defined, shouldObfuscate is true')

  //delete win.getWindow().NREUM.init.obfuscate
  setConfiguration(agentIdentifier, {});  // note this'll reset the *whole* config to the default values
  t.ok(!obfuscatorInst.shouldObfuscate(), 'When init.obfuscate is NOT defined, shouldObfuscate is false')
  done()
})

test('Get Rules', done => {
  setConfiguration(agentIdentifier, {
    obfuscate: validationCases.filter(x => x.expected).map(x => x.rule)
  });

  t.ok(!!obfuscate.getRules(agentIdentifier).length, 'getRules should generate a list of rules from init.obfuscate')

  //delete win.getWindow().NREUM.init.obfuscate
  setConfiguration(agentIdentifier, {});  // note this'll reset the *whole* config to the default values
  t.ok(!obfuscate.getRules(agentIdentifier).length, 'getRules should generate an empty list if init.obfuscate is undefined')

  win.setWindow({ ...win.getWindow(), location: { ...fileLocation } })
  t.ok(!!obfuscate.getRules(agentIdentifier).filter(x => x.regex.source.includes('file')).length, 'getRules should generate a rule for file obfuscation if file protocol is detected')

  win.resetWindow()
  done()
})

test('Obfuscate String Method', done => {
  setConfiguration(agentIdentifier, {
    obfuscate: validationCases.filter(x => x.expected).map(x => x.rule)
  });

  t.ok(!obfuscatorInst.obfuscateString('http://example.com/missing-replacement-field/123').includes('missing-replacement-field'), 'Successfully obfuscates missing replacement field')
  t.ok(!obfuscatorInst.obfuscateString('http://example.com/pii/123').includes('pii'), 'Successfully obfuscates string')
  t.ok(!obfuscatorInst.obfuscateString('http://example.com/abcdefghijklmnopqrstuvwxyz/123').includes('i'), 'Successfully obfuscates regex')

  win.setWindow({ ...win.getWindow(), location: { ...fileLocation } })
  //delete win.getWindow().NREUM.init.obfuscate
  setConfiguration(agentIdentifier, {});  // note this'll reset the *whole* config to the default values
  t.ok(obfuscatorInst.obfuscateString('file:///Users/jporter/Documents/Code/scratch/noticeErrorTest.html') === 'file://OBFUSCATED', 'Successfully obfuscates file protocol')

  win.resetWindow()
  done()
})
