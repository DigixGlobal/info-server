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
    "proposer": "0x1234we..",
    "ipfsdoc": "Qmwefwef",
    "moreDocs": [],
    "endorser": "0x231423..",
    "proposalStage": "idea", // idea/draft/draftVoting/VotingCommit/VotingReveal/AwaitingClaim/OnGoing/closed
    "currentMilestone": 1,
    "milestoneCount": 2,
    "totalFunding": 5e18, // 5 ETH
    "fundings": [1e18, 4e18], // fundings for different milestones
    "currentMilestoneStart": <timestamp>,
    "currentVotingStart": <timestamp>,
    "currentVotingDeadline": <timestamp>,
    "currentApproval": 0.60,
    "currentDgdTurnout": 123e9, // 123 DGD
    "currentVoterTurnout": 12, // 12 voters so far
    "quorum": 200e9, // 200 DGD
    "quota": 0.6, // 60%
    "claimableFunding": 1e18, // 1 ETH
    "prl": "ok", // ok/paused/stopped
}
```

* List proposals: `/proposals/:stage`  :stage = idea/draft/...
```
[<proposal_id_1>, <proposal_id_2>, ...]
```
