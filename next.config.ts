import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    emotion: true,
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
};

const bundleAnalyzerWrapper = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzerWrapper(nextConfig);
