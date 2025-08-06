// 发布流程编排
// 1. 确定变动版本级别 patch | minor | major, 遵循semver规范
// 2. 执行测试
// 3. 自动修改包版本
// 4. 执行pnpm build
// 5. 生成CHANGELOG.md
// 6. release commit
// 7. 执行npm publish
// 8. git push 并打tag
import execa from 'execa';
import chalk from 'chalk';
import semver from 'semver';
import { prompt } from 'enquirer';
import minimist from 'minimist';
import { createRequire } from 'module';
import fs from 'fs-extra';
import path from 'path';

const require = createRequire(import.meta.url);
const args = minimist(process.argv.slice(2));
const isDry = args.dry;

const versionIncrements = ['patch', 'minor', 'major'] as const;

const pkg = require('../package.json');
const currentVersion = pkg.version;

const directRun = (bin: string, args: string[]) => {
  return execa(bin, args, {
    stdio: 'inherit'
  });
};

const dryRun = (bin: string, args: string[]) => {
  console.log(chalk.blue(`[dry run] ${bin} ${args.join(' ')}`));
  return;
};

const run = isDry ? dryRun : directRun;
const step = (msg) => console.log(chalk.cyan(msg));

function updateVersion(version: string) {
  pkg.version = version;
  fs.writeFileSync(
    path.resolve(__dirname, '../package.json'),
    JSON.stringify(pkg, null, 2)
  );
}

async function main() {
  const { release } = await prompt<{ release: string }>({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: versionIncrements.map(
      (i) => `${i} (${semver.inc(currentVersion, i)})`
    )
  });
  console.log(release);
  const targetVersion = release.match(/\((.*)\)/)![1];

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: `Release ${targetVersion}. Confirm?`
  });

  if (!confirm) {
    return;
  }

  step('\nRunning tests...');
  await run('pnpm', ['test:unit']);
  await run('pnpm', ['test:e2e']);

  if (!isDry) {
    step('\nUpdating version...');
    updateVersion(targetVersion);
  }
  step('\nBuilding package...');
  await run('pnpm', ['build']);

  step('\nGenerating changelog...');
  await run('pnpm', ['changelog']);

  step('\nCommitting changes...');
  await run('git', ['add', '-A']);
  await run('git', ['commit', '-m', `'release: v${targetVersion}'`]);

  step('\nPublishing package...');
  await run('pnpm', ['publish', '--access', 'public']);

  step('\nPushing to remote...');
  await run('git', ['tag', `v${targetVersion}`]);
  await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);

  await run('git', ['push']);
}

main().catch((err) => {
  console.error(err);
  updateVersion(currentVersion);
});
