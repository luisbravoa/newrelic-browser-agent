const matcher = require('../../tools/jil/util/browser-matcher')
module.exports = matcher.withFeature('wrappableAddEventListener').and(matcher.withFeature('largestContentfulPaint'))
