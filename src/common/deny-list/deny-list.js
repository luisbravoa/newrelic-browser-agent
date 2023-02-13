/** An array of filter objects {hostname, pathname} for identifying XHR events to be excluded from collection.
 * @see {@link https://docs.newrelic.com/docs/browser/new-relic-browser/configuration/filter-ajax-request-events/ Filter AjaxRequest events}
 * @type {Array.<{hostname: string, pathname: string}>}
 */
export var denyList = []

/**
 * Initializes the {@link denyList|XHR deny list} by extracting hostname and pathname from an array of filter strings.
 * Strips `http://` or `https://` prefixes from start of URL patterns.
 * @param {string[]} denyListConfig - Array of URL filters to identify XHR requests to be excluded from collection.
 */
export function populateDenyList (denyListConfig) {
  denyList = []

  if (!denyListConfig || !denyListConfig.length) {
    return
  }

  for (var i = 0; i < denyListConfig.length; i++) {
    var url = denyListConfig[i].trim()

    if (url.indexOf('http://') === 0) {
      url = url.substring(7)
    } else if (url.indexOf('https://') === 0) {
      url = url.substring(8)
    }

    var firstSlash = url.indexOf('/')

    if (firstSlash > 0) {
      denyList.push({
        hostname: url.substring(0, firstSlash),
        pathname: url.substring(firstSlash)
      })
    } else {
      denyList.push({
        hostname: url,
        pathname: ''
      })
    }
  }
}

/**
 * Evaluates whether an XHR event should be included for collection based on the {@link denyList|AjaxRequest deny list}.
 * @param {Object} xhrParams - object with properties of the XHR event
 * @returns {boolean} `true` if request does not match any entries of {@link denyList|deny list}; else `false`
 */
export function shouldCollectXhrEvent (xhrParams) {
  if (denyList.length === 0) {
    return true
  }

  // XHR requests with an undefined hostname (e.g., data URLs) should not be collected.
  if (xhrParams.hostname === undefined) {
    return false
  }

  for (var i = 0; i < denyList.length; i++) {
    var denyListEntry = denyList[i]

    if (hostnameMatchesPattern(xhrParams.hostname, denyListEntry.hostname) &&
      pathMatchesPattern(xhrParams.pathname, denyListEntry.pathname)) {
      return false
    }
  }

  return true
}

/**
 * Returns true if the end of the `hostname` string matches `pattern` or if `pattern` is `*` (a wildcard).
 * @param {string} hostname - A domain string with no protocol or path (e.g., app1.example.com).
 * @param {string} pattern - A string to be matched against the end of `hostname` string or an asterisk.
 * @returns {boolean} `true` if hostname matches pattern; else `false`.
 */
export function hostnameMatchesPattern (hostname, pattern) {
  if (pattern.length > hostname.length) {
    return false
  }

  if (pattern === '*') {
    return true
  }

  if (hostname.indexOf(pattern) === (hostname.length - pattern.length)) {
    return true
  }

  return false
}

/**
 * Determines whether a given URL path matches a given pattern. An asterisk pattern segment (`/*`) will be treated as a
 * wildcard matching one or more whole path segments.
 * @param {string} path - The path to match.
 * @param {string} pattern - The pattern to match against.
 * @returns {boolean} Returns true if the path matches the pattern, and false otherwise.
*/
export function pathMatchesPattern (path, pattern) {
  // An empty pattern matches all paths.
  if (pattern.trim() === '') return true

  path = path
    .replace(/\/+$/, '') // Remove trailing slashes.
    .replace(/^\/?/, '/') // Ensure there's a leading slash.

  pattern = pattern
    .replace(/\/+$/, '') // Remove trailing slashes.
    .replace(/^\/?/, '/') // Ensure there's a leading slash.
    .replaceAll(/\*+/g, '*') // Replace multiple asterisks with a single asterisk.
    .replaceAll(/(\/\*)+/g, '/*') // Replace multiple sequential wildcard segments with just one.

  // Abort if the pattern includes characters that could conflict with RegExp.
  if (pattern.match(/[^A-Za-z0-9-_/*]/g)) return false

  try {
    return path.match(new RegExp(
      '^' + // Ensure the match starts at the beginning of the path.
      pattern
        .replaceAll('/', '\\/') // Escape slashes for regular expression compatibility.
        .replaceAll('\\/*', '(\\/.+)') + // Convert /* to regular expression syntax.
      '$' // Ensure the match includes the end of the path.
    )) !== null
  } catch (e) {
    return false
  }
}
