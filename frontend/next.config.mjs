// Địa chỉ Spring Boot. Đổi bằng biến môi trường BACKEND_URL khi deploy.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Trình duyệt gọi /api/... cùng origin với Next -> Next chuyển tiếp sang Spring Boot.
  // Nhờ vậy backend không cần bật CORS và không lộ địa chỉ backend trong code client.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
