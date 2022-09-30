#!/usr/bin/env node

const os = require('os');

const yargs = require('yargs/yargs');

const processArgs = process.argv.slice(2);

module.exports = yargs(processArgs)
  .option('env', {
    type: 'string',
    demandOption: 'Please provide an environment name',
    describe:
      'Environment name to deploy and match files to, it will match the last portion of the name: `app-server-prod` will match `prod`. If no environment was matched, will get from branch name: `main` = `prod`, beta = `staging`.',
  })
  .option('source', {
    default: ['./.ebextensions/**', './.platform/**'],
    type: 'array',
    describe: 'Array of glob folders to find files.',
  })
  .option('buildCmd', {
    default: 'yarn build-and-zip',
    type: 'string',
    describe: 'Command to run when files were renamed/removed and are ready.',
  })
  .option('deployCmd', {
    default: 'eb deploy',
    type: 'string',
    describe: 'Command to run after build, at this point the files were reverted and are no longer ready.',
  })
  .option('skipDeploy', {
    default: false,
    type: 'boolean',
    describe:
      'Setting this to true will skip the deploy command. The --env will be appended to this command.',
  })
  .option('tempDir', {
    default: os.tmpdir(),
    type: 'string',
    describe:
      'Directory to place files that are not from the current environment, will be removed once script is done.',
  });
