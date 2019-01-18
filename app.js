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

const routes = require('./routes');
const scripts = require('./scripts');

const app = express();

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
  } else {
    await mongoUtil.checkAndInitFreshDb();
  }
};

const initIpfs = async () => {
  await dijixUtil.init(process.env.IPFS_ENDPOINT, process.env.HTTP_ENDPOINT);
};

const initCron = async () => {
  cron.schedule('* * * * *', async () => {
    // schedule a script to run every min
    console.log('\tIn cron.schedule');

    // process the pending transactions
    scripts.processTransactions();

    // TODO: remove this part
    // don't need to refresh dao every minute
    // the values stay the same in the same quarter
    // So, only need to refreshDao when a new quarter begins
    scripts.refreshDao();
    scripts.refreshDaoConfigs();
    scripts.processPendingKycs();
  });
};

const init = async () => {
  await initDB();
  await initIpfs();

  // TODO: no need to do this (ask @vu)
  // middleware to inject db object // not sure if is a good practice
  app.use((req, res, next) => {
    req.db = mongoUtil.getDB();
    next();
  });
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

  scripts.watchNewBlocks();

  initCron();
};

init();

const server = app.listen(process.env.PORT, function () {
  console.log('Info server running on port.', server.address().port);
});
