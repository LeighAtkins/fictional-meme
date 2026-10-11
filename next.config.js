/** @type {import('next').NextConfig} */
module.exports = {
  poweredByHeader: false,
  // A separate output folder lets a production build run beside `next dev`
  distDir: process.env.NEXT_DIST_DIR || '.next',
}
