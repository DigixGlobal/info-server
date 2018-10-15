const watchSomeEvent = async () => {
  // watch some event
  // when it happens:
  //    - update MongoDB database
  //    - notify the
}

const setDummyData = (db) => {

  const proposals = db.get('proposals');
  proposals.update({ proposalId: "QmZyLQ9zhEDSBf9rCfwXx2GRq3xJ84NtAWb1rKxGDWGUkb" }, {
    "proposalId": "QmZyLQ9zhEDSBf9rCfwXx2GRq3xJ84NtAWb1rKxGDWGUkb", // is not finalized yet
    "stage": "idea",
    "proposer": "0x84a0d77c693adabe0ebc48f88b3ffff010577051",
    "endorser": "0xd7b99f68d740fa500aae37cc273b7cf7b4b49309",
    "isDigix": false,
    "timeCreated": 1539597600,
    "finalVersionIpfsDoc": "",
    "proposalVersions": [
      {
        "docIpfsHash": "QmZyLQ9zhEDSBf9rCfwXx2GRq3xJ84NtAWb1rKxGDWGUkb",
        "title": "DGD holders offline meetup in Seattle",
        "description": "Lorem ipsum doler sot and then he said ok",
        "created": 1539597600,
        "milestoneFundings": [1e18, 2e18],
        finalReward: [1e18],
        moreDocs: [],
        totalFunding: 4e18
      },
    ],
    "draftVoting": {
    },
    "votingRounds": [
      {
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 0,
    "currentVotingRound": -2, // -1 = draftVoting, 0 = first Voting
    "votingStage": "none", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" }, {
    "proposalId": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "stage": "draft",
    "proposer": "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
    "endorser": "0x295ba3a07d3e8e72e2c032359449f6d2ba658bfb",
    "isDigix": false,
    "timeCreated": 1538902800,
    "finalVersionIpfsDoc": "QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
    "proposalVersions": [
      {
        "docIpfsHash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        "title": "Emma Watson Brand Ambassador",
        "description": "Make emma great again. Lorem ipsum and then he was ok",
        "created": 1538902800,
        "milestoneFundings": [1e18, 2e18],
        finalReward: [1e18],
        moreDocs: [],
        totalFunding: 4e18
      },
      {
        "docIpfsHash": "QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
        "title": "Emma Watson Brand Ambassador for DGX",
        "description": "Just made emma great again. Lorem ipsum and then she was not ok",
        "created": 1538996400,
        "milestoneFundings": [2e18, 2e18],
        finalReward: [2e18],
        moreDocs: ["QmWHyrPWQnsz1wxHR219ooJDYTvxJPyZuDUPSDpdsAovN5", "QmTccePWQnsz1wxHR219ooJDYTvxJPyZuDUPSDpdsAovN5"],
        totalFunding: 6e18
      },
    ],
    "draftVoting": {
      "startTime": 1538997400,
      "votingDeadline": 1539874800,
      "totalVoterStake": 195e9,
      "totalVoterCount": 12,
      "currentResult": 0.73,
      "quorum": 150e9,
      "quota": 0.60,
      "claimed": false,
      "passed": false,
      "funded": false,
    },
    "votingRounds": [
      {
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 0,
    "currentVotingRound": -1, // -1 = draftVoting, 0 = first Voting
    "votingStage": "draftVoting", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx" }, {
    "proposalId": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
    "stage": "proposal",
    "proposer": "0x74395fe3ce092320ff5d0cc1d79e054f15b1b3b8",
    "endorser": "0xd3f093ca4be548a0cfd0610b3f12ae7a958ccb18",
    "isDigix": false,
    "timeCreated": 1538474400,
    "finalVersionIpfsDoc": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
    "proposalVersions": [
      {
        "docIpfsHash": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
        "title": "Music video for DGX",
        "description": "Lorem ipsum doler simat this is a music video for DGX gold-backed token",
        "created": 1538474400,
        "milestoneFundings": [1e18, 2e18],
        finalReward: [1e18],
        moreDocs: [],
        totalFunding: 4e18
      },
    ],
    "draftVoting": {
      "startTime": 1538475400,
      "votingDeadline": 1539339360,
      "totalVoterStake": 254e9,
      "totalVoterCount": 19,
      "currentResult": 0.79,
      "quorum": 150e9,
      "quota": 0.60,
      "claimed": true,
      "passed": true,
      "funded": false,
    },
    "votingRounds": [
      {
        "startTime": 1539339360,
        "commitDeadline": 1539856800,
        "revealDeadline": 1540375200,
        "totalVoterStake": 1024e9, // 123 DGD,
        "totalVoterCount": 52,
        "currentResult": 0, // 61%
        "quorum": 500e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": false,
        "passed": false,
        "funded": false,
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 0,
    "currentVotingRound": 0, // -1 = draftVoting, 0 = first Voting
    "votingStage": "commit", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmQNFEgpLMXhhHB5amrwjdA33fR8EsFLJw85Z7K6dxUZnV" }, {
    "proposalId": "QmQNFEgpLMXhhHB5amrwjdA33fR8EsFLJw85Z7K6dxUZnV",
    "stage": "proposal",
    "proposer": "0x74395fe3ce092320ff5d0cc1d79e054f15b1b3b8",
    "endorser": "0xd3f093ca4be548a0cfd0610b3f12ae7a958ccb18",
    "isDigix": false,
    "timeCreated": 1538042400,
    "finalVersionIpfsDoc": "QmQNFEgpLMXhhHB5amrwjdA33fR8EsFLJw85Z7K6dxUZnV",
    "proposalVersions": [
      {
        "docIpfsHash": "QmQNFEgpLMXhhHB5amrwjdA33fR8EsFLJw85Z7K6dxUZnV",
        "title": "Smart contract audit for DigixDAO contracts",
        "description": "DigixDAO contracts to be audited by Lorem Ipsum. Please release some ethers",
        "created": 1538042400,
        "milestoneFundings": [1e18, 2e18],
        finalReward: [1e18],
        moreDocs: [],
        totalFunding: 4e18
      },
    ],
    "draftVoting": {
      "startTime": 1538043400,
      "votingDeadline": 1538733600,
      "totalVoterStake": 260e9,
      "totalVoterCount": 19,
      "currentResult": 0.80,
      "quorum": 150e9,
      "quota": 0.60,
      "claimed": true,
      "passed": true,
      "funded": false,
    },
    "votingRounds": [
      {
        "startTime": 1538733600,
        "commitDeadline": 1539424800,
        "revealDeadline": 1540029600,
        "totalVoterStake": 1024e9, // 123 DGD,
        "totalVoterCount": 52,
        "currentResult": 0.76, // 61%
        "quorum": 500e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": false,
        "passed": false,
        "funded": false,
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 0,
    "currentVotingRound": 0, // -1 = draftVoting, 0 = first Voting
    "votingStage": "reveal", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW33xz" }, {
    "proposalId": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW33xz",
    "stage": "ongoing",
    "proposer": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
    "endorser": "0xfbf77d8e2afd1532433dc809fe3108db68313770",
    "isDigix": false,
    "timeCreated": 1537437600,
    "finalVersionIpfsDoc": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW33xz",
    "proposalVersions": [
      {
        "docIpfsHash": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW33xz",
        "title": "DGX on exchanges",
        "description": "DGX on a few other exchanges like Lorem and Ipsum",
        "created": 1537437600,
        "milestoneFundings": [3e18, 4e18],
        finalReward: [2e18],
        moreDocs: ["QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW1234"],
        totalFunding: 9e18
      },
    ],
    "draftVoting": {
      "startTime": 1537438600,
      "votingDeadline": 1538215200,
      "totalVoterStake": 178e9,
      "totalVoterCount": 13,
      "currentResult": 0.85,
      "quorum": 140e9,
      "quota": 0.60,
      "claimed": true,
      "passed": true,
      "funded": false,
    },
    "votingRounds": [
      {
        "startTime": 1538215200,
        "commitDeadline": 1538733600,
        "revealDeadline": 1539338400,
        "totalVoterStake": 1300e9, // 123 DGD,
        "totalVoterCount": 65,
        "currentResult": 0.78, // 61%
        "quorum": 500e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": true,
        "passed": true,
        "funded": true,
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 1539338400,
    "currentVotingRound": 0, // -1 = draftVoting, 0 = first Voting
    "votingStage": "none", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW0000" }, {
    "proposalId": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW0000",
    "stage": "review",
    "proposer": "0x84a0d77c693adabe0ebc48f88b3ffff010577051",
    "endorser": "0xfbf77d8e2afd1532433dc809fe3108db68313770",
    "isDigix": false,
    "timeCreated": 1533895200,
    "finalVersionIpfsDoc": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW123z",
    "proposalVersions": [
      {
        "docIpfsHash": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW0000",
        "title": "Make gold great again",
        "description": "Add more gold to Digix vaults, increase supply of DGX gold-backed tokens. Then loreum ipsum doler simat",
        "created": 1533895200,
        "milestoneFundings": [3e18, 4e18],
        finalReward: [2e18],
        moreDocs: [],
        totalFunding: 9e18
      },
      {
        "docIpfsHash": "QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW123z",
        "title": "Make gold great again",
        "description": "Add even more gold to Digix vaults, increase supply of DGX gold-backed tokens to 100mio. Then loreum ipsum doler simat",
        "created": 1533899200,
        "milestoneFundings": [4e18, 4e18],
        finalReward: [3e18],
        moreDocs: ["QmAtMju6m7xTh3DuokvT3886QRYqxAzb1kShcbnJgW1234"],
        totalFunding: 11e18
      },
    ],
    "draftVoting": {
      "startTime": 1533899500,
      "votingDeadline": 1534759200,
      "totalVoterStake": 188e9,
      "totalVoterCount": 15,
      "currentResult": 0.82,
      "quorum": 140e9,
      "quota": 0.60,
      "claimed": true,
      "passed": true,
      "funded": false,
    },
    "votingRounds": [
      {
        "startTime": 1534759200,
        "commitDeadline": 1535364000,
        "revealDeadline": 1535968800,
        "totalVoterStake": 1400e9, // 123 DGD,
        "totalVoterCount": 71,
        "currentResult": 0.80, // 61%
        "quorum": 500e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": true,
        "passed": true,
        "funded": true,
      },
      {
        "startTime": 1538733600,
        "commitDeadline": 1539338400,
        "revealDeadline": 1540029600,
        "totalVoterStake": 234e9, // 123 DGD,
        "totalVoterCount": 22,
        "currentResult": 0.83, // 61%
        "quorum": 500e9, // 140 DGD
        "quota": 0.60, // 60%
        "claimed": false,
        "passed": false,
        "funded": false,
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 1535968800,
    "currentVotingRound": 1, // -1 = draftVoting, 0 = first Voting
    "votingStage": "reveal", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  proposals.update({ proposalId: "QmTNbkhMpk5gwwSHosV4SQrChvfCg2bucP5pELH6EL9STs" }, {
    "proposalId": "QmTNbkhMpk5gwwSHosV4SQrChvfCg2bucP5pELH6EL9STs",
    "stage": "archived",
    "proposer": "0x84a0d77c693adabe0ebc48f88b3ffff010577123",
    "endorser": "0x2db0e64fa2102a4753e5ca2edeaa6f6a8d193123",
    "isDigix": false,
    "timeCreated": 1539531100,
    "finalVersionIpfsDoc": "QmTNbkhMpk5gwwSHosV4SQrChvfCg2bucP5pELH6EL9STs",
    "proposalVersions": [
      {
        "docIpfsHash": "QmTNbkhMpk5gwwSHosV4SQrChvfCg2bucP5pELH6EL9STs",
        "title": "Some silly proposal",
        "description": "This proposal is so silly, voting failed and its now archived",
        "created": 1539531100,
        "milestoneFundings": [5e18, 5e18],
        finalReward: [5e18],
        moreDocs: [],
        totalFunding: 15e18
      },
    ],
    "draftVoting": {
      "startTime": 1539531100,
      "votingDeadline": 1539533100,
      "totalVoterStake": 192e9,
      "totalVoterCount": 19,
      "currentResult": 0.42,
      "quorum": 140e9,
      "quota": 0.60,
      "claimed": true,
      "passed": false,
      "funded": false,
    },
    "votingRounds": [
      {
      },
    ],
    "currentMilestone": 0,
    "currentMilestoneStart": 0,
    "currentVotingRound": -1, // -1 = draftVoting, 0 = first Voting
    "votingStage": "draftVoting", // draftVoting/commit/reveal/none
    "claimableFunding": 0, // 1 ETH
    "prl": "ok", // ok/paused/stopped
  }, { upsert: true })

  const daoInfo = db.get('daoInfo')
  daoInfo.update({}, {
      "currentQuarter": 1,
      "startOfQuarter": 1533117600, // 1 august 2018
      "startOfMainphase": 1533636000,
      "startOfNextQuarter": 1540893600,
      "totalDgdsLocked": 2000e9 // = 2000 DGD
  }, { "upsert": true })

  const addresses = db.get('addresses')
  addresses.update({"address": "0xd7b99f68d740fa500aae37cc273b7cf7b4b49309"}, {
    "address": "0xd7b99f68d740fa500aae37cc273b7cf7b4b49309", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 120e9, // 123 DGDStake
    "lockedDgd": 200e9, // locked 200 DGD
    "reputationPoint": 200, // 12 Reputation Points
    "quarterPoint": 8e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": true,
  }, { "upsert": true })

  addresses.update({"address": "0x84a0d77c693adabe0ebc48f88b3ffff010577051"}, {
    "address": "0x84a0d77c693adabe0ebc48f88b3ffff010577051", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 3e9, // 123 DGDStake
    "lockedDgd": 3e9, // locked 200 DGD
    "reputationPoint": 0, // 12 Reputation Points
    "quarterPoint": 2e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": false,
  }, { "upsert": true })

  addresses.update({"address": "0xea674fdde714fd979de3edf0f56aa9716b898ec8"}, {
    "address": "0xea674fdde714fd979de3edf0f56aa9716b898ec8", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 5e9, // 123 DGDStake
    "lockedDgd": 5e9, // locked 200 DGD
    "reputationPoint": 10, // 12 Reputation Points
    "quarterPoint": 1e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": false,
  }, { "upsert": true })

  addresses.update({"address": "0x295ba3a07d3e8e72e2c032359449f6d2ba658bfb"}, {
    "address": "0x295ba3a07d3e8e72e2c032359449f6d2ba658bfb", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 110e9, // 123 DGDStake
    "lockedDgd": 140e9, // locked 200 DGD
    "reputationPoint": 240, // 12 Reputation Points
    "quarterPoint": 5e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": true,
  }, { "upsert": true })

  addresses.update({"address": "0xd3f093ca4be548a0cfd0610b3f12ae7a958ccb18"}, {
    "address": "0xd3f093ca4be548a0cfd0610b3f12ae7a958ccb18", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 104e9, // 123 DGDStake
    "lockedDgd": 104e9, // locked 200 DGD
    "reputationPoint": 235, // 12 Reputation Points
    "quarterPoint": 3e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": true,
  }, { "upsert": true })

  addresses.update({"address": "0x74395fe3ce092320ff5d0cc1d79e054f15b1b3b8"}, {
    "address": "0x74395fe3ce092320ff5d0cc1d79e054f15b1b3b8", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 2e9, // 123 DGDStake
    "lockedDgd": 2e9, // locked 200 DGD
    "reputationPoint": 0, // 12 Reputation Points
    "quarterPoint": 0e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": false,
  }, { "upsert": true })

  addresses.update({"address": "0xfbf77d8e2afd1532433dc809fe3108db68313770"}, {
    "address": "0xfbf77d8e2afd1532433dc809fe3108db68313770", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 100e9, // 123 DGDStake
    "lockedDgd": 100e9, // locked 200 DGD
    "reputationPoint": 300, // 12 Reputation Points
    "quarterPoint": 2e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": true,
  }, { "upsert": true })

  addresses.update({"address": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c"}, {
    "address": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c", // Badge holder 0
    "isUser": true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    "lockedDgdStake": 14e9, // 123 DGDStake
    "lockedDgd": 14e9, // locked 200 DGD
    "reputationPoint": 15, // 12 Reputation Points
    "quarterPoint": 2e9, // 8 Quarter Points
    "isParticipant": true,
    "isModerator": false,
  }, { "upsert": true })
}

module.exports = {
  setDummyData
}
