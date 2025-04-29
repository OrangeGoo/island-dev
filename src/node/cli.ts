import cac from 'cac';
import { createDevServer } from './dev';
import { build } from './build';

const cli = cac('island').version('0.0.1').help();

// 1. bin 字段
// 2. npm link
// 3. island dev

cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  const server = await createDevServer(root);
  await server.listen();
  server.printUrls();
});

cli
  .command('build [root]', 'build in production')
  .action(async (root: string) => {
    await build(root);
  });

cli.parse();
