import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/downloads/san-enrique-rotc.apk",
        destination: "/api/download-apk",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/apply",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/enlist",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/signin",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/portal",
        destination: "/cadet",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/cadet",
        permanent: false,
      },
      {
        source: "/faq",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/help",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/app",
        destination: "/download",
        permanent: false,
      },
      {
        source: "/apk",
        destination: "/download",
        permanent: false,
      },
      {
        source: "/qr",
        destination: "/cadet/my-qr",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
