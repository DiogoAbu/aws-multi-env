import type { Argv } from '../options';
import type { MiddlewareFunction } from 'yargs';

import { execAsync } from '../utils/exec-async';
import { logger } from '../utils/logger';

export const currentEnv: MiddlewareFunction<Argv> = async (argv) => {
  // Check if environment is on configured envs
  if (argv.env && argv.env in argv.envs) {
    logger.log('Current environment:', argv.env);
    argv.currentEnv = argv.env;
    return;
  }

  // Check which configured environment ends with provided environment
  const foundEnv = Object.keys(argv.envs).find((envName) => {
    const isExpectedEnvironment = argv.env?.endsWith(`-${envName}`);
    return isExpectedEnvironment;
  });
  if (foundEnv) {
    logger.log('Current environment:', foundEnv);
    argv.currentEnv = foundEnv;
    return;
  }

  // Try getting environment from branches
  const { stdout, stderr: stderrBranch } = await execAsync('git branch --show-current');
  if (stderrBranch) {
    logger.error(`Git branch failed with the error message ${stderrBranch}.`);
    process.exit(1);
  }
  const currentBranch = stdout.trim();

  const foundEnvFromBranch = Object.keys(argv.envs).find((envName) => {
    if (Array.isArray(argv.envs[envName])) {
      return (argv.envs[envName] as string[]).find((branch) => branch === currentBranch);
    }
    if (typeof argv.envs[envName] === 'string') {
      return argv.envs[envName] === currentBranch;
    }
    return false;
  });
  if (foundEnvFromBranch) {
    logger.log(`Current environment (from branch ${currentBranch}):`, foundEnvFromBranch);
    argv.currentEnv = foundEnvFromBranch;
    return;
  }

  logger.error(`Failed to find environment (for branch ${currentBranch})`);
  process.exit(1);
};
