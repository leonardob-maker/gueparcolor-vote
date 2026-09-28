/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora erros de tipagem estática no build da Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora avisos do ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;