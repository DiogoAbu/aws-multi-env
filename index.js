#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const exec = require('util').promisify(require('child_process').exec);

const fg = require('fast-glob');

const { argv } = require('./cli');

const tempPath = path.join(argv.tempDir, 'aws-multi-env');
const nameEnvMatcher = /.+[.][a-z]+\..+$/;
const tab = ' '.repeat('5');

/**
 * Check deployment environment and decide whether to include files
 */
(async () => {
  const environment = await getCurrentEnvironment([
    { environment: 'prod', branch: 'main' },
    { environment: 'staging', branch: 'beta' },
  ]);

  const touchedFiles = await prepareFiles({ environment });

  await buildAndDeploy({ environment, touchedFiles });
})();

/**
 * Check args and branch to decide current environment
 * @param {{ environment: string, branch: string }[]} environments
 * @returns environment name
 */
async function getCurrentEnvironment(environments) {
  // Check which configured environment ends with provided environment
  const foundEnv = environments.find(({ environment }) => {
    const isExpectedEnvironment = argv.env.endsWith(`-${environment}`);
    if (isExpectedEnvironment) {
      process.stdout.write(`📄 Environment: ${environment}\n`);
      return true;
    }
    return false;
  });
  if (foundEnv) {
    return foundEnv.environment;
  }

  // Get current branch
  const { stdout, stderr } = await exec('git branch --show-current');
  if (stderr) {
    process.stderr.write(stderr);
    process.exit(1);
  }
  const currentBranch = stdout.trim();

  // Check if current branch matchs any of the configured environments
  const foundEnvFromBranch = environments.find(({ environment, branch }) => {
    const isExpectedBranch = currentBranch === branch;
    if (isExpectedBranch) {
      process.stdout.write(`📄 Environment: ${environment} (from branch: ${branch})\n`);
      return true;
    }
    return false;
  });
  if (foundEnvFromBranch) {
    return foundEnvFromBranch.environment;
  }

  process.stderr.write('Failed to find environment!\n');
  process.exit(1);
  return '';
}

/**
 * Build and deploy by running commands
 * @param {{ environment: string, touchedFiles: string[] }} options
 */
async function buildAndDeploy({ environment, touchedFiles }) {
  process.stdout.write(`📦 Building\n${tab}${argv.buildCmd}\n`);
  try {
    await exec(argv.buildCmd);
  } catch (err) {
    await revertFiles({ environment, touchedFiles });
    process.stdout.write(err.stdout);
    process.stderr.write(err.stderr);
    process.exit(1);
  }

  await revertFiles({ environment, touchedFiles });

  if (argv.skipDeploy) {
    process.stdout.write('🚀 Skipping deploy\n');
  } else {
    const deployCmd = `${argv.deployCmd} ${argv.env}`;
    process.stdout.write(`🚀 Deploying\n${tab}${deployCmd}\n`);
    await exec(deployCmd);
  }
}

/**
 * Rename files to remove prepended environment
 * @param {{ environment: string }} options
 * @returns files that were renamed or removed, still includes the prepended environment
 */
async function prepareFiles({ environment }) {
  const files = await fg(argv.source, { dot: true, onlyFiles: true });
  if (!files.length) {
    process.stdout.write('📁 No files found to rename\n');
    return files;
  }

  process.stdout.write(`📁 Renaming files from "${environment}" to correct name, and removing other files\n`);
  const touchedFiles = [];

  for (const filename of files) {
    const basename = path.basename(filename);

    const isEnvironmentFile = nameEnvMatcher.test(basename);
    if (!isEnvironmentFile) {
      // File is not environment specific, keep it
      process.stdout.write(`${tab}Keep: ${filename}\n`);
      continue;
    }

    if (basename.includes(`${environment}.`)) {
      // Name has environment and is the one expected, rename it
      const filenameWithoutEnv = filename.replace(`${environment}.`, '');
      await fs.rm(filenameWithoutEnv, { force: true });
      await fs.rename(filename, filenameWithoutEnv);
      process.stdout.write(`${tab}Renamed: ${filename} => ${filenameWithoutEnv}\n`);
    } else {
      // File is from other environment, remove it
      const tempFilename = path.join(tempPath, filename);
      await fs.mkdir(path.dirname(tempFilename), { recursive: true });
      await fs.copyFile(filename, tempFilename); // use copy file to bypass partition boundaries as temp dir can be on a different one
      await fs.rm(filename, { force: true });
      process.stdout.write(`${tab}Removed: ${filename}\n`);
    }
    touchedFiles.push(filename);
  }

  return touchedFiles;
}

/**
 * Rename files back to original
 * @param {{ environment: string, touchedFiles: string[] }} options
 */
async function revertFiles({ environment, touchedFiles }) {
  if (!touchedFiles.length) {
    process.stdout.write('📁 No files found to revert\n');
    return;
  }

  process.stdout.write(`📁 Renaming files back to "${environment}", and restoring removed files\n`);

  for (const filename of touchedFiles) {
    const basename = path.basename(filename);

    if (basename.includes(`${environment}.`)) {
      // Name has environment, rename it back to original with environment
      const filenameWithoutEnv = filename.replace(`${environment}.`, '');
      await fs.rename(filenameWithoutEnv, filename);
      process.stdout.write(`${tab}Renamed: ${filenameWithoutEnv} => ${filename}\n`);
    } else {
      // File is from other environment, restore it
      const tempFilename = path.join(tempPath, filename);
      await fs.copyFile(tempFilename, filename);
      process.stdout.write(`${tab}Restored: ${filename}\n`);
    }
  }

  await fs.rm(tempPath, { recursive: true, force: true });
}
