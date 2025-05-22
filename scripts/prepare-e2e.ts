import path from 'path';
import fse from 'fs-extra';
import * as execa from 'execa';

const exampleDir = path.resolve(__dirname, '../e2e/playground/basic');

const ROOT = path.resolve(__dirname, '..');

const defaultOptions = {
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdin
};

async function prepareE2E() {
  if (!fse.existsSync(path.resolve(__dirname, '../dist'))) {
    // pnpm build
    execa.commandSync('pnpm build', {
      cwd: ROOT,
      ...defaultOptions
    });
  }

  execa.commandSync('npx playwright install', {
    cwd: ROOT,
    ...defaultOptions
  });

  execa.commandSync('pnpm dev', {
    cwd: exampleDir,
    ...defaultOptions
  });
}

prepareE2E();
