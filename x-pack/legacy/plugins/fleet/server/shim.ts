/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import KbnServer from 'src/legacy/server/kbn_server';
import { ElasticsearchPlugin } from 'src/legacy/core_plugins/elasticsearch';
import { SecurityPluginSetup as SecurityPlugin } from '../../../../plugins/security/server';
import {
  outputService as IngestOutputLib,
  agentConfigService as IngestPolicyLib,
} from '../../../../plugins/ingest_manager/server';
import {
  EncryptedSavedObjectsPluginSetup as EncryptedSavedObjectsSetupContract,
  EncryptedSavedObjectsPluginStart as EncryptedSavedObjectsStartContract,
} from '../../../../plugins/encrypted_saved_objects/server';

export interface IngestPluginStartContract {
  outputs: typeof IngestOutputLib;
  policies: typeof IngestPolicyLib;
}

export interface FleetPluginsStart {
  security: SecurityPluginStartContract;
  ingest: IngestPluginStartContract;
  encryptedSavedObjects: EncryptedSavedObjectsStartContract;
  elasticsearch: ElasticsearchPlugin;
}

export interface FleetPluginsSetup {
  encryptedSavedObjects: EncryptedSavedObjectsSetupContract;
}

export type SecurityPluginSetupContract = Pick<SecurityPlugin, '__legacyCompat'>;
export type SecurityPluginStartContract = Pick<SecurityPlugin, 'authc'>;

export function shim(server: any) {
  const newPlatform = ((server as unknown) as KbnServer).newPlatform;
  const pluginsStart: FleetPluginsStart = {
    elasticsearch: server.plugins.elasticsearch,
    security: newPlatform.setup.plugins.security as SecurityPluginStartContract,
    ingest: {
      outputs: IngestOutputLib,
      policies: IngestPolicyLib,
    },
    encryptedSavedObjects: newPlatform.start.plugins
      .encryptedSavedObjects as EncryptedSavedObjectsStartContract,
  };
  const pluginsSetup: FleetPluginsSetup = {
    encryptedSavedObjects: newPlatform.setup.plugins
      .encryptedSavedObjects as EncryptedSavedObjectsSetupContract,
  };

  return {
    pluginsStart,
    pluginsSetup,
  };
}
