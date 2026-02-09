/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🔥 Включаем AVIF и WebP. Это ускорит загрузку картинок на 30-40%.
    formats: ['image/avif', 'image/webp'],
    
    // Кэшируем картинки на 1 месяц, чтобы браузер не качал их повторно
    minimumCacheTTL: 2592000, 

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // Убираем технический заголовок (Best Practices)
  poweredByHeader: false, 
};

export default nextConfig;