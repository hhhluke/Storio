/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NODE_ENV === 'production';
const Prefix = '/Storio'
const nextConfig = {
    output: 'export',
    assetPrefix: isGithubPages ? `${Prefix}/` : '',
    basePath: isGithubPages ? Prefix : '',
    images: {
      unoptimized: true,
    },
}

module.exports = nextConfig
