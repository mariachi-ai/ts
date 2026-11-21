import type { FirebaseConfig } from './generated';

/** What the browser's Firebase SDK takes in `initializeApp`: only the public settings. */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

/**
 * The config to hand the browser for `initializeApp(config)`, from the app's settings: the web API
 * key, auth domain and project id, which Firebase means to be public, and never the service
 * account. Serve it from an endpoint or render it into the page. `authDomain` defaults to
 * `<projectId>.firebaseapp.com`, the domain Firebase gives every project.
 */
export function firebaseWebConfig(config: Pick<FirebaseConfig, 'apiKey' | 'projectId' | 'authDomain'>): FirebaseWebConfig {
  return { apiKey: config.apiKey, authDomain: config.authDomain ?? `${config.projectId}.firebaseapp.com`, projectId: config.projectId };
}
