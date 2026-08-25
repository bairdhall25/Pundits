import type { NextConfig } from "next";
import path from "node:path";

const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? "/Pundits" : "",
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
