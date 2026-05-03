import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
}

export default withPWA(nextConfig)
