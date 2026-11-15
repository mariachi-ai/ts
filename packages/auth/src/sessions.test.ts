import { sessionStoreContract } from './sessions.contract';
import { InMemorySessionStore } from './sessions';

// DrizzleSessionStore runs the same suite in postgres/auth.integration.test.ts.
sessionStoreContract('memory', () => new InMemorySessionStore());
