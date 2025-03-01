import { faker } from '@faker-js/faker'

let mockNREUM
let runtime

beforeEach(() => {
  mockNREUM = {}
  runtime = {}

  jest.doMock('../window/nreum', () => ({
    __esModule: true,
    gosNREUM: jest.fn(() => mockNREUM)
  }))

  jest.doMock('../config/config', () => ({
    __esModule: true,
    getRuntime: jest.fn(() => runtime)
  }))
})

afterEach(() => {
  jest.resetModules()
  jest.resetAllMocks()
})

describe('global event-emitter', () => {
  test('it returns the event-emitter defined on window.NREUM', async () => {
    const mockEE = {}
    mockNREUM.ee = mockEE

    const { ee } = await import('./contextual-ee')

    expect(ee).toEqual(mockEE)
  })

  test('it sets the global event-emitter on window.NREUM', async () => {
    const { ee } = await import('./contextual-ee')

    expect(ee).toEqual(mockNREUM.ee)
  })
})

describe('scoping event-emitter', () => {
  test('it creates a new child event-emitter', async () => {
    const { ee } = await import('./contextual-ee')

    const childName = faker.datatype.uuid()
    const result = ee.get(childName)

    expect(result).not.toEqual(mockNREUM.ee)
    expect(result).toEqual(ee.get(childName)) // Should always return the same event-emitter
    expect(result.debugId).toEqual(childName)
  })

  test('it creates a child event-emitter with an isolated backlog', async () => {
    const childName = faker.random.alphaNumeric(16)

    jest.doMock('../config/config', () => ({
      __esModule: true,
      getRuntime: jest.fn(id => {
        if (id === childName) {
          return { isolatedBacklog: true }
        }

        return runtime
      })
    }))

    const { ee } = await import('./contextual-ee')
    const result = ee.get(childName)

    expect(ee.backlog).not.toBe(result.backlog)
  })
})

describe('event-emitter context', () => {
  test('it returns a new context', async () => {
    const { ee } = await import('./contextual-ee')

    const result = ee.context()

    expect(result).toEqual({})
  })

  test('it returns the same context', async () => {
    const { ee } = await import('./contextual-ee')

    const result = ee.context()

    expect(result).toEqual(ee.context(result))
  })

  test('it adds the context to the provided object', async () => {
    const { ee } = await import('./contextual-ee')

    const obj = {}
    const result = ee.context(obj)

    expect(result).toEqual(obj['nr@context'])
  })
})

describe('event-emitter buffer', () => {
  it('it should create a new buffer for the given group', async () => {
    const { ee } = await import('./contextual-ee')
    const eventType = faker.datatype.uuid()
    const group = faker.datatype.uuid()

    ee.buffer([eventType], group)

    expect(ee.backlog).toEqual(expect.objectContaining({
      [group]: []
    }))
    expect(ee.isBuffering(eventType)).toEqual(true)
  })

  it('it should default group to "feature"', async () => {
    const { ee } = await import('./contextual-ee')
    const eventType = faker.datatype.uuid()

    ee.buffer([eventType])

    expect(ee.backlog).toEqual(expect.objectContaining({
      feature: []
    }))
    expect(ee.isBuffering(eventType)).toEqual(true)
  })

  it('it should not create buffer if event-emitter is aborted', async () => {
    const { ee } = await import('./contextual-ee')
    const eventType = faker.datatype.uuid()
    const group = faker.datatype.uuid()

    ee.backlog = {
      api: ['foo', 'bar', 'baz']
    }
    ee.abort()
    ee.buffer([eventType], group)

    expect(ee.backlog).toEqual({})
    expect(ee.isBuffering(eventType)).toEqual(false)
  })
})

describe('event-emitter abort', () => {
  test('it aborts if there is an API backlog', async () => {
    const { ee } = await import('./contextual-ee')

    ee.backlog = {
      api: ['foo', 'bar', 'baz']
    }
    ee.abort()

    expect(ee.aborted).toEqual(true)
    expect(ee.backlog).toEqual({})
  })

  test('it aborts if there is a feature backlog', async () => {
    const { ee } = await import('./contextual-ee')

    ee.backlog = {
      feature: ['foo', 'bar', 'baz']
    }
    ee.abort()

    expect(ee.aborted).toEqual(true)
    expect(ee.backlog).toEqual({})
  })
})

