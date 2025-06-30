import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { describe, expect, test } from 'vitest';

describe('Markdown compile cases', async () => {
  const processor = unified();

  processor.use(remarkParse).use(remarkRehype).use(rehypeStringify);

  test('Compile title', async () => {
    const mdContent = '# 123';
    const result = await processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<h1>123</h1>"');
  });

  test('Compile code', async () => {
    const mdContent = 'I am using `Island.js`';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(
      '"<p>I am using <code>Island.js</code></p>"'
    );
  });
});
