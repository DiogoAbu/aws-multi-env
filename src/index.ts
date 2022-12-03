#!/usr/bin/env node

import type { Argv } from './options';

import { cosmiconfigSync } from 'cosmiconfig';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import config from './commands/config';
import prepare from './commands/prepare';
import revert from './commands/revert';
import { currentEnv } from './middlewares/current-env';
import { dryRun } from './middlewares/dry-run';
import { options } from './options';

const moduleName = 'aws-multi-env';

// Configure yargs
const yargsInstance = yargs(hideBin(process.argv))
  .scriptName(moduleName)
  .demandCommand()
  .recommendCommands()
  .strict()
  .wrap(yargs.terminalWidth()) as yargs.Argv<Argv>;

// Load config file
const explorerSync = cosmiconfigSync(moduleName);
const cosmiconfig = explorerSync.search();
yargsInstance.config((cosmiconfig?.config as object) || {});

// Add middlewares
yargsInstance.middleware(dryRun).middleware(currentEnv);

// Add commands
yargsInstance.command(config).command(prepare).command(revert);

// Add options
yargsInstance.options(options);

// Init cli
void yargsInstance.argv;
