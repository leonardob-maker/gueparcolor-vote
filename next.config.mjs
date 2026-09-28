/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Força a Vercel a ignorar erros de checagem do TypeScript na compilação
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora avisos/erros do ESLint na compilação
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;