const withPwa = require("next-pwa");

const config = {
  experimental: {
    modularizeImports: {
      "@mui/icons-material": {
        transform: "@mui/icons-material/{{member}}",
      },
      "@mui/lab": {
        transform: "@mui/lab/{{member}}",
      },
      "@mui/material": {
        transform: "@mui/material/{{member}}",
      },
    },
  },
  i18n: {
    locales: ["en-CA"],
    defaultLocale: "en-CA",
  },
  images: {
    domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
  },
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPwa({
  dest: "public",
  // disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 10000000,
  swSrc: "./worker/index",
})(config);
