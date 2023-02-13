let _denyList

beforeEach(() => {
  _denyList = require('./deny-list')
})

afterEach(() => {
  jest.resetModules()
})

describe('populateDenyList', () => {
  beforeEach(() => {
    _denyList.denyList = []
  })

  test('does not add anything to the denyList if denyListConfig is undefined or empty', () => {
    _denyList.populateDenyList(undefined)
    expect(_denyList.denyList).toEqual([])

    _denyList.populateDenyList([])
    expect(_denyList.denyList).toEqual([])
  })

  test('correctly populates the denyList from the denyListConfig', () => {
    const denyListConfig = [
      'https://example.com/path',
      'http://app1.example.com',
      'app2.example.com/path',
      'app3.example.com',
      '*',
      'localhost/*/foo/*/bar'
    ]

    _denyList.populateDenyList(denyListConfig)

    expect(_denyList.denyList).toEqual([
      { hostname: 'example.com', pathname: '/path' },
      { hostname: 'app1.example.com', pathname: '' },
      { hostname: 'app2.example.com', pathname: '/path' },
      { hostname: 'app3.example.com', pathname: '' },
      { hostname: '*', pathname: '' },
      { hostname: 'localhost', pathname: '/*/foo/*/bar' }
    ])
  })
})

describe('hostnameMatchesPattern', () => {
  test('returns true if pattern is *', () => {
    expect(_denyList.hostnameMatchesPattern('app1.example.com', '*')).toBe(true)
  })

  test('returns true if hostname ends with pattern', () => {
    expect(_denyList.hostnameMatchesPattern('app1.example.com', 'example.com')).toBe(true)
  })

  test('returns false if pattern is longer than hostname', () => {
    expect(_denyList.hostnameMatchesPattern('app1.example.com', 'example.com.co')).toBe(false)
  })

  test('returns false if hostname does not end with pattern', () => {
    expect(_denyList.hostnameMatchesPattern('app1.example.com', 'app2.example.com')).toBe(false)
  })
})

describe('pathMatchesPattern', () => {
  it('matches any path if pattern is an empty string', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar', '')).toBe(true)
  })

  it('matches an empty path if pattern is a trailing slash', () => {
    expect(_denyList.pathMatchesPattern('', '/')).toBe(true)
  })

  it('matches a path to a pattern with a single trailing wildcard', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar', '/foo/*')).toBe(true)
  })

  it('matches a path to a pattern with a leading wildcard segment', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar', '/*/bar')).toBe(true)
  })

  it('matches a path to a pattern with a single initial wildcard', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar', '*')).toBe(true)
  })

  it('matches a path to a pattern with multiple wildcards', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar/baz', '/*/*/*')).toBe(true)
  })

  it('matches multiple path segments with a single wildcard', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar/baz', '/foo/*')).toBe(true)
  })

  it('matches explicit segment preceded by wildcard segment', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar/baz', '/foo/*/baz')).toBe(true)
  })

  it('works without leading slash in pattern', () => {
    expect(_denyList.pathMatchesPattern('/foo', 'foo')).toBe(true)
  })

  it('works with trailing slash in pattern', () => {
    expect(_denyList.pathMatchesPattern('/foo', '/foo/')).toBe(true)
  })

  it('matches a path to a pattern with leading and trailing slashes', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar/baz/', '/foo/bar/baz/')).toBe(true)
  })

  it('does not match partial segment wildcards', () => {
    expect(_denyList.pathMatchesPattern('/foo', '/fo*')).toBe(true)
  })

  it('does not match a path to a pattern with potentially RegExp-conflicting characters', () => {
    expect(_denyList.pathMatchesPattern('/foo/bar', '/*&') &&
      _denyList.pathMatchesPattern('/foo/bar', '/*?')).toBe(false)
  })
})

const DO_NOT_COLLECT = false
const DO_COLLECT = true

