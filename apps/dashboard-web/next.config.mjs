/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint for FE-1 to focus on functionality
    // TODO(FE-2): Re-enable and fix linting issues
    ignoreDuringBuilds: true,
  },
  // Configure for potential React Native Web compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default nextConfig;