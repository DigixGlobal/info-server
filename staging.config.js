module.exports = {
  apps: [{
    name: 'info-server:staging',
    script: './app.js',
    watch: false,
    env: {
      PORT: '3002',
      DB_URL: 'mongodb://localhost:27017/digixdao',
      DIGIXDAO_DB_NAME: 'digixdao',
      DAO_SERVER_URL: 'https://dao.digixdev.com',
      SERVER_SECRET: 'this-is-a-secret-between-dao-and-info-server',
      RATE_LIMIT_WINDOW_MS: 60 * 1000,
      RATE_LIMIT_PER_WINDOW: 10,
      BLOCK_CONFIRMATIONS: 2,
      START_BLOCK: 0,
      FORCE_REFRESH_DB: 'false',
      SYNC_REPORT_FREQUENCY: 10,
      WEB3_HTTP_PROVIDER: 'https://kovan.digixdev.com',
      IPFS_ENDPOINT: 'https://ipfs-api.digix.global',
      HTTP_ENDPOINT: 'https://ipfs.digix.global/ipfs',
    },
  }],
};
