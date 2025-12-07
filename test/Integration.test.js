const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProxyVotingFHE - Integration Tests", function () {
  let proxyVotingFHE;
  let owner;
  let alice;
  let bob;
  let charlie;
  let diana;

  beforeEach(async function () {
    [owner, alice, bob, charlie, diana] = await ethers.getSigners();

    const ProxyVotingFHE = await ethers.getContractFactory("ProxyVotingFHE");
    proxyVotingFHE = await ProxyVotingFHE.deploy();
    await proxyVotingFHE.waitForDeployment();
  });

  describe("Multi-User Voting Scenario", function () {
    beforeEach(async function () {
      // Register all voters
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.registerVoter(bob.address);
      await proxyVotingFHE.registerVoter(charlie.address);

      // Create proposal
      await proxyVotingFHE.createProposal("Should we implement feature X?");
    });

    it("should handle multiple voters voting on same proposal", async function () {
      const mockProof = ethers.randomBytes(32);

      // All voters vote
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);
      await proxyVotingFHE.connect(bob).vote(0, false, mockProof);
      await proxyVotingFHE.connect(charlie).vote(0, true, mockProof);

      // Verify all have voted
      expect(await proxyVotingFHE.hasVoted(0, alice.address)).to.be.true;
      expect(await proxyVotingFHE.hasVoted(0, bob.address)).to.be.true;
      expect(await proxyVotingFHE.hasVoted(0, charlie.address)).to.be.true;
    });

    it("should correctly tally votes from multiple voters", async function () {
      const mockProof = ethers.randomBytes(32);

      // 2 yes, 1 no
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);
      await proxyVotingFHE.connect(bob).vote(0, false, mockProof);
      await proxyVotingFHE.connect(charlie).vote(0, true, mockProof);

      // Fast forward past deadline
      await time.increase(8 * 24 * 60 * 60);

      // Get results
      const mockKey = ethers.randomBytes(32);
      const mockSig = ethers.randomBytes(65);
      const results = await proxyVotingFHE.getProposalResults(0, mockKey, mockSig);

      expect(results[0]).to.equal(2); // 2 yes votes (owner + alice)
      expect(results[1]).to.equal(1); // 1 no vote
    });
  });

  describe("Complex Delegation Scenarios", function () {
    beforeEach(async function () {
      // Register voters
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.registerVoter(bob.address);
      await proxyVotingFHE.registerVoter(charlie.address);
      await proxyVotingFHE.registerVoter(diana.address);
    });

    it("should handle multiple delegations to same delegate", async function () {
      // Multiple voters delegate to Bob
      await proxyVotingFHE.connect(alice).delegateVote(bob.address);
      await proxyVotingFHE.connect(charlie).delegateVote(bob.address);

      // Bob should have accumulated power
      expect(await proxyVotingFHE.votingPower(bob.address)).to.equal(3n);
      expect(await proxyVotingFHE.votingPower(alice.address)).to.equal(0);
      expect(await proxyVotingFHE.votingPower(charlie.address)).to.equal(0);
    });

    it("should handle delegation chain (A→B, then B→C)", async function () {
      // Alice delegates to Bob
      await proxyVotingFHE.connect(alice).delegateVote(bob.address);
      expect(await proxyVotingFHE.votingPower(bob.address)).to.equal(2n);

      // Bob then delegates his accumulated power to Charlie
      await proxyVotingFHE.connect(bob).delegateVote(charlie.address);
      expect(await proxyVotingFHE.votingPower(charlie.address)).to.equal(3n);
      expect(await proxyVotingFHE.votingPower(bob.address)).to.equal(0);
    });

    it("should handle re-delegation between multiple users", async function () {
      // Alice delegates to Bob
      await proxyVotingFHE.connect(alice).delegateVote(bob.address);
      expect(await proxyVotingFHE.votingPower(bob.address)).to.equal(2n);

      // Alice changes mind, delegates to Charlie
      await proxyVotingFHE.connect(alice).delegateVote(charlie.address);
      expect(await proxyVotingFHE.votingPower(bob.address)).to.equal(1n);
      expect(await proxyVotingFHE.votingPower(charlie.address)).to.equal(2n);
    });

    it("should allow delegate to vote with accumulated power", async function () {
      await proxyVotingFHE.createProposal("Test proposal");

      // Alice and Charlie delegate to Bob
      await proxyVotingFHE.connect(alice).delegateVote(bob.address);
      await proxyVotingFHE.connect(charlie).delegateVote(bob.address);

      // Bob votes with accumulated power (3x)
      const mockProof = ethers.randomBytes(32);
      await proxyVotingFHE.connect(bob).vote(0, true, mockProof);

      // Verify vote was cast
      expect(await proxyVotingFHE.hasVoted(0, bob.address)).to.be.true;
    });
  });

  describe("Multiple Proposals Workflow", function () {
    it("should handle multiple active proposals simultaneously", async function () {
      await proxyVotingFHE.registerVoter(alice.address);

      // Create multiple proposals
      await proxyVotingFHE.createProposal("Proposal 1");
      await proxyVotingFHE.createProposal("Proposal 2");
      await proxyVotingFHE.createProposal("Proposal 3");

      expect(await proxyVotingFHE.proposalCount()).to.equal(3);

      // Verify all are active
      const prop1 = await proxyVotingFHE.getProposal(0);
      const prop2 = await proxyVotingFHE.getProposal(1);
      const prop3 = await proxyVotingFHE.getProposal(2);

      expect(prop1[2]).to.be.true; // active
      expect(prop2[2]).to.be.true;
      expect(prop3[2]).to.be.true;
    });

    it("should allow voting on multiple proposals", async function () {
      await proxyVotingFHE.registerVoter(alice.address);

      // Create proposals
      await proxyVotingFHE.createProposal("Proposal 1");
      await proxyVotingFHE.createProposal("Proposal 2");

      const mockProof = ethers.randomBytes(32);

      // Vote on both
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);
      await proxyVotingFHE.connect(alice).vote(1, false, mockProof);

      // Verify votes
      expect(await proxyVotingFHE.hasVoted(0, alice.address)).to.be.true;
      expect(await proxyVotingFHE.hasVoted(1, alice.address)).to.be.true;
    });

    it("should maintain separate vote counts for each proposal", async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.registerVoter(bob.address);

      await proxyVotingFHE.createProposal("Proposal 1");
      await proxyVotingFHE.createProposal("Proposal 2");

      const mockProof = ethers.randomBytes(32);

      // Different votes on different proposals
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);
      await proxyVotingFHE.connect(alice).vote(1, false, mockProof);

      // Verify encrypted votes are different
      const votes1 = await proxyVotingFHE.getEncryptedVotes(0);
      const votes2 = await proxyVotingFHE.getEncryptedVotes(1);

      expect(votes1[0]).to.not.equal(votes2[0]);
    });
  });

  describe("Proposal Lifecycle", function () {
    beforeEach(async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.createProposal("Test proposal");
    });

    it("should complete full proposal lifecycle", async function () {
      const mockProof = ethers.randomBytes(32);

      // 1. Proposal is active
      let proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[2]).to.be.true;

      // 2. Vote on proposal
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);

      // 3. Fast forward past deadline
      await time.increase(8 * 24 * 60 * 60);

      // 4. Close proposal
      await proxyVotingFHE.closeProposal(0);

      // 5. Proposal is now inactive
      proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[2]).to.be.false;
    });

    it("should prevent actions on closed proposal", async function () {
      const mockProof = ethers.randomBytes(32);

      // Close proposal after deadline
      await time.increase(8 * 24 * 60 * 60);
      await proxyVotingFHE.closeProposal(0);

      // Try to vote
      await expect(
        proxyVotingFHE.connect(alice).vote(0, true, mockProof)
      ).to.be.revertedWith("Proposal not active");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("should have efficient gas usage for voter registration", async function () {
      const tx = await proxyVotingFHE.registerVoter(alice.address);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(100000); // Less than 100k gas
    });

    it("should have efficient gas usage for proposal creation", async function () {
      const tx = await proxyVotingFHE.createProposal("Test proposal");
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // Less than 200k gas
    });

    it("should have efficient gas usage for voting", async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.createProposal("Test");

      const mockProof = ethers.randomBytes(32);
      const tx = await proxyVotingFHE.connect(alice).vote(0, true, mockProof);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // Less than 200k gas
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("should handle empty proposal description", async function () {
      await proxyVotingFHE.createProposal("");
      const proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[0]).to.equal("");
    });

    it("should handle very long proposal description", async function () {
      const longDescription = "A".repeat(500);
      await proxyVotingFHE.createProposal(longDescription);
      const proposal = await proxyVotingFHE.getProposal(0);
      expect(proposal[0]).to.equal(longDescription);
    });

    it("should handle voting at exact deadline timestamp", async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.createProposal("Test");

      const proposal = await proxyVotingFHE.getProposal(0);
      const deadline = proposal[1];

      // Set time to exact deadline
      await time.setNextBlockTimestamp(deadline);

      const mockProof = ethers.randomBytes(32);
      await proxyVotingFHE.connect(alice).vote(0, true, mockProof);

      expect(await proxyVotingFHE.hasVoted(0, alice.address)).to.be.true;
    });

    it("should reject voting one second after deadline", async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.createProposal("Test");

      const proposal = await proxyVotingFHE.getProposal(0);
      const deadline = proposal[1];

      // Set time to one second after deadline
      await time.setNextBlockTimestamp(deadline + 1n);

      const mockProof = ethers.randomBytes(32);
      await expect(
        proxyVotingFHE.connect(alice).vote(0, true, mockProof)
      ).to.be.revertedWith("Voting period ended");
    });

    it("should maintain state consistency across operations", async function () {
      await proxyVotingFHE.registerVoter(alice.address);
      await proxyVotingFHE.registerVoter(bob.address);

      // Initial state
      expect(await proxyVotingFHE.votingPower(alice.address)).to.equal(1n);

      // Delegate
      await proxyVotingFHE.connect(alice).delegateVote(bob.address);
      expect(await proxyVotingFHE.votingPower(alice.address)).to.equal(0);

      // Revoke
      await proxyVotingFHE.connect(alice).revokeDelegation();
      expect(await proxyVotingFHE.votingPower(alice.address)).to.equal(1n);
    });
  });
});
