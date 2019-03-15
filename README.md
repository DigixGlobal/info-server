### Outline of server structure: [link](OUTLINE.md)

### SETUP INSTRUCTIONS
Please refer [HERE](https://gist.github.com/roynalnaruto/52f2be795f256ed7b0f156666108f8fc). The Info-server runs together with [DigixDAO contracts](https://github.com/DigixGlobal/dao-contracts/tree/dev-info-server) and [Dao-server](https://github.com/DigixGlobal/dao-server/tree/dev)

### Setup:
* Install MongoDB: https://docs.mongodb.com/manual/administration/install-on-linux/
* Make sure `mongod` is running:
```
sudo service mongod start
```
* Install pm2:
```
npm install pm2@latest -g
```
* Install node dependencies:
```
npm i
```
* [Development] start the server in development:
```
npm run dev
```
  * The local server is at `localhost:3001`. Test going to http://localhost:3001/daoInfo
* [Staging] start the staging server (on port 3002)
```
npm run staging
```

##### Details
Note that the `dev` can be replaced by `staging` for the staging environment
* Forcefully drop database and restart Info-server
```
$ npm run dev:force
```
* Re-sync all transactions from the blockchain, and then process them
```
$ npm run dev:resync
```
* Don't re-sync transactions, only process transactions all over again
```
$ npm run dev:reprocess
```

### Endpoints
##### Dao details
* `/daoInfo`
```
{
    result: {
      "currentQuarter": 1,
      "startOfQuarter": <timestamp>, // in seconds
      "startOfMainphase": <timestamp>,
      "startOfNextQuarter": <timestamp>,
      "totalLockedDgds": 1234e9, // = 1234 DGD
      "totalModeratorLockedDgds": 234e9 // 234 DGD
    }
}
```
##### Address details
* `/address/:address`
```
{
    result: {
      "address": "0x6ed6e4bc5341d8d53bca4ee5df6f0e1970f49918",
      "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
      "lockedDgdStake": 123e9, // 123 DGDStake
      "lockedDgd": 200e9, // locked 200 DGD
      "reputationPoint": 12e9, // 12 Reputation Points
      "quarterPoint": 8e9, // 8 Quarter Points
      "isParticipant": true,
      "isModerator": true,
      "lastParticipatedQuarter": 1
    }
}
```


##### Proposals
* Get count of proposals in different stages: `/proposals/count`
```
{
  "result": {
    "idea": 2,
    "draft": 1,
    "proposal": 2,
    "ongoing": 1,
    "review": 1,
    "archived": 1
  }
}
```
* Get proposal details: `/proposals/details/:id`
```
{
    result: {
      "proposalId": "0xwef23fwef",
      "stage": "idea",
      "proposer": "0x1234we..",
      "endorser": "0x231423..",
      "isDigix": false,
      "timeCreated": <timestamp>,
      "finalVersionIpfsDoc": "Qm23f..",
      "proposalVersions": [
        {
          "docIpfsHash": "Qm..",
          "created": <timestamp>,
          "milestoneFundings": [1e18, 2e18],
          finalReward: [1e18],
          moreDocs: ["Qm..", "Qm..",..],
          totalFunding: 4e18
        },
        ...
      ]
      "draftVoting": {
        "startTime": <timestamp>,
        "votingDeadline": <timestamp>,
        "totalVoterStake": 123e9, // 123 DGD,
        "totalVoterCount": 12
        "currentResult": 0.61, // 61%
        "quorum": 140e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": false,
        "passed": false,
        "funded": false,
      },
      "votingRounds": [
        { // voting round 0
          "startTime": <timestamp>,
          "commitDeadline": <timestamp>,
          "revealDeadline": <timestamp>,
          "totalVoterStake": 123e9, // 123 DGD,
          "totalVoterCount": 12
          "currentResult": 0.61, // 61%
          "quorum": 140e9, // 140 DGD
          "quota": 0.60, // 60%
          "claimed": false,
          "passed": false,
          "funded": false,
        },
        ....
      ]
      "currentMilestone": 1,
      "currentMilestoneStart": <timestamp>,
      "currentVotingRound": -1, // -1 = draftVoting, 0 = first Voting
      "votingStage": "draftVoting", // draftVoting/commit/reveal/none
      "claimableFunding": 1e18, // 1 ETH
      "prl": "ok", // ok/paused/stopped
    }
}
```

* List proposals in a certain stage: `/proposals/:stage`  :stage = idea/draft/...
```
{
    result: [
      {
        "proposalId": "0xwef23fwef",
        "proposer": "0x1234we..",
        ....
      },
      {
        "proposalId": "0xwef23fwef",
        "proposer": "0x1234we..",
        ....
      },
      ...
    ]
}
```

* List all proposals: `/proposals/all`
```
{
    result: [
      {
        "proposalId": "0xwef23fwef",
        "proposer": "0x1234we..",
        ....
      },
      {
        "proposalId": "0xwef23fwef",
        "proposer": "0x1234we..",
        ....
      },
      ...
    ]
}
```
