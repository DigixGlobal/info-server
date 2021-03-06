const http = require('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');

const {
  timeIsRecent,
} = require('@digix/helpers/lib/helpers');

const mongoUtil = require('./dbWrapper/mongoUtil');
const dijixUtil = require('./dijixWrapper/dijixUtil');
const web3Util = require('./web3Wrapper/web3Util');
const cacheUtil = require('./cacheWrapper/cacheUtil');

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

const addProcessKycCron = async () => {
  // kill the cron that was waiting for it to start
  waitingCron.stop();

  // refresh DAO, now that the DigixDAO has started
  const startOfFirstQuarter = await scripts.getStartOfFirstQuarter();
  if (timeIsRecent(startOfFirstQuarter)) {
    await scripts.refreshDaoTemp();
  } else {
    await scripts.initDao();
  }
  scripts.refreshDaoConfigs();

  const cronFrequency = process.env.CRON_PROCESS_KYC_FREQUENCY;
  cron.schedule(`*/${cronFrequency} * * * *`, async () => {
    console.log('INFOLOG: [processKycCron]');

    // refresh DAO info and process pending KYC applications
    scripts.refreshDao();
    scripts.processPendingKycs();
  });
};

const addWatchBlocksCron = async () => {
  const watchBlocksFrequency = process.env.CRON_WATCH_BLOCKS_FREQUENCY;
  cron.schedule(`*/${watchBlocksFrequency} * * * * *`, async () => {
    console.log('INFOLOG: [watchBlocksCron]');

    // watch for new blocks
    scripts.watchNewBlocks();
  });
};

const waitForDaoToStart = async () => {
  waitingCron = cron.schedule('*/2 * * * * *', async () => {
    // schedule a script to run every min
    console.log('INFOLOG: waiting for digixdao to start');

    if (await scripts.isDaoStarted()) {
      addProcessKycCron();
    }
  });
};

const init = async () => {
  console.log('INFOLOG: init');
  await initDB();
  await initIpfs();
  cacheUtil.init();

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

  // cron to watch for new blocks
  addWatchBlocksCron();

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
