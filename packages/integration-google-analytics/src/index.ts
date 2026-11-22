export { createGoogleAnalytics, type GoogleAnalytics, type GoogleAnalyticsDeps } from './client';
export { GoogleAnalyticsError } from './errors';
export { gtagSnippet, gtagCsp, consentUpdate, CONSENT_TYPES, GTAG_SCRIPT_PATH, type ConsentGrant, type ConsentType, type GtagSnippetOptions } from './tag';
export { gaCookies } from './cookies';
export { signUp, login, purchase, generateLead } from './events';
export { reportRows, type ReportRow } from './reports';
export { provider, settings, configSchema, envNames, operations, type GoogleAnalyticsConfig, type GoogleAnalyticsOperation } from './generated';
export type { EventItem, GaEvent, Report, RunRealtimeReportInput, RunReportInput, SendEventsInput, ValidationMessage } from './schemas';
