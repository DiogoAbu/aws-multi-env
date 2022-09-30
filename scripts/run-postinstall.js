#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const postinstallFile = path.join(process.cwd(), '.postinstall');
if (fs.existsSync(postinstallFile)) {
  const child = exec('yarn patch-package');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}
