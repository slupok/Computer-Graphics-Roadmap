import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';

export default defineConfig({
  site: 'https://www.computer-graphics.xyz',
  base: '/',
  markdown: {
    remarkPlugins: [remarkMath, remarkGithubBlockquoteAlert],
    rehypePlugins: [rehypeKatex],
  },
});
