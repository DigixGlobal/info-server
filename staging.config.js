module.exports = {
  apps: [{
    name: 'info-server:staging',
    script: './app.js',
    watch: false,
    out_file: './out.log',
    error_file: './error.log',
    env: {
      PORT: '3002',
      DB_URL: 'mongodb://localhost:27017/digixdao',
      DIGIXDAO_DB_NAME: 'digixdao',
      DAO_SERVER_URL: 'https://dao.digixdev.com',
      SERVER_SECRET: 'this-is-a-secret-between-dao-and-info-server',
      RATE_LIMIT_WINDOW_MS: 60 * 1000,
      RATE_LIMIT_PER_WINDOW: 10,
      BLOCK_CONFIRMATIONS: 3,
      START_BLOCK: 10610000,
      N_BLOCKS_BUCKET: 200,
      N_BLOCKS_CONCURRENT: 100,
      FORCE_REFRESH_DB: process.env.FORCE_REFRESH_DB,
      RESYNC: process.env.RESYNC,
      REPROCESS_ONLY: process.env.REPROCESS_ONLY,
      SYNC_REPORT_FREQUENCY: 10,
      WEB3_HTTP_PROVIDER: 'https://kovan.digixdev.com',
      IPFS_ENDPOINT: 'https://ipfs-api.digix.global',
      HTTP_ENDPOINT: 'https://ipfs.digix.global/ipfs',
      IPFS_TIMEOUT: 60000,
      CRON_PROCESS_KYC_FREQUENCY: 5,
      CRON_WATCH_BLOCKS_FREQUENCY: 5,
      KYC_ADMIN_PASSWORD: 'digixdao-kovan',
      FORUM_ADMIN_ADDRESS: '0x369d674039d64519af688f4c6f9608552207bdab',
      DGD_CONTRACT: '0x3bbba4b50468ead87cfc90a31c2768b7bf4d26e1',
      DGD_BADGE_CONTRACT: '0x1ed8364eaabf655882dca0c01b19519f8acaed0b',
    },
  }],
};
