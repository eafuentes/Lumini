const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// More aggressive blocklist to avoid EMFILE errors
config.resolver.blockList = [
  /node_modules\/.*\/node_modules/,
  /\.expo\/.*/,
  /android\/.*/,
  /ios\/.*/,
  /\.git\/.*/,
];

module.exports = config;
