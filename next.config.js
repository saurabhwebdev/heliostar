/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure MSSQL drivers are kept external to avoid Turbopack bundling issues
  serverExternalPackages: ["mssql", "msnodesqlv8"],
};

module.exports = nextConfig;
