import fs from 'fs';
import path from 'path';

import test from 'ava';

import { cleanFileSystem, createFileSystem, findJSON, runCommand } from './utils';

/* eslint-disable @typescript-eslint/naming-convention*/
const tmpDir = 'tmp';

const jsonVol = {
  '.ebextensions/migration.config': '',
  '.ebextensions/ssl.staging.config': '',
};
/* eslint-enable @typescript-eslint/naming-convention*/

test.before('create file system', (t) => {
  const dirPath = createFileSystem(tmpDir, jsonVol);
  Object.keys(jsonVol).map((filePath) => {
    const fullPath = path.join(dirPath, filePath);
    t.assert(fs.existsSync(fullPath), `File does not exists: ${filePath}`);
  });
});

test.serial('load correct environment', async (t) => {
  // Test prod
  const { stdout: stdoutProd, stderr: stderrProd } = await runCommand(
    'config',
    `--dry-run --env=app-server-prod --envs.prod=main --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrProd.length === 0, `Error on command config: ${stderrProd}`);
  t.like(findJSON(stdoutProd), {
    dryRun: true,
    currentEnv: 'prod',
    env: 'app-server-prod',
    envs: { prod: 'main' },
    source: [`./${tmpDir}/.ebextensions/**`],
  });

  // Test staging
  const { stdout: stdoutStaging, stderr: stderrStaging } = await runCommand(
    'config',
    `--dry-run --env=app-server-staging --envs.prod=main --envs.staging=beta --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrStaging.length === 0, `Error on command config: ${stderrStaging}`);
  t.like(findJSON(stdoutStaging), {
    dryRun: true,
    currentEnv: 'staging',
    env: 'app-server-staging',
    envs: { prod: 'main', staging: 'beta' },
    source: [`./${tmpDir}/.ebextensions/**`],
  });

  // Test loading current env from branch
  const testBranch = process.env.TEST_BRANCH;
  if (testBranch) {
    const { stdout: stdoutBranch, stderr: stderrBranch } = await runCommand(
      'config',
      `--dry-run --envs.prod=main --envs.staging=beta --envs.staging=${testBranch} --source="./${tmpDir}/.ebextensions/**"`,
    );
    t.assert(stderrBranch.length === 0, `Error on command config: ${stderrBranch}`);
    t.like(findJSON(stdoutBranch), {
      dryRun: true,
      currentEnv: 'staging',
      envs: { prod: 'main', staging: ['beta', testBranch] },
      source: [`./${tmpDir}/.ebextensions/**`],
    });
  }

  // Test when fails to find from branch
  const commandFail = runCommand(
    'config',
    `--dry-run --envs.prod=invalid-branch --source="./${tmpDir}/.ebextensions/**"`,
  );
  const error = await t.throwsAsync(commandFail);
  t.assert(error?.message.includes('Failed to find environment'), `${error?.message}`);
});

test.serial('prepare prod environment', async (t) => {
  const { stdout: stdoutDry, stderr: stderrDry } = await runCommand(
    'prepare',
    `--dry-run --env=app-server-prod --envs.prod=main --envs.staging=beta --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrDry.length === 0, `Error on command prepare: ${stderrDry}`);

  t.assert(stdoutDry.includes('Running on dry run mode'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Current environment: prod'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Working tree on source folders is clean'), `${stdoutDry}`);

  t.assert(
    stdoutDry.includes('Renaming files from "prod" to correct name, and removing other files'),
    `${stdoutDry}`,
  );
  t.assert(stdoutDry.includes(`Keep: ./${tmpDir}/.ebextensions/migration.config`), `${stdoutDry}`);
  t.assert(stdoutDry.includes(`Removed: ./${tmpDir}/.ebextensions/ssl.staging.config`), `${stdoutDry}`);

  t.assert(stdoutDry.includes('Environment ready, files were renamed and/or removed'), `${stdoutDry}`);
});

test.serial('revert prod environment', async (t) => {
  const { stdout: stdoutDry, stderr: stderrDry } = await runCommand(
    'revert',
    `--dry-run --env=app-server-prod --envs.prod=main --envs.staging=beta --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrDry.length === 0, `Error on command revert: ${stderrDry}`);

  t.assert(stdoutDry.includes('Running on dry run mode'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Current environment: prod'), `${stdoutDry}`);

  t.assert(stdoutDry.includes('Renaming files back and restoring removed files'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Running: git clean'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Running: git checkout'), `${stdoutDry}`);

  t.assert(stdoutDry.includes('Environment restored'), `${stdoutDry}`);
});

test.serial('prepare staging environment', async (t) => {
  const { stdout: stdoutDry, stderr: stderrDry } = await runCommand(
    'prepare',
    `--dry-run --env=app-server-staging --envs.prod=main --envs.staging=beta --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrDry.length === 0, `Error on command prepare: ${stderrDry}`);

  t.assert(stdoutDry.includes('Running on dry run mode'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Current environment: staging'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Working tree on source folders is clean'), `${stdoutDry}`);

  t.assert(
    stdoutDry.includes('Renaming files from "staging" to correct name, and removing other files'),
    `${stdoutDry}`,
  );
  t.assert(stdoutDry.includes(`Keep: ./${tmpDir}/.ebextensions/migration.config`), `${stdoutDry}`);
  t.assert(
    stdoutDry.includes(
      `Renamed: ./${tmpDir}/.ebextensions/ssl.staging.config => ./${tmpDir}/.ebextensions/ssl.config`,
    ),
    `${stdoutDry}`,
  );

  t.assert(stdoutDry.includes('Environment ready, files were renamed and/or removed'), `${stdoutDry}`);
});

test.serial('revert staging environment', async (t) => {
  const { stdout: stdoutDry, stderr: stderrDry } = await runCommand(
    'revert',
    `--dry-run --env=app-server-staging --envs.prod=main --envs.staging=beta --source="./${tmpDir}/.ebextensions/**"`,
  );
  t.assert(stderrDry.length === 0, `Error on command revert: ${stderrDry}`);

  t.assert(stdoutDry.includes('Running on dry run mode'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Current environment: staging'), `${stdoutDry}`);

  t.assert(stdoutDry.includes('Renaming files back and restoring removed files'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Running: git clean'), `${stdoutDry}`);
  t.assert(stdoutDry.includes('Running: git checkout'), `${stdoutDry}`);

  t.assert(stdoutDry.includes('Environment restored'), `${stdoutDry}`);
});

test.after.always('clean up file system', (t) => {
  const dirPath = cleanFileSystem(tmpDir);
  t.assert(!fs.existsSync(dirPath));
});
