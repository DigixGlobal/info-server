# Contributing to Info Server

We only accept pull request that is assigned an accepted issue. By
participating in this project, you agree to abide by the [code of
conduct](./CODE_OF_CONDUCT.md "code of conduct").

## Submitting a Pull Request
1. Fork this repository
2. Create a feature branch based of `develop` branch
3. Implement your feature or bug fix
4. Add, commit, and push your changes
5. Submit a pull request

### Considerations

- If needed, update documentation or behaviors
- If possible, avoid installing dependencies and if so use an exact
  version `x.y.z` instead of using semantic version
- As much as possible, squash commits before filing a PR

# Development
## Dependency

Before setting up Info server, remember to start a ganache RPC client and deploy the [DigixDAO smart contracts](https://github.com/dao-contracts).

Aside from setting up this server, remember to start this server before
[dao-server](https://github.com/DigixGlobal/dao-server "dao-server")
and all its dependencies since Info server sends requests to `dao-server`.

## Code Structure
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
