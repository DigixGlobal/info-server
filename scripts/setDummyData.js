module.exports = (db) => {
  const proposals = db.collection('proposals');
  proposals.update({ proposalId: '0xwef23fwef' }, {
    proposalId: '0xwef23fwef', // is not finalized yet
    stage: 'idea',
    proposer: '0x1234we..',
    endorser: '0x231423..',
    isDigix: false,
    timeCreated: 1539052890,
    finalVersionIpfsDoc: '',
    proposalVersions: [
      {
        docIpfsHash: 'Qm..',
        created: 1539052890,
        milestoneFundings: [1e18, 2e18],
        finalReward: [1e18],
        moreDocs: ['Qm..', 'Qm..'],
        totalFunding: 4e18,
        // dijix
        dijixObject: {
          title: 'first title',
          description: 'first description first description',
          details: 'first details first details first details first details first details',
          milestones: [
            {
              title: 'first milestone',
              description: 'first milestone description in detail',
            },
            {
              title: 'second milestone',
              description: 'second milestone description in detail',
            },
          ],
          images: [
            'Qm34...',
            'Qm12...',
          ],
          videos: [
            'Qm45...',
            'Qm23...',
          ],
        },
        // dijix
      },
    ],
    draftVoting: {
      startTime: 1540425600, // 25 Oct 2018
      votingDeadline: 1540512000, // 26 Oct 2018
      totalVoterStake: 123e9, // 123 DGD,
      totalVoterCount: 12,
      currentResult: 0.61, // 61%
      quorum: 140e9, // 140 DGD
      quota: 0.60, // 60%
      claimed: false,
      passed: false,
      funded: false,
    },
    votingRounds: [
      { // voting round 0
        startTime: 1540598400,
        commitDeadline: 1540598400,
        revealDeadline: 1540598400,
        totalVoterStake: 123e9, // 123 DGD,
        totalCommitCount: 13,
        totalVoterCount: 12,
        currentResult: 0.61, // 61%
        quorum: 140e9, // 140 DGD
        quota: 0.60, // 60%
        claimed: false,
        passed: false,
        funded: false,
      },
    ],
    currentMilestone: 0,
    currentMilestoneStart: 0,
    currentVotingRound: -2, // -1 = draftVoting, 0 = first Voting
    votingStage: 'none', // draftVoting/commit/reveal/none
    claimableFunding: 0, // 1 ETH
    prl: 'ok', // ok/paused/stopped
  }, { upsert: true });

  const daoInfo = db.collection('daoInfo');
  daoInfo.update({}, {
    index: 'index',
    currentQuarter: 1,
    startOfQuarter: 1539052987, // in seconds
    startOfMainphase: 1540512000, // 25 Oct 2018
    startOfNextQuarter: 1543622400, // 1 dec 2018
    totalLockedDgds: 1234e9, // = 1234 DGD
    totalModeratorLockedDgds: 234e9, // 234 DGD
  }, { upsert: true });

  const addresses = db.collection('addresses');
  addresses.update({ address: '0x6ed6e4bc5341d8d53bca4ee5df6f0e1970f49918' }, {
    address: '0x6ed6e4bc5341d8d53bca4ee5df6f0e1970f49918', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 123e9, // 123 DGDStake
    lockedDgd: 200e9, // locked 200 DGD
    reputationPoint: 1200e9, // 12 Reputation Points
    quarterPoint: 8e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
    lastParticipatedQuarter: 1,
    votes: {
      proposalId: {
        draftVoting: {
          vote: true,
        },
        votingRound: {
          0: {
            commit: true,
            reveal: true,
            vote: true, // whether voted for or against
          },
          1: {
            commit: true,
            reveal: false,
          },
        },
      },
    },
  }, { upsert: true });

  // add the ganache accounts
  addresses.update({ address: '0x9f244f9316426030bca51baf35a4541422ab4f76' }, {
    address: '0x9f244f9316426030bca51baf35a4541422ab4f76', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 120e9, // 123 DGDStake
    lockedDgd: 200e9, // locked 200 DGD
    reputationPoint: 2001e8, // 12 Reputation Points
    quarterPoint: 8e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
  }, { upsert: true });

  addresses.update({ address: '0x0b2b99eb6850df81452df017d278f97d26426ace' }, {
    address: '0x0b2b99eb6850df81452df017d278f97d26426ace', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 104e9, // 123 DGDStake
    lockedDgd: 104e9, // locked 200 DGD
    reputationPoint: 235e9, // 12 Reputation Points
    quarterPoint: 3e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
  }, { upsert: true });

  addresses.update({ address: '0x5d1e440153966c5ab576457f702a1778e27d44c7' }, {
    address: '0x5d1e440153966c5ab576457f702a1778e27d44c7', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 120e9, // 123 DGDStake
    lockedDgd: 200e9, // locked 200 DGD
    reputationPoint: 2001e8, // 12 Reputation Points
    quarterPoint: 8e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
  }, { upsert: true });

  addresses.update({ address: '0x508221f68118d1eaa631d261aca3f2fccc6ecf91' }, {
    address: '0x508221f68118d1eaa631d261aca3f2fccc6ecf91', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 110e9, // 123 DGDStake
    lockedDgd: 140e9, // locked 200 DGD
    reputationPoint: 240e9, // 12 Reputation Points
    quarterPoint: 5e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
  }, { upsert: true });

  // ganache dgd holders
  addresses.update({ address: '0x519774b813dd6de58554219f16c6aa8350b8ec99' }, {
    address: '0x519774b813dd6de58554219f16c6aa8350b8ec99', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 10e9, // 123 DGDStake
    lockedDgd: 10e9, // locked 200 DGD
    reputationPoint: 9e9, // 12 Reputation Points
    quarterPoint: 1e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });

  addresses.update({ address: '0xca731a9a354be04b8ebfcd9e429f85f48113d403' }, {
    address: '0xca731a9a354be04b8ebfcd9e429f85f48113d403', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 12e9, // 123 DGDStake
    lockedDgd: 12e9, // locked 200 DGD
    reputationPoint: 12e9, // 12 Reputation Points
    quarterPoint: 3e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });

  addresses.update({ address: '0x1a4d420bff04e68fb76096ec3cbe981f509c3341' }, {
    address: '0x1a4d420bff04e68fb76096ec3cbe981f509c3341', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 14e9, // 123 DGDStake
    lockedDgd: 14e9, // locked 200 DGD
    reputationPoint: 15e9, // 12 Reputation Points
    quarterPoint: 2e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });

  addresses.update({ address: '0x11ad4d13bcca312e83eec8f961ada76c41c0ef09' }, {
    address: '0x11ad4d13bcca312e83eec8f961ada76c41c0ef09', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 7e9, // 123 DGDStake
    lockedDgd: 7e9, // locked 200 DGD
    reputationPoint: 0, // 12 Reputation Points
    quarterPoint: 0e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });

  addresses.update({ address: '0xad127e217086779bc0a03b75adee5f5d729aa4eb' }, {
    address: '0xad127e217086779bc0a03b75adee5f5d729aa4eb', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 2e9, // 123 DGDStake
    lockedDgd: 2e9, // locked 200 DGD
    reputationPoint: 0, // 12 Reputation Points
    quarterPoint: 0e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });

  addresses.update({ address: '0x0d4f271e282ddcc7290ad3569458d2c399f34eb6' }, {
    address: '0x0d4f271e282ddcc7290ad3569458d2c399f34eb6', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 5e9, // 123 DGDStake
    lockedDgd: 5e9, // locked 200 DGD
    reputationPoint: 10e9, // 12 Reputation Points
    quarterPoint: 1e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: false,
  }, { upsert: true });
  // db.close()
};
