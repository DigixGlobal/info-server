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
      BLOCK_CONFIRMATIONS: 0,
      START_BLOCK: 0,
    },
  }],
};
