/*
 * This plugin is a workaround to a known styled-jsx issue.
 *
 * See: https://github.com/vercel/styled-jsx/issues/695
 *
 * If the issue is fixed in the future, we should be able to remove this patch.
 */

import _JSXStyle from 'styled-jsx/style';

function onPreRenderHTML() {
  if (typeof global !== 'undefined') {
    Object.assign(global, { _JSXStyle });
  }
}

export { onPreRenderHTML };
