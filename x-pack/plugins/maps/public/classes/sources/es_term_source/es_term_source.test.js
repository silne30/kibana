/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ESTermSource, extractPropertiesMap } from './es_term_source';

jest.mock('../../layers/vector_layer/vector_layer', () => {});

const indexPatternTitle = 'myIndex';
const termFieldName = 'myTermField';
const sumFieldName = 'myFieldGettingSummed';
const metricExamples = [
  {
    type: 'sum',
    field: sumFieldName,
    label: 'my custom label',
  },
  {
    // metric config is invalid beause field is missing
    type: 'max',
  },
  {
    // metric config is valid because "count" metric does not need to provide field
    type: 'count',
    label: '', // should ignore empty label fields
  },
];

describe('getMetricFields', () => {
  it('should override name and label of count metric', async () => {
    const source = new ESTermSource({
      id: '1234',
      indexPatternTitle: indexPatternTitle,
      term: termFieldName,
      indexPatternId: 'foobar',
    });
    const metrics = source.getMetricFields();
    expect(metrics[0].getName()).toEqual('__kbnjoin__count__1234');
    expect(await metrics[0].getLabel()).toEqual('Count of myIndex');
  });

  it('should override name and label of sum metric', async () => {
    const source = new ESTermSource({
      id: '1234',
      indexPatternTitle: indexPatternTitle,
      term: termFieldName,
      metrics: metricExamples,
      indexPatternId: 'foobar',
    });
    const metrics = source.getMetricFields();
    expect(metrics[0].getName()).toEqual('__kbnjoin__sum_of_myFieldGettingSummed__1234');
    expect(await metrics[0].getLabel()).toEqual('my custom label');
    expect(metrics[1].getName()).toEqual('__kbnjoin__count__1234');
    expect(await metrics[1].getLabel()).toEqual('Count of myIndex');
  });
});

describe('extractPropertiesMap', () => {
  const minPropName = '__kbnjoin__min_of_avlAirTemp__1234';
  const responseWithNumberTypes = {
    aggregations: {
      join: {
        buckets: [
          {
            key: 109,
            doc_count: 1130,
            [minPropName]: {
              value: 36,
            },
          },
          {
            key: 62,
            doc_count: 448,
            [minPropName]: {
              value: 0,
            },
          },
        ],
      },
    },
  };
  const countPropName = '__kbnjoin__count__1234';

  let propertiesMap;
  beforeAll(() => {
    propertiesMap = extractPropertiesMap(responseWithNumberTypes, countPropName);
  });

  it('should create key for each join term', () => {
    expect(propertiesMap.has('109')).toBe(true);
    expect(propertiesMap.has('62')).toBe(true);
  });

  it('should extract count property', () => {
    const properties = propertiesMap.get('109');
    expect(properties[countPropName]).toBe(1130);
  });

  it('should extract min property', () => {
    const properties = propertiesMap.get('109');
    expect(properties[minPropName]).toBe(36);
  });

  it('should extract property with value of "0"', () => {
    const properties = propertiesMap.get('62');
    expect(properties[minPropName]).toBe(0);
  });
});
