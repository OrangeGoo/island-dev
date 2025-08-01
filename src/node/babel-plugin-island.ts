import { declare } from '@babel/helper-plugin-utils';
import type { Visitor } from '@babel/traverse';
import type { PluginPass } from '@babel/core';
import { types as t } from '@babel/core';
import { MASK_SPLITTER } from './constants';
import { normalizePath } from 'vite';

export default declare((api) => {
  api.assertVersion(7);

  const visitor: Visitor<PluginPass> = {
    // <A __island/>
    JSXOpeningElement(path, state) {
      const name = path.node.name;
      let bindingname = '';
      if (name.type === 'JSXIdentifier') {
        bindingname = name.name;
      } else if (name.type === 'JSXMemberExpression') {
        let object = name.object;
        while (t.isJSXMemberExpression(object)) {
          object = object.object;
        }
        bindingname = object.name;
      } else {
        return;
      }

      const binding = path.scope.getBinding(bindingname);

      if (binding?.path.parent.type === 'ImportDeclaration') {
        const source = binding.path.parent.source;
        const attributes = (path.container as t.JSXElement).openingElement
          .attributes;
        for (let i = 0; i < attributes.length; i++) {
          const name = (attributes[i] as t.JSXAttribute).name;
          if (name?.name === '__island') {
            (attributes[i] as t.JSXAttribute).value = t.stringLiteral(
              `${source.value}${MASK_SPLITTER}${normalizePath(
                state.filename || ''
              )}`
            );
          }
        }
      }
    }
  };
  return {
    name: 'transform-jsx-island',
    visitor
  };
});
