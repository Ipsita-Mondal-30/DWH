import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'some-other-domain.com',
      'images.unsplash.com',
    ],
  },
};

export default nextConfig;