/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import {
  TreeOptions,
  Tree,
  EndpointDocGenerator,
  Event,
} from '../../../plugins/security_solution/common/endpoint/generate_data';
import { FtrProviderContext } from '../ftr_provider_context';

const processIndex = 'logs-endpoint.events.process-default';

/**
 * Options for build a resolver tree
 */
export interface Options extends TreeOptions {
  /**
   * Number of trees to generate.
   */
  numTrees?: number;
  seed?: string;
}

/**
 * Structure containing the generated trees and the ES index they live in
 */
export interface GeneratedTrees {
  trees: Tree[];
  indices: string[];
}

/**
 * Structure containing the events inserted into ES and the index they live in
 */
export interface InsertedEvents {
  events: Event[];
  indices: string[];
}

interface BulkCreateHeader {
  create: {
    _index: string;
  };
}

export function ResolverGeneratorProvider({ getService }: FtrProviderContext) {
  const client = getService('es');

  return {
    async insertEvents(
      events: Event[],
      eventsIndex: string = processIndex
    ): Promise<InsertedEvents> {
      const body = events.reduce((array: Array<BulkCreateHeader | Event>, doc) => {
        array.push({ create: { _index: eventsIndex } }, doc);
        return array;
      }, []);
      await client.bulk({ body, refresh: 'true' });
      return { events, indices: [eventsIndex] };
    },
    async createTrees(
      options: Options,
      eventsIndex: string = processIndex,
      alertsIndex: string = 'logs-endpoint.alerts-default'
    ): Promise<GeneratedTrees> {
      const seed = options.seed || 'resolver-seed';
      const allTrees: Tree[] = [];
      const generator = new EndpointDocGenerator(seed);
      const numTrees = options.numTrees ?? 1;
      for (let j = 0; j < numTrees; j++) {
        const tree = generator.generateTree(options);
        const body = tree.allEvents.reduce((array: Array<BulkCreateHeader | Event>, doc) => {
          let index = eventsIndex;
          if (doc.event.kind === 'alert') {
            index = alertsIndex;
          }
          /**
           * We're using data streams which require that a bulk use `create` instead of `index`.
           */
          array.push({ create: { _index: index } }, doc);
          return array;
        }, []);
        // force a refresh here otherwise the documents might not be available when the tests search for them
        await client.bulk({ body, refresh: 'true' });
        allTrees.push(tree);
      }
      return { trees: allTrees, indices: [eventsIndex, alertsIndex] };
    },
    async deleteData(genData: { indices: string[] }) {
      for (const index of genData.indices) {
        /**
         * The ingest manager handles creating the template for the endpoint's indices. It is using a V2 template
         * with data streams. Data streams aren't included in the javascript elasticsearch client in kibana yet so we
         * need to do raw requests here. Delete a data stream is slightly different than that of a regular index which
         * is why we're using _data_stream here.
         */
        await client.transport.request({
          method: 'DELETE',
          path: `_data_stream/${index}`,
        });
      }
    },
  };
}
