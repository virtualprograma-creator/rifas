import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow access from local network for testing on mobile devices
  allowedDevOrigins: ['192.168.1.72', 'localhost'],
  // Si en el futuro acceden con otra IP, hay que agregarla aquí
};

export default nextConfig;