describe('shouldCollectXhrEvent', () => {
  test.each([
    { hostname: 'example.com', pathname: '/foobar' },
    { hostname: 'example.com', pathname: '/' },
    { hostname: 'example.com', pathname: '' },
    { hostname: 'foobar.com', pathname: '/foobar' },
    { hostname: 'foobar.com', pathname: '/' },
    { hostname: 'foobar.com', pathname: '' }
  ])('should deny all requests when deny list entry hostname contains asterisk', (input) => {
    _denyList.populateDenyList(['*'])
    const result = _denyList.shouldCollectXhrEvent(input)
    expect(result).toEqual(DO_NOT_COLLECT)
  })

  test.each([
    { hostname: 'example.com', pathname: '/foobar' },
    { hostname: 'example.com', pathname: '/' },
    { hostname: 'example.com', pathname: '' }
  ])('should deny requests when hostname matches regardless of pathname when denylist entry does not contain a pathname', (input) => {
    _denyList.populateDenyList(['example.com'])
    const result = _denyList.shouldCollectXhrEvent(input)
    expect(result).toEqual(DO_NOT_COLLECT)
  })

  test.each([
    { hostname: 'example.com', pathname: '/foobar' },
    { hostname: 'example.com', pathname: '/' },
    { hostname: 'example.com', pathname: '' }
  ])('should allow requests when hostname does not match and denylist entry does not contain a pathname, regardless of path', (input) => {
    _denyList.populateDenyList(['foobar.com'])
    const result = _denyList.shouldCollectXhrEvent(input)
    expect(result).toEqual(DO_COLLECT)
  })

  test('should deny request when hostname and pathname match deny list entry', () => {
    _denyList.populateDenyList(['example.com/foobar'])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '/foobar' })
    expect(result).toEqual(DO_NOT_COLLECT)
  })

  test('should deny request if hostname matches regardless of pathname if deny list entry pathname is blank', () => {
    _denyList.populateDenyList(['example.com'])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '/foobar' })
    expect(result).toEqual(DO_NOT_COLLECT)
  })

  test('should deny request if hostname matches when pathname is empty and deny pattern explicitly includes a trailing slash', () => {
    _denyList.populateDenyList(['example.com/'])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '' })
    expect(result).toEqual(DO_NOT_COLLECT)
  })

  test('should allow request even if hostname matches when path is not empty and deny pattern explicitly includes a trailing slash', () => {
    _denyList.populateDenyList(['example.com/'])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '/foo/bar' })
    expect(result).toEqual(DO_COLLECT)
  })

  test.each([
    'example.com/foo',
    'example.com/foo/'
  ])('should allow request when pathname is longer than the pathname defined in the deny list', (denyEntry) => {
    _denyList.populateDenyList([denyEntry])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '/foo/bar' })
    expect(result).toEqual(DO_COLLECT)
  })

  test('should allow request if hostname matches when deny pattern includes an extra wildcard segment', () => {
    _denyList.populateDenyList(['example.com/foo/bar/*'])
    const result = _denyList.shouldCollectXhrEvent({ hostname: 'example.com', pathname: '/foo/bar' })
    expect(result).toEqual(DO_COLLECT)
  })

  test.each([
    {
      input: { hostname: 'example.com', pathname: '/foo/bar' },
      denyEntry: 'example.com/*'
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/bar' },
      denyEntry: 'example.com/foo/*'
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/bar' },
      denyEntry: 'example.com/*/bar'
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/1/bar' },
      denyEntry: 'example.com/foo/*/bar'
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/1/bar' },
      denyEntry: 'example.com/foo/*/*/bar' // Treat multiple sequential asterisk segements the same as a single asterisk segment.
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/1/bar' },
      denyEntry: 'example.com/**/bar' // Treat multiple asterisks the same as a single asterisk.
    },
    {
      input: { hostname: 'example.com', pathname: '/foo/bar' },
      denyEntry: '*/foo/bar'
    }
  ])('should deny request when pathname partially matches deny list entry containing wildcard(s) in path', ({ input, denyEntry }) => {
    _denyList.populateDenyList([denyEntry])
    const result = _denyList.shouldCollectXhrEvent(input)
    expect(result).toEqual(DO_NOT_COLLECT)
  })
})
