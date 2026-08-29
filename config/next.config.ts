import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: [
    "bpmn-js",
    "diagram-js",
    "bpmn-moddle",
    "moddle",
    "moddle-xml",
    "tiny-svg",
    "tiny-stack",
    "min-dash",
    "min-dom",
    "inherits-browser",
  ],
};

export default nextConfig;
