module.exports = (db) => {
  const proposals = db.get('proposals');
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

  const daoInfo = db.get('daoInfo');
  daoInfo.update({}, {
    currentQuarter: 1,
    startOfQuarter: 1539052987, // in seconds
    startOfMainphase: 1540512000, // 25 Oct 2018
    startOfNextQuarter: 1543622400, // 1 dec 2018
    totalDgdsLocked: 1234e9, // = 1234 DGD
  }, { upsert: true });

  const addresses = db.get('addresses');
  addresses.update({ address: '0x6ed6e4bc5341d8d53bca4ee5df6f0e1970f49918' }, {
    address: '0x6ed6e4bc5341d8d53bca4ee5df6f0e1970f49918', // Badge holder 0
    isUser: true, // whether this address is a user. In ther words, whether this address has locked DGDs at least once
    lockedDgdStake: 123e9, // 123 DGDStake
    lockedDgd: 200e9, // locked 200 DGD
    reputationPoint: 1200e9, // 12 Reputation Points
    quarterPoint: 8e9, // 8 Quarter Points
    isParticipant: true,
    isModerator: true,
    votes: {
      proposalId: {
        draftVoting: {
          commit: true,
          reveal: true,
        },
        votingRound: {
          0: {
            commit: true,
            reveal: true,
          },
          1: {
            commit: true,
            reveal: false,
          },
        },
      },
    },
  }, { upsert: true });
  // db.close()
};