describe('event-emitter emit', () => {
  it('should execute the listener', async () => {
    const { ee } = await import('./contextual-ee')
    const mockListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.on(eventType, mockListener)
    ee.emit(eventType, eventArgs)

    expect(mockListener).toHaveBeenCalledWith(eventArgs[0], eventArgs[1], eventArgs[2])
  })

  it('should not execute the listener after removal', async () => {
    const { ee } = await import('./contextual-ee')
    const mockListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.on(eventType, mockListener)
    ee.emit(eventType, eventArgs)
    ee.removeEventListener(eventType, mockListener)
    ee.emit(eventType, eventArgs)

    expect(mockListener).toHaveBeenCalledTimes(1)
  })

  it('should return early if global event-emitter is aborted', async () => {
    const { ee } = await import('./contextual-ee')
    const mockListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.backlog = {
      api: ['foo', 'bar', 'baz']
    }
    ee.abort()
    ee.on(eventType, mockListener)
    ee.emit(eventType, eventArgs)

    expect(mockListener).toHaveBeenCalledTimes(0)
  })

  it('should still emit if global event-emitter is aborted but force flag is true', async () => {
    const { ee } = await import('./contextual-ee')
    const scopeEE = ee.get(faker.datatype.uuid())
    const mockScopeListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.backlog = {
      api: ['foo', 'bar', 'baz']
    }
    ee.abort()
    scopeEE.on(eventType, mockScopeListener)
    scopeEE.emit(eventType, eventArgs, {}, true)

    expect(mockScopeListener).toHaveBeenCalledTimes(1)
  })

  it('should bubble the event if bubble flag is true', async () => {
    const { ee } = await import('./contextual-ee')
    const scopeEE = ee.get(faker.datatype.uuid())
    const mockListener = jest.fn()
    const mockScopeListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.on(eventType, mockListener)
    scopeEE.on(eventType, mockScopeListener)
    scopeEE.emit(eventType, eventArgs, {}, false, true)

    expect(mockScopeListener).toHaveBeenCalledTimes(1)
    expect(mockListener).toHaveBeenCalledTimes(1)
  })

  it('should not bubble the event if bubble flag is false', async () => {
    const { ee } = await import('./contextual-ee')
    const scopeEE = ee.get(faker.datatype.uuid())
    const mockListener = jest.fn()
    const mockScopeListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.on(eventType, mockListener)
    scopeEE.on(eventType, mockScopeListener)
    scopeEE.emit(eventType, eventArgs, {}, false, false)

    expect(mockScopeListener).toHaveBeenCalledTimes(1)
    expect(mockListener).not.toHaveBeenCalled()
  })

  it('should buffer the event on the scoped event-emitter', async () => {
    const { ee } = await import('./contextual-ee')
    const scopeEE = ee.get(faker.datatype.uuid())
    const mockListener = jest.fn()
    const mockScopeListener = jest.fn()
    const eventType = faker.datatype.uuid()
    const eventArgs = ['a', 'b', 'c']

    ee.on(eventType, mockListener)
    ee.buffer([eventType])
    scopeEE.on(eventType, mockScopeListener)
    scopeEE.buffer([eventType])
    scopeEE.emit(eventType, eventArgs, {}, false, false)

    expect(mockScopeListener).toHaveBeenCalledTimes(1)
    expect(mockListener).not.toHaveBeenCalled()
    expect(scopeEE.backlog['feature']).toEqual(expect.arrayContaining([
      expect.arrayContaining([
        scopeEE,
        eventType,
        eventArgs,
        {}
      ])
    ]))
    expect(ee.backlog['feature']).toEqual(scopeEE.backlog['feature'])
  })
})

describe('getOrSetContext', () => {
  test('it returns a new context', async () => {
    const { getOrSetContext } = await import('./contextual-ee')

    const obj = {}
    const result = getOrSetContext(obj)

    expect(result).toEqual({})
    expect(result).toEqual(obj['nr@context'])
  })

  test('it returns the same context', async () => {
    const { getOrSetContext } = await import('./contextual-ee')

    const obj = {}
    const result = getOrSetContext(obj)

    expect(getOrSetContext(obj)).toEqual(result)
  })
})
