/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from bundling native/heavy server-only packages
  serverExternalPackages: ['colorthief', 'sharp'],
};

export default nextConfig;
