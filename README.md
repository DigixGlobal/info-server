# Info Server
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

  Info-server can be started with multiple configurations, that are included in the `development.config.js` file. A few `npm` scripts have been added in the `package.json` file, also listed below:
  * Forcefully drop database and restart info-server with a fresh instance. This also starts watching blocks from the `START_BLOCK` config value.
  ```
  $ npm run dev:force
  ```
  * Re-sync all transactions from the blockchain, and then process them. This does not drop the database.
  ```
  $ npm run dev:resync
  ```
  * Only re-process the transactions that already exist in the database. You may want to choose this option if you have modified certain logic in the `scripts/` directory, but do not want to re-sync all transactions from the blockchain
  ```
  $ npm run dev:reprocess
  ```

### DigixDAO Architecture

### Contributing
Refer [CONTRIBUTING.md](./CONTRIBUTING.md) for the process for submitting pull requests to us.

### [License](./LICENSE.md)
Copyright DIGIXGLOBAL PRIVATE LIMITED.

The code in this repository is licensed under the [BSD-3 Clause](https://opensource.org/licenses/BSD-3-Clause) BSD-3-clause, 2017.
