### Endpoints
##### Dao details
* `/dao_details`
```
{
    "currentQuarter": 1
    "timeInQuarter": 1234213 // in seconds
    "totalDgdsLocked": 123e9 // = 123 DGD
}
```

##### Proposals
* Get proposal details: `/proposals/details/:id`
```
{
    "proposalId": "0xwef23fwef",
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
```

* List proposals: `/proposals/:stage`  :stage = idea/draft/...
```
[
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
```
