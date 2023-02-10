let denyList

beforeEach(() => {
  denyList = require('./deny-list')
})

afterEach(() => {
  jest.resetModules()
})

test.each([
  { hostname: 'example.com', pathname: '/foobar' },
  { hostname: 'example.com', pathname: '/' },
  { hostname: 'example.com', pathname: '' },
  { hostname: 'foobar.com', pathname: '/foobar' },
  { hostname: 'foobar.com', pathname: '/' },
  { hostname: 'foobar.com', pathname: '' }
])('should block all requests when deny list contains asterisk', (input) => {
  denyList.setDenyList(['*'])
  const result = denyList.shouldCollectEvent(input)

  expect(result).toEqual(false)
})

test.each([
  { hostname: 'example.com', pathname: '/foobar' },
  { hostname: 'example.com', pathname: '/' },
  { hostname: 'example.com', pathname: '' }
])('should block when request domain matches regardless of path when denylist entry does not contain a path', (input) => {
  denyList.setDenyList(['example.com'])
  const result = denyList.shouldCollectEvent(input)

  expect(result).toEqual(false)
})

test.each([
  { hostname: 'example.com', pathname: '/foobar' },
  { hostname: 'example.com', pathname: '/' },
  { hostname: 'example.com', pathname: '' }
])('should not block when request domain does not match regardless of path when denylist entry does not contain a path', (input) => {
  denyList.setDenyList(['foobar.com'])
  const result = denyList.shouldCollectEvent(input)

  expect(result).toEqual(true)
})

test('should block when request domain and path match deny list', () => {
  denyList.setDenyList(['example.com/foobar'])
  const result = denyList.shouldCollectEvent({ hostname: 'example.com', pathname: '/foobar' })

  expect(result).toEqual(false)
})

test('should not consider request path when deny list only contains a slash as path', () => {
  denyList.setDenyList(['example.com/'])
  const result = denyList.shouldCollectEvent({ hostname: 'example.com', pathname: '/foobar' })

  expect(result).toEqual(false)
})

test.each([
  'example.com/foo',
  'example.com/foo/'
])('should not block when request path does not match exactly the path defined in the deny list', (denyEntry) => {
  denyList.setDenyList([denyEntry])
  const result = denyList.shouldCollectEvent({ hostname: 'example.com', pathname: '/foo/bar' })

  expect(result).toEqual(true)
})

test.each([
  {
    input: { hostname: 'example.com', pathname: '/foo/bar' },
    denyEntry: 'example.com/foo/*'
  },
  {
    input: { hostname: 'example.com', pathname: '/foo/1/bar' },
    denyEntry: 'example.com/foo/*/bar'
  }
])('should block when request path partially matches deny list entry containing wild card in path', ({ input, denyEntry }) => {
  denyList.setDenyList([denyEntry])
  const result = denyList.shouldCollectEvent(input)

  expect(result).toEqual(false)
})
