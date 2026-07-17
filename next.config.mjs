/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
    turbo: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
};

export default nextConfig;
