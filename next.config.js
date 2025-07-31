/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const Prefix = '/Storio'
const nextConfig = {
    output: isProd ? 'export' : undefined,
    assetPrefix: isProd ? `${Prefix}/` : '',
    basePath: isProd ? Prefix : '',
    images: {
      unoptimized: true,
    },
    env: {
      NEXT_PUBLIC_BASE_PATH: isProd ? Prefix : '',
    },
}

module.exports = nextConfig
