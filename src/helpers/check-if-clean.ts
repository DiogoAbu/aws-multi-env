import type { Argv } from '../options';

import { isWorkingTreeClean } from '../utils/is-working-tree-clean';
import { logger } from '../utils/logger';

export const checkIfClean = async ({ source, dryRun }: Argv): Promise<void> => {
  const dirs = source.join(' ');
  const isClean = await isWorkingTreeClean(dirs);

  if (!isClean) {
    if (dryRun) {
      logger.log(
        'Script can only run on clean working trees on source folders (Allowing because this is a dry run)',
      );
      return;
    }

    logger.error('Script can only run on clean working trees on source folders');
    process.exit(1);
  }

  logger.log('Working tree on source folders is clean');
};
