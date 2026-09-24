/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone/server.js — needed for hosts (e.g. Hostinger's
  // Node.js App / Passenger) that run a single Node entry file instead of
  // the `next start` CLI.
  output: "standalone",
};

export default nextConfig;
