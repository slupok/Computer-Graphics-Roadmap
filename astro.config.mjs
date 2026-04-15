import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';

function remarkCenterContainer() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name === 'center') {
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = { class: 'math-center' };
      }
    });
  };
}

export default defineConfig({
  site: 'https://www.computer-graphics.xyz',
  base: '/',
  markdown: {
    remarkPlugins: [remarkMath, remarkGithubBlockquoteAlert, remarkBreaks, remarkDirective, remarkCenterContainer],
    rehypePlugins: [rehypeKatex],
  },
});
