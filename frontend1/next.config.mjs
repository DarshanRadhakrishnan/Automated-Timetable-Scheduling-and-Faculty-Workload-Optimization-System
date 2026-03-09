/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Turbopack (default in Next.js 16) with empty config to silence warnings
    turbopack: {},
    // Allow images from external sources if needed
    images: {
        remotePatterns: [],
    },
    // Enable SVG imports via @svgr/webpack (used when running with --webpack flag)
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
};

export default nextConfig;
