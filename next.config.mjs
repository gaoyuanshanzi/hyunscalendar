/** @type {import('next').NextConfig} */
const nextConfig = {
  // korean-lunar-calendar is a CommonJS module
  transpilePackages: [],
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback };
    return config;
  },
};

export default nextConfig;
