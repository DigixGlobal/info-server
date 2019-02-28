module.exports = {
  apps: [{
    name: 'info-server:dev',
    script: './app.js',
    watch: ['scripts/*', 'helpers/*', 'routes/*', 'app.js'],
    ignore_watch: ['out.log'],
    out_file: './out.log',
    error_file: './out.log',
    env: {
      PORT: '3001',
      DB_URL: 'mongodb://localhost:27017/digixdao',
      DIGIXDAO_DB_NAME: 'digixdao',
      IPFS_ENDPOINT: 'http://localhost:5001',
      HTTP_ENDPOINT: 'http://localhost:9001/ipfs',
      WEB3_HTTP_PROVIDER: 'http://localhost:8545',
      DAO_SERVER_URL: 'http://localhost:3005',
      SERVER_SECRET: 'this-is-a-secret-between-dao-and-info-server',
      RATE_LIMIT_WINDOW_MS: 60 * 1000,
      RATE_LIMIT_PER_WINDOW: 10,
      BLOCK_CONFIRMATIONS: 0,
      START_BLOCK: 0,
      N_BLOCKS_BUCKET: 200,
      N_BLOCKS_CONCURRENT: 100,
      FORCE_REFRESH_DB: 'true',
      SYNC_REPORT_FREQUENCY: 10,
      KYC_ADMIN_KEYSTORE: {
        address: '97be8ff9065ce5f3d562cb6b458cde88c8307edf',
        crypto: {
          cipher: 'aes-128-ctr',
          ciphertext: '8ae6be64f0ee06b54bb5a424956c149fee894394a5e159a19b9d509aa17a3a9e',
          cipherparams: {
            iv: '5f3c646ed96b620e163198a24886dce0',
          },
          kdf: 'scrypt',
          kdfparams: {
            dklen: 32,
            n: 262144,
            p: 1,
            r: 8,
            salt: 'dbdf39a86f46a0a12e80c1ee9d158c04f8f4ddb00d3748b4ceb809dae81e0d2b',
          },
          mac: '6c0bcf4419bc7b9b37e9edd57ede3a383ca7aacf8ba03574b1f772335c31dbd2',
        },
        id: '270d04d7-c39c-4ba3-80b2-75c221a37d1c',
        version: 3,
      },
      KYC_ADMIN_PASSWORD: 'digixdao',
      FORUM_ADMIN_ADDRESS: '0x52a9d38687a0c2d5e1645f91733ffab3bbd29b06',
    },
  }],
};
