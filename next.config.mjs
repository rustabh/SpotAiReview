/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone/server.js — needed for hosts (e.g. Hostinger's
  // Node.js App / Passenger) that run a single Node entry file instead of
  // the `next start` CLI.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
