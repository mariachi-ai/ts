import { loadEnvFiles } from './env-files';
import { createProgram } from './program';

// The project's env files (package.json's mariachi.envFiles, else .env). Variables already set in the environment win.
loadEnvFiles(process.cwd());

createProgram().parse();
