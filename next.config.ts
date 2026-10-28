import type { NextConfig } from 'next';

/*
 * GitHub Pages: the workflow in .github/workflows/deploy.yml sets GITHUB_PAGES,
 * which turns the build into plain static files in `out/`. Pages serves a
 * repository called `portfolio` at username.github.io/portfolio, so every
 * link and asset needs that prefix (basePath). A repository named
 * `username.github.io` is served from the root and needs none.
 *
 * Locally and on Vercel neither variable is set, so nothing changes there.
 */
const isPages = process.env.GITHUB_PAGES === 'true';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = isPages && repo && !repo.endsWith('.github.io') ? `/${repo}` : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isPages && { output: 'export', basePath }),
};

export default nextConfig;
