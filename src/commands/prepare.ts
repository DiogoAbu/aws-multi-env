import type { Argv } from '../options';
import type { CommandModule } from 'yargs';

import fs from 'fs/promises';
import path from 'path';

import FastGlob from 'fast-glob';

import { checkIfClean } from '../helpers/check-if-clean';
import { logger } from '../utils/logger';

const tab = ' '.repeat(2);

const command: CommandModule<Argv, Argv>['command'] = 'prepare';

const describe: CommandModule<Argv, Argv>['describe'] =
  'Rename and remove files on source folder to match environment';

const handler: CommandModule<Argv, Argv>['handler'] = async (argv) => {
  await checkIfClean(argv);

  const files = await FastGlob(argv.source, { dot: true, onlyFiles: true });
  if (!files.length) {
    logger.warn('No files found to rename');
    return;
  }

  logger.log(`Renaming files from "${argv.currentEnv}" to correct name, and removing other files`);

  const nameEnvMatcher = RegExp(argv.envMatcher);

  for (const filename of files) {
    const basename = path.basename(filename);

    const isEnvironmentFile = nameEnvMatcher.test(basename);
    if (!isEnvironmentFile) {
      // File is not environment specific, keep it
      logger.log(`${tab}Keep: ${filename}`);
      continue;
    }

    if (basename.includes(`${argv.currentEnv}${argv.envMatcherSeparator}`)) {
      // Name has environment and is the one expected, rename it
      const filenameWithoutEnv = filename.replace(`${argv.currentEnv}.`, '');

      if (!argv.dryRun) {
        await fs.rm(filenameWithoutEnv, { force: true });
        await fs.rename(filename, filenameWithoutEnv);
      }

      logger.log(`${tab}Renamed: ${filename} => ${filenameWithoutEnv}`);
      continue;
    }

    // File is from other environment, remove it
    if (!argv.dryRun) {
      await fs.rm(filename, { force: true });
    }
    logger.log(`${tab}Removed: ${filename}`);
  }

  logger.success('Environment ready, files were renamed and/or removed');
};

export default {
  command,
  describe,
  handler,
};
