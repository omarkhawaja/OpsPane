import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpsPane reads live local DB state on every request — there's no static
  // shell worth prerendering, so Cache Components/PPR (the create-next-app
  // default) is turned off in favor of plain per-request dynamic rendering.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
