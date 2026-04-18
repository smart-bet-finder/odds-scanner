/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Ključno za GitHub Pages
    images: {
        unoptimized: true, // Obavezno jer GitHub Pages ne podržava Next.js optimizaciju slika
    },
};

export default nextConfig;
