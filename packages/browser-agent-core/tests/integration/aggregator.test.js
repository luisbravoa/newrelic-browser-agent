/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from '../utils/setup'

const { aggregator: agg } = setup();

var singleValueMetric = {
  type: 'condensed',
  name: 'bar',
  metrics: { count: 1, value: { t: 4 } },
  params: { other: 'blah' }
}

var metric = {
  type: 'metric',
  name: 'bar',
  metrics: {
    count: 2,
    value: { t: 6, min: 3, max: 3, sos: 18, c: 2 }
  },
  params: { other: 'blah' }
}

describe('aggregator', () => {
  test("Test condensed metric data when there is only one data point", () => {
    agg.store('foo', 'bar', { misc: 'params' }, { value: 1 })
    expect(agg.get('foo', 'bar').params.misc).toEqual('params')
    expect(agg.get('foo', 'bar').metrics.value.min).toBeUndefined()
    expect(agg.get('foo', 'bar').metrics.value.max).toBeUndefined()
    expect(agg.get('foo', 'bar').metrics.value.sos).toBeUndefined()
    expect(agg.get('foo', 'bar').metrics.value.c).toBeUndefined()
    expect(agg.get('foo', 'bar').metrics.value.t).toEqual(1)
    expect(agg.get('foo', 'bar').metrics.count).toEqual(1)
  })


  test("Test metric data aggregation", () => {
    agg.store('foo', 'bar', { other: 'blah' }, { value: 2 })
    agg.store('foo', 'bar', null, { value: 3 })
    agg.store('foo', 'bar', { misc: 'stomp' }, { value: 5 })
    agg.store('foo', 'bar', {}, { value: 4 })

    expect(agg.get('foo', 'bar').metrics.value.min).toEqual(1)
    expect(agg.get('foo', 'bar').metrics.value.max).toEqual(5)
    expect(agg.get('foo', 'bar').metrics.value.t).toEqual(15)
    expect(agg.get('foo', 'bar').metrics.value.sos).toEqual(55)
    expect(agg.get('foo', 'bar').metrics.value.c).toEqual(5)
    expect(agg.get('foo', 'bar').metrics.count).toEqual(5)

    agg.store('foo', 'asdf', { blah: 2 }, { value: 'asd' })
    agg.store('foo', 'qwerty')

    expect(agg.get('foo').bar).toEqual(agg.get('foo', 'bar'))
    expect(agg.get('foo', 'asdf').metrics.count).toEqual(1)
    expect(agg.get('blah')).toBeUndefined()
    expect(agg.get('blah', 'blah')).toBeUndefined()
    expect(agg.get('foo', 'blah')).toBeUndefined()

    var payload = agg.take(['foo'])
    expect(payload.foo.length).toEqual(3)
    expect(payload.blah).toBeUndefined()

    expect(agg.take(['foo'])).toBeFalsy()

  })
  
  test('params set when metric merged', () =>  {
    agg.take(['paramTest'])
    var testParams = {
      value: 'param',
      example: 'example'
    }
  
    agg.merge('paramTest', 'bar', singleValueMetric.metrics, testParams)
    var params = agg.take(['paramTest']).paramTest[0].params
  
    expect(params).toEqual(testParams)
  })
  
  test('get and take return the same data', () =>  {
    // plan count is the sum of unique type/name combinations (first 2 store arguments)
    agg.store('foo', 'bar', { name: 'bar' }, { value: 3 })
    agg.store('foo', 'bar', { name: 'bar' }, { value: 4 })
    agg.store('foo', 'foo', { name: 'foo' }, { value: 2 })
    agg.store('bar', 'foo', { name: 'foo' }, { value: 3 })
    agg.store('bar', 'bar', { name: 'bar' }, { value: 4 })
  
    var getMetrics = {
      foo: agg.get('foo'),
      bar: agg.get('bar')
    }
    var takeMetrics = agg.take(['foo', 'bar'])
  
    for (var type in takeMetrics) {
      takeMetrics[type].forEach(function (takeMetric) {
        var name = takeMetric.params.name
        var getMetric = getMetrics[type][name]
        var hint = `type: ${type} name: ${name}`
  
        expect(takeMetric.params).toEqual(getMetric.params)
        expect(takeMetric.metrics).toEqual(getMetric.metrics)
      })
    }
  })
  
  test('merge single-value metric when there is no data in aggregator', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[singleValueMetric -> no-data]
    agg.merge('merge', 'bar', singleValueMetric.metrics, singleValueMetric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(1)
    expect(metrics.value.t).toEqual(singleValueMetric.metrics.value.t)
  })
  
  test('merge metric when there is no data in aggregator', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[metric -> no-data]
    agg.merge('merge', 'bar', metric.metrics, metric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(metric.metrics.count)
    expect(metrics.value.t).toEqual(metric.metrics.value.t)
    expect(metrics.value.min).toEqual(metric.metrics.value.min)
    expect(metrics.value.max).toEqual(metric.metrics.value.max)
    expect(metrics.value.sos).toEqual(metric.metrics.value.sos)
    expect(metrics.value.c).toEqual(metric.metrics.value.c)
  })
  
  test('merge single-value metric into single-value metric', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[singleValueMetric -> singleValueMetric]
    agg.store('merge', 'bar', { other: 'blah' }, { value: 2 })
    agg.merge('merge', 'bar', singleValueMetric.metrics, singleValueMetric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(2)
    expect(metrics.value.t).toEqual(6)
    expect(metrics.value.min).toEqual(2)
    expect(metrics.value.max).toEqual(4)
    expect(metrics.value.sos).toEqual(20)
    expect(metrics.value.c).toEqual(2)
  })
  
  test('merge metric into single-value metric', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[metric -> singleValueMetric]
    agg.store('merge', 'bar', { other: 'blah' }, { value: 3 })
    agg.merge('merge', 'bar', metric.metrics, metric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(3)
    expect(metrics.value.t).toEqual(9)
    expect(metrics.value.min).toEqual(3)
    expect(metrics.value.max).toEqual(3)
    expect(metrics.value.sos).toEqual(27)
    expect(metrics.value.c).toEqual(3)
  })
  
  test('merge single-value metric into metric', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[singleValueMetric -> metric]
    agg.store('merge', 'bar', { other: 'blah' }, { value: 2 })
    agg.store('merge', 'bar', { other: 'blah' }, { value: 3 })
    agg.merge('merge', 'bar', singleValueMetric.metrics, singleValueMetric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(3)
    expect(metrics.value.t).toEqual(9)
    expect(metrics.value.min).toEqual(2)
    expect(metrics.value.max).toEqual(4)
    expect(metrics.value.sos).toEqual(29)
    expect(metrics.value.c).toEqual(3)
  })
  
  test('merge metric into metric', () =>  {
    // clear aggregator
    agg.take(['merge'])
  
    // merge[metric -> metric]
    agg.store('merge', 'bar', { other: 'blah' }, { value: 1 })
    agg.store('merge', 'bar', { other: 'blah' }, { value: 2 })
    agg.merge('merge', 'bar', metric.metrics, metric.params)
  
    // validate
    var metrics = agg.get('merge').bar.metrics
    expect(metrics.count).toEqual(4)
    expect(metrics.value.t).toEqual(9)
    expect(metrics.value.min).toEqual(1)
    expect(metrics.value.max).toEqual(3)
    expect(metrics.value.sos).toEqual(23)
    expect(metrics.value.c).toEqual(4)
  })
})


