import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // <pre><code></code></pre>
      // 1. 找到pre元素
      const isPreNode = node.tagName === 'pre';
      if (
        isPreNode &&
        node.children[0]?.type === 'element' &&
        node.children[0]?.tagName === 'code' &&
        !node.data?.isVisited
      ) {
        // 2. 找到code元素
        const codeNode = node.children[0] as Element;
        const codeClassName = codeNode.properties?.className?.toString() || '';
        // language-js
        const lang = codeClassName.split('-')[1];

        codeNode.properties.className = '';

        const clonedNode: Element = {
          type: 'element',
          tagName: 'pre',
          children: node.children,
          data: {
            isVisited: true
          }
        };

        node.tagName = 'div';
        node.properties = node.properties || {};
        node.properties.className = codeClassName;
        node.children = [
          {
            type: 'element',
            tagName: 'span',
            properties: {
              className: 'lang'
            },
            children: [
              {
                type: 'text',
                value: lang
              }
            ]
          },
          clonedNode
        ];
      }
    });
  };
};
