const http = require('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');

const mongoUtil = require('./dbWrapper/mongoUtil');
const dijixUtil = require('./dijixWrapper/dijixUtil');
const web3Util = require('./web3Wrapper/web3Util');

const {
  initContracts,
} = require('./helpers/contracts');

const server = require('./graphql');
const routes = require('./routes');
const scripts = require('./scripts');

const {
  setLastSeenBlock,
} = require('./dbWrapper/counters');

const app = express();
let waitingCron;

web3Util.initWeb3(process.env.WEB3_HTTP_PROVIDER);

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('json spaces', 4);

const initDB = async () => {
  await mongoUtil.connectToServer(process.env.DB_URL, process.env.DIGIXDAO_DB_NAME);

  if (process.env.FORCE_REFRESH_DB === 'true') {
    await mongoUtil.initFreshDb();
  } else if (process.env.RESYNC === 'true') {
    await mongoUtil.initToResyncDb();
    await mongoUtil.checkAndInitFreshDb();
  } else if (process.env.REPROCESS_ONLY === 'true') {
    await mongoUtil.initToProcessOnlyDb();
  } else {
    await mongoUtil.checkAndInitFreshDb();
  }
};

const initIpfs = async () => {
  const ipfsTimeout = parseInt(process.env.IPFS_TIMEOUT, 10);
  await dijixUtil.init(process.env.IPFS_ENDPOINT, process.env.HTTP_ENDPOINT, ipfsTimeout);
};

const initCron = async () => {
  waitingCron.stop();
  scripts.refreshDao();
  const cronFrequency = process.env.CRON_PROCESS_KYC_FREQUENCY;
  cron.schedule(`*/${cronFrequency} * * * *`, async () => {
    // schedule a script to run every min
    console.log('INFOLOG: running the 1min cron job');

    // TODO: remove this part
    // don't need to refresh dao every minute
    // the values stay the same in the same quarter
    // So, only need to refreshDao when a new quarter begins
    scripts.refreshDao();
    scripts.processPendingKycs();
  });
};

const addWatchBlocksCron = async () => {
  const watchBlocksFrequency = process.env.CRON_WATCH_BLOCKS_FREQUENCY;
  cron.schedule(`*/${watchBlocksFrequency} * * * * *`, async () => {
    // schedule a script to run every 3 seconds
    scripts.watchNewBlocks();
  });
};

const waitForDaoToStart = async () => {
  waitingCron = cron.schedule('*/2 * * * * *', async () => {
    // schedule a script to run every min
    console.log('INFOLOG: waiting for digixdao to start');

    if (await scripts.isDaoStarted()) {
      initCron();
      addWatchBlocksCron();
    }
  });
};

const init = async () => {
  console.log('INFOLOG: init');
  await initDB();
  await initIpfs();

  app.use('/', routes);

  const defaultLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS, // 1 minute
    max: process.env.RATE_LIMIT_PER_WINDOW, // limit each IP to 10 requests per minute
  });

  //  apply to all requests
  app.use(defaultLimiter);

  const web3 = web3Util.getWeb3();
  const networkId = await web3.version.network;
  await initContracts(web3, networkId);

  await scripts.syncAndProcessToLatestBlock();

  // set the last seen block (at start)
  await setLastSeenBlock(web3.eth.blockNumber);

  waitForDaoToStart();
};

init();

server.applyMiddleware({
  app,
  path: '/api',
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log('Info server running on port.', process.env.PORT);
});
