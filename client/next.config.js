/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
   NEXT_PUBLIC_ZEGO_APP_ID: 1522750083,
   NEXT_PUBLIC_ZEGO_SERVER_ID: "b24c1d2c06cc54ca15beee9527da159f" 
  },
  images:{
    domains: ["localhost"]
  },
};

module.exports = nextConfig;
