/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uhlsdnkfpdcldtvwnikf.supabase.co",
      },
    ],
  },
};

export default nextConfig;
