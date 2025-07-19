import pluginMdx from '@mdx-js/rollup';
import remarkGFM from 'remark-gfm';
import rehypePluginSlug from 'rehype-slug';
import rehypePluginAutolinkHeadings from 'rehype-autolink-headings';
import remarkPluginFrontmatter from 'remark-frontmatter';
import remarkPluginMdxFrontmatter from 'remark-mdx-frontmatter';
import { Plugin, PluginOption } from 'vite';
import { rehypePluginPreWrapper } from './rehypePlugins/preWrapper';
import { rehypePluginShiki } from './rehypePlugins/shiki';
import shiki from 'shiki';

export async function pluginMdxRollup(): Promise<Plugin> {
  return pluginMdx({
    remarkPlugins: [
      remarkGFM,
      remarkPluginFrontmatter,
      [remarkPluginMdxFrontmatter, { name: 'frontmatter' }]
    ],
    rehypePlugins: [
      rehypePluginSlug,
      [
        rehypePluginAutolinkHeadings,
        {
          properties: {
            class: 'header-anchor'
          },
          content: {
            type: 'text',
            value: '#'
          }
        }
      ],
      rehypePluginPreWrapper,
      [
        rehypePluginShiki,
        {
          highlighter: await shiki.getHighlighter({ theme: 'nord' })
        }
      ]
    ]
  }) as unknown as Plugin;
}
