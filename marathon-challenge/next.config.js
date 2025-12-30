/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel
  swcMinify: true,
  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    // Handle Rive animations and other client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // Temporarily allow build to proceed with warnings (remove after fixing)
  // Uncomment these if build is failing on lint/type errors:
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
}

module.exports = nextConfig
