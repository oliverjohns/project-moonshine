const { env } = require('./src/server/env');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com', 'cdn.pixabay.com'],
  },
};

module.exports = nextConfig;
