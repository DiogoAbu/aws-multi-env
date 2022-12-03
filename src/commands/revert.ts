// git clean -dxf .  # REMOVE ignored/untracked files (in the current directory)
// git checkout -- . # ERASE changes in tracked files (in the current directory)
import type { Argv } from '../options';
import type { CommandModule } from 'yargs';

import { checkIfClean } from '../helpers/check-if-clean';
import { execAsync } from '../utils/exec-async';
import { logger } from '../utils/logger';

const tab = ' '.repeat(2);

const command: CommandModule<Argv, Argv>['command'] = 'revert';

const describe: CommandModule<Argv, Argv>['describe'] = 'Undo changes on source folders';

const handler: CommandModule<Argv, Argv>['handler'] = async (argv) => {
  await checkIfClean(argv);

  logger.log('Renaming files back and restoring removed files');

  const dirs = argv.source.join(' ');

  // Remove ignored/untracked files
  logger.log(`${tab}Running: git clean ${dirs}`);
  if (!argv.dryRun) {
    const { stderr: stderrClean } = await execAsync(`git clean -dxf ${dirs}`);
    if (stderrClean) {
      logger.error(`Git clean failed with the error message ${stderrClean}.`);
      process.exit(1);
    }
  }

  // Erase changes in tracked files
  logger.log(`${tab}Running: git checkout ${dirs}`);
  if (!argv.dryRun) {
    const { stderr: stderrCheckout } = await execAsync(`git checkout -- ${dirs}`);
    if (stderrCheckout) {
      logger.error(`Git checkout failed with the error message ${stderrCheckout}.`);
      process.exit(1);
    }
  }

  logger.success('Environment restored, files renamed back and/or restored');
};

export default {
  command,
  describe,
  handler,
};
