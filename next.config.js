/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // OVA LINIJA JE KLJUČNA
    images: {
        unoptimized: true, // Obavezno za statički export
    },
};

export default nextConfig;
