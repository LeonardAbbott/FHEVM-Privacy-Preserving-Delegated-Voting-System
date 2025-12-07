const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProxyVotingFHE", function () {
  let proxyVotingFHE;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let nonVoter;

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    // Deploy contract
    const ProxyVotingFHE = await ethers.getContractFactory("ProxyVotingFHE");
    proxyVotingFHE = await ProxyVotingFHE.deploy();
    await proxyVotingFHE.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await proxyVotingFHE.owner()).to.equal(owner.address);
    });

    it("Should register owner as voter with voting power 1", async function () {
      expect(await proxyVotingFHE.isRegisteredVoter(owner.address)).to.be.true;
      expect(await proxyVotingFHE.votingPower(owner.address)).to.equal(1);
    });

    it("Should initialize with zero proposals", async function () {
      expect(await proxyVotingFHE.proposalCount()).to.equal(0);
    });

    it("Should set correct voting period", async function () {
      const EXPECTED_VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
      expect(await proxyVotingFHE.VOTING_PERIOD()).to.equal(EXPECTED_VOTING_PERIOD);
    });
  });

  describe("Voter Registration", function () {
    it("Should allow owner to register new voters", async function () {
      await expect(proxyVotingFHE.registerVoter(voter1.address))
        .to.emit(proxyVotingFHE, "VoterRegistered")
        .withArgs(voter1.address);

      expect(await proxyVotingFHE.isRegisteredVoter(voter1.address)).to.be.true;
      expect(await proxyVotingFHE.votingPower(voter1.address)).to.equal(1);
    });

    it("Should not allow non-owner to register voters", async function () {
      await expect(
        proxyVotingFHE.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWithCustomError(proxyVotingFHE, "OwnableUnauthorizedAccount");
    });

    it("Should not allow registering the same voter twice", async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await expect(
        proxyVotingFHE.registerVoter(voter1.address)
      ).to.be.revertedWith("Voter already registered");
    });

    it("Should register multiple voters", async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await proxyVotingFHE.registerVoter(voter2.address);
      await proxyVotingFHE.registerVoter(voter3.address);

      expect(await proxyVotingFHE.isRegisteredVoter(voter1.address)).to.be.true;
      expect(await proxyVotingFHE.isRegisteredVoter(voter2.address)).to.be.true;
      expect(await proxyVotingFHE.isRegisteredVoter(voter3.address)).to.be.true;
    });
  });

  describe("Proposal Creation", function () {
    it("Should allow owner to create proposals", async function () {
      const description = "Should we implement feature X?";

      await expect(proxyVotingFHE.createProposal(description))
        .to.emit(proxyVotingFHE, "ProposalCreated");

      expect(await proxyVotingFHE.proposalCount()).to.equal(1);

      const proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[0]).to.equal(description);
      expect(proposal[2]).to.be.true; // active
    });

    it("Should not allow non-owner to create proposals", async function () {
      await expect(
        proxyVotingFHE.connect(voter1).createProposal("Test proposal")
      ).to.be.revertedWithCustomError(proxyVotingFHE, "OwnableUnauthorizedAccount");
    });

    it("Should set correct deadline for proposals", async function () {
      await proxyVotingFHE.createProposal("Test proposal");

      const proposal = await proxyVotingFHE.getProposal(0);
      const currentTime = await time.latest();
      const expectedDeadline = currentTime + (7 * 24 * 60 * 60); // 7 days

      expect(proposal[1]).to.be.closeTo(expectedDeadline, 10); // Allow 10 seconds tolerance
    });

    it("Should create multiple proposals with sequential IDs", async function () {
      await proxyVotingFHE.createProposal("Proposal 1");
      await proxyVotingFHE.createProposal("Proposal 2");
      await proxyVotingFHE.createProposal("Proposal 3");

      expect(await proxyVotingFHE.proposalCount()).to.equal(3);

      const proposal1 = await proxyVotingFHE.getProposal(0);
      const proposal2 = await proxyVotingFHE.getProposal(1);
      const proposal3 = await proxyVotingFHE.getProposal(2);

      expect(proposal1[0]).to.equal("Proposal 1");
      expect(proposal2[0]).to.equal("Proposal 2");
      expect(proposal3[0]).to.equal("Proposal 3");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await proxyVotingFHE.createProposal("Test proposal");
    });

    it("Should allow registered voters to vote", async function () {
      const mockProof = ethers.randomBytes(32);

      await expect(proxyVotingFHE.connect(voter1).vote(0, true, mockProof))
        .to.emit(proxyVotingFHE, "VoteCast")
        .withArgs(0, voter1.address, true);

      expect(await proxyVotingFHE.hasVoted(0, voter1.address)).to.be.true;
    });

    it("Should not allow non-registered voters to vote", async function () {
      const mockProof = ethers.randomBytes(32);

      await expect(
        proxyVotingFHE.connect(nonVoter).vote(0, true, mockProof)
      ).to.be.revertedWith("Not a registered voter");
    });

    it("Should not allow double voting", async function () {
      const mockProof = ethers.randomBytes(32);

      await proxyVotingFHE.connect(voter1).vote(0, true, mockProof);

      await expect(
        proxyVotingFHE.connect(voter1).vote(0, false, mockProof)
      ).to.be.revertedWith("Already voted");
    });

    it("Should not allow voting on invalid proposal", async function () {
      const mockProof = ethers.randomBytes(32);

      await expect(
        proxyVotingFHE.connect(voter1).vote(999, true, mockProof)
      ).to.be.revertedWith("Invalid proposal ID");
    });

    it("Should not allow voting after deadline", async function () {
      const mockProof = ethers.randomBytes(32);

      // Increase time by 8 days (past the 7-day deadline)
      await time.increase(8 * 24 * 60 * 60);

      await expect(
        proxyVotingFHE.connect(voter1).vote(0, true, mockProof)
      ).to.be.revertedWith("Voting period ended");
    });

    it("Should update encrypted vote hashes", async function () {
      const mockProof = ethers.randomBytes(32);

      const votesBefore = await proxyVotingFHE.getEncryptedVotes(0);
      await proxyVotingFHE.connect(voter1).vote(0, true, mockProof);
      const votesAfter = await proxyVotingFHE.getEncryptedVotes(0);

      expect(votesBefore[0]).to.not.equal(votesAfter[0]); // Yes votes hash changed
    });
  });

  describe("Delegation", function () {
    beforeEach(async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await proxyVotingFHE.registerVoter(voter2.address);
    });

    it("Should allow voters to delegate their votes", async function () {
      await expect(proxyVotingFHE.connect(voter1).delegateVote(voter2.address))
        .to.emit(proxyVotingFHE, "DelegationSet")
        .withArgs(voter1.address, voter2.address);

      const delegation = await proxyVotingFHE.getDelegation(voter1.address);
      expect(delegation[0]).to.equal(voter2.address); // delegate address
      expect(delegation[1]).to.be.true; // active
    });

    it("Should transfer voting power when delegating", async function () {
      const voter1PowerBefore = await proxyVotingFHE.votingPower(voter1.address);
      const voter2PowerBefore = await proxyVotingFHE.votingPower(voter2.address);

      await proxyVotingFHE.connect(voter1).delegateVote(voter2.address);

      const voter1PowerAfter = await proxyVotingFHE.votingPower(voter1.address);
      const voter2PowerAfter = await proxyVotingFHE.votingPower(voter2.address);

      expect(voter1PowerAfter).to.equal(0);
      expect(voter2PowerAfter).to.equal(voter2PowerBefore + voter1PowerBefore);
    });

    it("Should not allow delegating to self", async function () {
      await expect(
        proxyVotingFHE.connect(voter1).delegateVote(voter1.address)
      ).to.be.revertedWith("Cannot delegate to yourself");
    });

    it("Should not allow delegating to non-registered voter", async function () {
      await expect(
        proxyVotingFHE.connect(voter1).delegateVote(nonVoter.address)
      ).to.be.revertedWith("Delegate must be registered voter");
    });

    it("Should not allow non-registered voter to delegate", async function () {
      await expect(
        proxyVotingFHE.connect(nonVoter).delegateVote(voter1.address)
      ).to.be.revertedWith("Not a registered voter");
    });

    it("Should allow revoking delegation", async function () {
      await proxyVotingFHE.connect(voter1).delegateVote(voter2.address);

      await expect(proxyVotingFHE.connect(voter1).revokeDelegation())
        .to.emit(proxyVotingFHE, "DelegationRevoked")
        .withArgs(voter1.address);

      const delegation = await proxyVotingFHE.getDelegation(voter1.address);
      expect(delegation[1]).to.be.false; // not active
    });

    it("Should restore voting power when revoking delegation", async function () {
      await proxyVotingFHE.connect(voter1).delegateVote(voter2.address);

      const voter1PowerBefore = await proxyVotingFHE.votingPower(voter1.address);
      const voter2PowerBefore = await proxyVotingFHE.votingPower(voter2.address);

      await proxyVotingFHE.connect(voter1).revokeDelegation();

      const voter1PowerAfter = await proxyVotingFHE.votingPower(voter1.address);
      const voter2PowerAfter = await proxyVotingFHE.votingPower(voter2.address);

      expect(voter1PowerAfter).to.equal(1);
      expect(voter2PowerAfter).to.equal(voter2PowerBefore - 1n);
    });

    it("Should not allow voting while delegation is active", async function () {
      await proxyVotingFHE.createProposal("Test proposal");
      await proxyVotingFHE.connect(voter1).delegateVote(voter2.address);

      const mockProof = ethers.randomBytes(32);

      await expect(
        proxyVotingFHE.connect(voter1).vote(0, true, mockProof)
      ).to.be.revertedWith("Cannot vote while delegation is active");
    });

    it("Should allow re-delegation to different address", async function () {
      await proxyVotingFHE.registerVoter(voter3.address);

      await proxyVotingFHE.connect(voter1).delegateVote(voter2.address);
      await proxyVotingFHE.connect(voter1).delegateVote(voter3.address);

      const delegation = await proxyVotingFHE.getDelegation(voter1.address);
      expect(delegation[0]).to.equal(voter3.address);
      expect(delegation[1]).to.be.true;

      // Check voting power is correctly transferred
      expect(await proxyVotingFHE.votingPower(voter1.address)).to.equal(0);
      expect(await proxyVotingFHE.votingPower(voter2.address)).to.equal(1);
      expect(await proxyVotingFHE.votingPower(voter3.address)).to.equal(2);
    });
  });

  describe("Results Decryption", function () {
    beforeEach(async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await proxyVotingFHE.registerVoter(voter2.address);
      await proxyVotingFHE.createProposal("Test proposal");
    });

    it("Should allow owner to view results after deadline", async function () {
      // Vote
      const mockProof = ethers.randomBytes(32);
      await proxyVotingFHE.connect(voter1).vote(0, true, mockProof);
      await proxyVotingFHE.connect(voter2).vote(0, false, mockProof);

      // Move past deadline
      await time.increase(8 * 24 * 60 * 60);

      // Get results
      const mockPublicKey = ethers.randomBytes(32);
      const mockSignature = ethers.randomBytes(65);

      const results = await proxyVotingFHE.getProposalResults(
        0,
        mockPublicKey,
        mockSignature
      );

      expect(results[0]).to.equal(1); // 1 yes vote
      expect(results[1]).to.equal(1); // 1 no vote
    });

    it("Should not allow viewing results before deadline", async function () {
      const mockPublicKey = ethers.randomBytes(32);
      const mockSignature = ethers.randomBytes(65);

      await expect(
        proxyVotingFHE.getProposalResults(0, mockPublicKey, mockSignature)
      ).to.be.revertedWith("Voting still active");
    });

    it("Should not allow non-owner to view results", async function () {
      await time.increase(8 * 24 * 60 * 60);

      const mockPublicKey = ethers.randomBytes(32);
      const mockSignature = ethers.randomBytes(65);

      await expect(
        proxyVotingFHE.connect(voter1).getProposalResults(0, mockPublicKey, mockSignature)
      ).to.be.revertedWithCustomError(proxyVotingFHE, "OwnableUnauthorizedAccount");
    });
  });

  describe("Proposal Management", function () {
    beforeEach(async function () {
      await proxyVotingFHE.createProposal("Test proposal");
    });

    it("Should allow owner to close proposal after deadline", async function () {
      await time.increase(8 * 24 * 60 * 60);

      await proxyVotingFHE.closeProposal(0);

      const proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[2]).to.be.false; // not active
    });

    it("Should not allow closing proposal before deadline", async function () {
      await expect(
        proxyVotingFHE.closeProposal(0)
      ).to.be.revertedWith("Voting still active");
    });

    it("Should not allow voting on closed proposal", async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await time.increase(8 * 24 * 60 * 60);
      await proxyVotingFHE.closeProposal(0);

      const mockProof = ethers.randomBytes(32);

      await expect(
        proxyVotingFHE.connect(voter1).vote(0, true, mockProof)
      ).to.be.revertedWith("Proposal not active");
    });
  });

  describe("Encrypted Votes", function () {
    beforeEach(async function () {
      await proxyVotingFHE.registerVoter(voter1.address);
      await proxyVotingFHE.createProposal("Test proposal");
    });

    it("Should return encrypted vote hashes", async function () {
      const votes = await proxyVotingFHE.getEncryptedVotes(0);

      expect(votes[0]).to.not.equal(ethers.ZeroHash);
      expect(votes[1]).to.not.equal(ethers.ZeroHash);
    });

    it("Should change encrypted hash when votes are cast", async function () {
      const votesBefore = await proxyVotingFHE.getEncryptedVotes(0);

      const mockProof = ethers.randomBytes(32);
      await proxyVotingFHE.connect(voter1).vote(0, true, mockProof);

      const votesAfter = await proxyVotingFHE.getEncryptedVotes(0);

      expect(votesBefore[0]).to.not.equal(votesAfter[0]);
    });
  });
});
