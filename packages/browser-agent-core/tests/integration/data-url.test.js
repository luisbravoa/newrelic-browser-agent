/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import t from '../utils/JILtoJest'
import { setup } from '../utils/setup'
import { Instrument as AjaxInstrum } from '../../features/ajax/instrument/index'

const { baseEE, agentIdentifier } = setup();
const ajaxTestInstr = new AjaxInstrum(agentIdentifier); // attach instrumentation event handlers to agent's events (baseEE)
const handleEE = baseEE.get('handle');
const hasXhr = window.XMLHttpRequest && XMLHttpRequest.prototype && XMLHttpRequest.prototype.addEventListener;

test('XHR request for Data URL does not generate telemetry', done => {
  if (!hasXhr) {
    t.skip('XHR is not supported in this browser')
    done()
    return
  }

  baseEE.addEventListener('send-xhr-start', validate)
  handleEE.addEventListener('xhr', failCase)

  try {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', 'data:,dataUrl')
    xhr.send()
  } catch (e) {
    baseEE.removeEventListener('send-xhr-start', validate)
    handleEE.removeEventListener('xhr', failCase)

    t.skip('XHR with data URL not supported in this browser')
    done()
    return
  }

  t.plan(2)

  function validate (args, xhr) {
    console.log("validate")
    t.equals(this.params.protocol, 'data', 'XHR Data URL request recorded')
    setTimeout(() => {
      baseEE.removeEventListener('send-xhr-start', validate)
      handleEE.removeEventListener('xhr', failCase)

      t.pass('XHR Data URL request did not generate telemetry')
      done()
    }, 100)
  }

  function failCase (params, metrics, start) {
    baseEE.removeEventListener('send-xhr-start', validate)
    handleEE.removeEventListener('xhr', failCase)

    t.fail('XHR Data URL request should not generate telemetry')
    done()
  }
})

test('Data URL Fetch requests do not generate telemetry', done => {
  if (!window.fetch) {
    t.pass('fetch is not supported in this browser')
    done()
    return
  }

  handleEE.addEventListener('xhr', failCase)

  baseEE.addEventListener('fetch-done', validate)

  fetch('data:,dataUrl')

  function validate () {
    t.equals(this.params.protocol, 'data', 'Fetch data URL request recorded')

    setTimeout(() => {
      handleEE.removeEventListener('xhr', failCase)
      baseEE.removeEventListener('fetch-done', validate)

      t.pass('Fetch data URL request did not generate telemetry')
      done()
    }, 100)
  }

  function failCase(params, metrics, start) {
    t.fail('Data URL Fetch requests should not generate telemetry')
    handleEE.removeEventListener('xhr', failCase)
    baseEE.removeEventListener('fetch-done', validate)
  }
})
