const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables for build
  env: {
    NEXT_PUBLIC_API_URL: 'https://ksp-crimeintel-60076939808.development.catalystserverless.in/server/ksp-backend'
  }
};

export default nextConfig;
