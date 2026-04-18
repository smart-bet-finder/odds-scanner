/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/odds-scanner',
  assetPrefix: '/odds-scanner',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
