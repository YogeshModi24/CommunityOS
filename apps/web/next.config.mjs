/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    AUTH_TRUST_HOST: "true",
    NEXTAUTH_URL: "https://community-os-web-seven.vercel.app",
    AUTH_SECRET: "0123456789abcdef0123456789abcdef0123456789abcdef",
    NEXT_PUBLIC_API_URL: "https://communityos-0d4d.onrender.com"
  },
};

export default nextConfig;
