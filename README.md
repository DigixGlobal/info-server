### Introduction
Info-server is a NodeJS server responsible for maintaining an off-chain replica of the DigixDAO storage contracts. Essentially, it watches for newly mined Ethereum blocks and updates its own database.

### Setup
##### Prerequisites
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition-using-deb-packages)
* [Ganache](https://github.com/trufflesuite/ganache-cli) (Ethereum RPC client for development/testing)
* [DigixDAO Contracts](https://github.com/DigixGlobal/dao-contracts)

##### Run info-server
* Get the source
```
$ git clone https://github.com/DigixGlobal/info-server.git
$ git checkout develop
```
* Install dependencies
```
$ npm install
```
* Run MongoDB
```
$ sudo service mongod start
```
* Run info-server
```
$ npm run dev:force
```

### Repository Structure
* `dbWrapper/`

  Wrapper functions to read/write to MongoDB

* `dijixWrapper/`

  Wrapper functions to fetch documents from IPFS

* `cacheWrapper/`

  Wrapper functions to read/write to cache

* `routes/`

  API endpoints for DigixDAO. These are sub-divided into `proposals`, `transactions` and `kyc`, and the rest are placed in `index.js`

* `scripts/`

  This is where most of the business logic has been implemented

  * `watchedFunctions.js`

    Includes the list of the functions from DigixDAO smart contracts that are being watched by Info-server. This also includes broadcasting of GraphQL subscriptions.

  * `blocks.js`

    Info-server queries to check if any new blocks have been mined. If yes, it fetches all transactions from those blocks, filters them to only the transactions that are of interest (`watchedFunctionsList` in `helpers/constants.js`) and add these transactions to the database. `blocks.js` includes the logic to watch for new blocks.

  * `transactions.js`

    This includes the logic for filtering from transactions in new blocks. This also calls the respective functions from `proposals.js`, `addresses.js` and `dao.js`, depending on the state transition brought about by that specific transaction.

  * `proposals.js`

    Includes the logic to implement transition of a DigixDAO project between states.

  * `addresses.js`

    Includes the logic to update any information related to a DigixDAO participant/moderator, or their stakes/votes.

  * `dao.js`

    Includes the logic to update the generic state of DigixDAO, which covers configuration values, DigixDAO timeline, total DGDs staked in the contracts and so on.

  * `notifier.js`

    This script contains the logic to communicate with DigixDAO's [DAO Server](https://github.com/dao-server), which also includes the HMAC logic.

* `types/`

  The code in this directory contains the GraphQL schemas, types and resolvers. These are then used in the `graphql.js` file, that includes the queries, mutations and subscriptions.

### [DigixDAO Architecture]()

### [Contribution Guidelines]()

### [License](./LICENSE.md)
