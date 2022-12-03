import type { Argv } from '../options';
import type { MiddlewareFunction } from 'yargs';

import { logger } from '../utils/logger';

export const dryRun: MiddlewareFunction<Argv> = (argv) => {
  if (argv.dryRun) {
    logger.warn('Running on dry run mode, no changes will be made');
  }
};
