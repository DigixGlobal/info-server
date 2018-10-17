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
      WEB3_HTTP_PROVIDER: 'http://localhost:8545',
      BLOCK_CONFIRMATIONS: 0,
      START_BLOCK: 0,
    },
  }],
};
