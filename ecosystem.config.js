module.exports = {
  apps: [
    {
      name: 'kitty-bot',
      script: './dist/src/index.js',
      node_args: '-r dotenv/config',
    },
  ],
};
