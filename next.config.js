/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Ovo govori Next-u da se sajt nalazi na /odds-scanner/ putanji
  basePath: '/odds-scanner',
  assetPrefix: '/odds-scanner',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
