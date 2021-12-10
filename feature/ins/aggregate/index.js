/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

var ee = require('ee')
var loader = require('loader')
var mapOwn = require('map-own')
var stringify = require('../../../agent/stringify')
var register = require('../../../agent/register-handler')
var harvest = require('../../../agent/harvest')
var HarvestScheduler = require('../../../agent/harvest-scheduler')
var cleanURL = require('../../../agent/clean-url')
var config = require('config')

var eventsPerMinute = 240
var harvestTimeSeconds = config.getConfiguration('ins.harvestTimeSeconds') || 30
var eventsPerHarvest = eventsPerMinute * harvestTimeSeconds / 60
var referrerUrl
var currentEvents

var eventsByAppId = {}
eventsByAppId[loader.info.applicationID] = []

// used for temporary caching in case retry is needed
var currentEventsByAppId

var att = loader.info.jsAttributes = {}

if (document.referrer) referrerUrl = cleanURL(document.referrer)

register('api-setCustomAttribute', setCustomAttribute, 'api')

ee.on('feat-ins', function () {
  register('api-addPageAction', addPageAction)
  
  var scheduler = new HarvestScheduler(loader, 'ins', { 
    onFinished: onHarvestFinished,
    getPayload: onHarvestStarted
  })
  scheduler.startTimer(harvestTimeSeconds, 0)
})

function onHarvestStarted (options) {
  var payload = []

  for (var appId in eventsByAppId) {
    payload.push({
      appId: appId,
      qs: {
        ua: loader.info.userAttributes,
        at: loader.info.atts
      },
      body: {
        ins: eventsByAppId[appId]
      }
    })
  }

  if (options.retry) {
    currentEventsByAppId = eventsByAppId
  }

  eventsByAppId = {}
  return payload
}

function onHarvestFinished (result) {
  // TODO: handler retry per appId
  if (result && result.sent && result.retry && currentEvents) {
    events = events.concat(currentEvents)
    currentEvents = null
  }
}

// WARNING: Insights times are in seconds. EXCEPT timestamp, which is in ms.
function addPageAction (t, name, attributes, options) {
  // TODO: handle limit
  // if (events.length >= eventsPerHarvest) return

  var width
  var height
  var eventAttributes = {}

  if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
    // Doesn't include the nav bar when it disappears in mobile safari
    // https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/src/dimensions.js#L23
    width = window.document.documentElement.clientWidth
    height = window.document.documentElement.clientHeight
  }

  var defaults = {
    timestamp: t + loader.offset,
    timeSinceLoad: t / 1000,
    browserWidth: width,
    browserHeight: height,
    referrerUrl: referrerUrl,
    currentUrl: cleanURL('' + location),
    pageUrl: cleanURL(loader.origin),
    eventType: 'PageAction'
  }

  mapOwn(defaults, set)
  mapOwn(att, set)
  if (attributes && typeof attributes === 'object') {
    mapOwn(attributes, set)
  }
  eventAttributes.actionName = name || ''

  var appId = (options && options.appId) || loader.info.applicationID
  if (!eventsByAppId[appId]) {
    eventsByAppId[appId] = []
  }
  eventsByAppId[appId].push(eventAttributes)

  function set (key, val) {
    eventAttributes[key] = (val && typeof val === 'object' ? stringify(val) : val)
  }
}

function setCustomAttribute (t, key, value) {
  att[key] = value
}
