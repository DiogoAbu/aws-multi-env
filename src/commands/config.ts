import type { Argv } from '../options';
import type { CommandModule } from 'yargs';

import { logger } from '../utils/logger';

const command: CommandModule<Argv, Argv>['command'] = 'config';

const describe: CommandModule<Argv, Argv>['describe'] = 'Output loaded configuration';

const handler: CommandModule<Argv, Argv>['handler'] = (argv) => {
  logger.log(argv);
};

export default {
  command,
  describe,
  handler,
};
