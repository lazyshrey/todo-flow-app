import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
