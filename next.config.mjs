/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora erros de tipagem do TypeScript durante o build na Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora avisos do ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;