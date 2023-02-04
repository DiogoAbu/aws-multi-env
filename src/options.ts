import type { Options } from 'yargs';

export interface Argv {
  env?: string;
  envs: Record<string, string | string[] | null>;
  source: string[];
  envMatcher: string;
  envMatcherSeparator: string;
  dryRun: boolean;

  // Dynamically set
  currentEnv: string;
}

export const options: Record<string, Options> = {
  env: {
    describe:
      'Environment name to deploy and match files to, it will match the last portion of the name: `app-server-prod` will match `prod`. If no environment was matched, will match from branches.',
    type: 'string',
  },
  envs: {
    describe:
      'Acceptable environments, optionally mapped to branches. Example: --envs.prod --envs.staging=beta',
    demandOption: 'Please provide at least one environment. Example: --envs.prod --envs.staging=beta',
    type: 'string',
  },
  source: {
    describe: 'Array of glob folders to find files.',
    type: 'array',
    default: ['./.ebextensions/**', './.platform/**'] as const,
  },
  envMatcher: {
    describe: 'Regex to match if file is environment specific.',
    type: 'string',
    default: '.+[.][a-z]+\\..+$',
  },
  envMatcherSeparator: {
    describe: 'The environment separator on file names.',
    type: 'string',
    default: '.',
  },
  dryRun: {
    describe: 'Run without making any actual changes.',
    type: 'boolean',
    default: false,
  },
};
