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


### [DigixDAO Architecture]()

### [Contribution Guidelines]()

### [License](./LICENSE.md)
