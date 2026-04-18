/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/odds-scanner', // DODAJ IME SVOG REPOZITORIJUMA OVDE
    assetPrefix: '/odds-scanner', // DODAJ I OVDE
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
