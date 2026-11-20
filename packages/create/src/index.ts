export {
  createProject,
  generateEntity,
  generateService,
  generateController,
  generateJob,
  generateIntegration,
  generatePage,
  generateSeed,
  generateEvent,
  generateSubscriber,
  generateWebhook,
  generateProcedure,
} from './generators';
export { validate, RULES } from './validate/index';
export { names, pluralize, eventNames, type Names, type NamesOptions, type EventNames } from './names';
export { parseFields, FIELD_TYPES, type EntityField, type FieldType } from './fields';
export { LAYOUT, MARKERS } from './layout';
export { MARIACHI_VERSION } from './version';
export { PROJECT_AUTH } from './types';
export { DEFAULT_KIT, DESIGN_KIT_DIR } from './templates/ui';
export { fillLocalSecrets, LOCAL_SECRETS } from './templates/local-auth';

export type {
  ProjectAuth,
  ProjectConfig,
  GenerateOptions,
  GenerateEntityConfig,
  GenerateServiceConfig,
  GenerateControllerConfig,
  GenerateJobConfig,
  GenerateIntegrationConfig,
  GeneratePageConfig,
  GenerateSeedConfig,
  GenerateEventConfig,
  GenerateSubscriberConfig,
  GenerateWebhookConfig,
  GenerateProcedureConfig,
  GenerateResult,
  ValidateOptions,
  ValidationResult,
  Violation,
} from './types';
export type { Rule } from './validate/rules';
