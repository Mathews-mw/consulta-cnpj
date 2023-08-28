/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	pageExtensions: ['page.tsx', 'api.ts', 'api.tsx'],
	output: 'standalone',
};

module.exports = nextConfig;
