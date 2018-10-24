module.exports = {
  apps: [{
    name: 'info-server:staging',
    script: './app.js',
    watch: false,
    env: {
      PORT: '3002',
      DB_URL: 'localhost:27017/digixdao',
      DIGIXDAO_DB_NAME: 'digixdao',
      WEB3_HTTP_PROVIDER: 'https://kovan.infura.io',
      IPFS_ENDPOINT: 'https://ipfs-api.digix.global',
      HTTP_ENDPOINT: 'https://ipfs.digix.global/ipfs',
    },
  }],
};
