import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load .env.local variables
dotenv.config({ path: '.env.local' });

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Skip ESLint during Vercel builds (if needed)
  eslint: {
    ignoreDuringBuilds: true,
  },


  // Add environment variables to be exposed to the client
 
};

export default nextConfig;
