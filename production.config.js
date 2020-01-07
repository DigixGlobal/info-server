module.exports = {
  apps: [{
    name: 'info-server:production',
    script: './app.js',
    watch: false,
    out_file: './out.log',
    error_file: './error.log',
    env: {
      PORT: '3002',
      DB_URL: 'mongodb://localhost:27017/digixdao',
      DIGIXDAO_DB_NAME: 'digixdao',
      DAO_SERVER_URL: 'https://daoapi.digix.global',
      PRICEFEED_SERVER: 'https://datafeed.digix.global',
      SERVER_SECRET: process.env.SERVER_SECRET,
      RATE_LIMIT_WINDOW_MS: 60 * 1000,
      RATE_LIMIT_PER_WINDOW: 10,
      BLOCK_CONFIRMATIONS: 3,
      START_BLOCK: 7461600,
      N_BLOCKS_BUCKET: 200,
      N_BLOCKS_CONCURRENT: 100,
      FORCE_REFRESH_DB: process.env.FORCE_REFRESH_DB,
      RESYNC: process.env.RESYNC,
      REPROCESS_ONLY: process.env.REPROCESS_ONLY,
      SYNC_REPORT_FREQUENCY: 10,
      WEB3_HTTP_PROVIDER: 'https://mainnet.digix.global',
      IPFS_ENDPOINT: 'https://ipfs-api.digix.global',
      HTTP_ENDPOINT: 'https://ipfs.digix.global/ipfs',
      IPFS_TIMEOUT: 60000,
      CRON_PROCESS_KYC_FREQUENCY: 5, // in minutes
      CRON_WATCH_BLOCKS_FREQUENCY: 15, // in seconds
      KYC_ADMIN_PASSWORD: process.env.KYC_ADMIN_PASSWORD,
      FORUM_ADMIN_ADDRESS: '0x4a84CeFe63E320208aEc7742a8FF2151F96449a4',
      DGD_CONTRACT: '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A',
      DGD_BADGE_CONTRACT: '0x54BDa709FED875224EAe569bb6817d96ef7Ed9ad',
      KYC_ADMIN_KEYSTORE_PATH: process.env.KYC_ADMIN_KEYSTORE_PATH,
    },
  }],
};