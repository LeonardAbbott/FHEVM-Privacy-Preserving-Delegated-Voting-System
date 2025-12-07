const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Contract Interaction Script");
  console.log("=".repeat(50));

  // Get contract address
  let contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    const deploymentsDir = "./deployments";
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0]), 'utf8')
        );
        contractAddress = latestDeployment.address;
        console.log(`Using contract from: ${files[0]}`);
      }
    }
  }

  if (!contractAddress) {
    console.error("❌ Contract address not found");
    console.log("Set CONTRACT_ADDRESS environment variable or deploy contract first");
    process.exit(1);
  }

  console.log("Contract address:", contractAddress);

  // Get signers
  const [owner, voter1, voter2] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Voter1 address:", voter1.address);
  console.log("Voter2 address:", voter2.address);

  // Connect to contract
  const ProxyVotingFHE = await hre.ethers.getContractAt("ProxyVotingFHE", contractAddress);
  console.log("=".repeat(50));

  // Display current contract state
  console.log("\nCURRENT CONTRACT STATE");
  console.log("-".repeat(50));

  try {
    const proposalCount = await ProxyVotingFHE.proposalCount();
    const votingPeriod = await ProxyVotingFHE.VOTING_PERIOD();
    const contractOwner = await ProxyVotingFHE.owner();

    console.log("Contract Owner:", contractOwner);
    console.log("Total Proposals:", proposalCount.toString());
    console.log("Voting Period:", (Number(votingPeriod) / 86400).toString(), "days");

    // Check if owner is registered
    const ownerRegistered = await ProxyVotingFHE.isRegisteredVoter(owner.address);
    console.log("Owner Registered:", ownerRegistered);

    if (ownerRegistered) {
      const ownerPower = await ProxyVotingFHE.votingPower(owner.address);
      console.log("Owner Voting Power:", ownerPower.toString());
    }

    console.log("=".repeat(50));
  } catch (error) {
    console.error("Error reading contract state:", error.message);
  }

  // Interactive menu
  console.log("\nAVAILABLE ACTIONS");
  console.log("=".repeat(50));
  console.log("1. Register voters");
  console.log("2. Create a proposal");
  console.log("3. Vote on a proposal");
  console.log("4. Delegate vote");
  console.log("5. Revoke delegation");
  console.log("6. View proposal details");
  console.log("7. View voting results (owner only)");
  console.log("8. Run full demo");
  console.log("=".repeat(50));

  // For automated demo, run option 8
  const action = process.env.ACTION || "8";
  console.log(`\nExecuting action: ${action}\n`);

  try {
    switch (action) {
      case "1":
        await registerVoters(ProxyVotingFHE, owner, [voter1.address, voter2.address]);
        break;

      case "2":
        await createProposal(ProxyVotingFHE, owner);
        break;

      case "3":
        await castVote(ProxyVotingFHE, voter1, 0, true);
        break;

      case "4":
        await delegateVote(ProxyVotingFHE, voter1, voter2.address);
        break;

      case "5":
        await revokeDelegation(ProxyVotingFHE, voter1);
        break;

      case "6":
        await viewProposal(ProxyVotingFHE, 0);
        break;

      case "7":
        await viewResults(ProxyVotingFHE, owner, 0);
        break;

      case "8":
        await runFullDemo(ProxyVotingFHE, owner, voter1, voter2);
        break;

      default:
        console.log("Invalid action");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Interaction complete!");
  console.log("=".repeat(50));
}

// Helper functions
async function registerVoters(contract, owner, voterAddresses) {
  console.log("REGISTERING VOTERS");
  console.log("-".repeat(50));

  for (const voterAddress of voterAddresses) {
    try {
      const isRegistered = await contract.isRegisteredVoter(voterAddress);
      if (isRegistered) {
        console.log(`ℹ️  ${voterAddress} is already registered`);
        continue;
      }

      console.log(`Registering ${voterAddress}...`);
      const tx = await contract.connect(owner).registerVoter(voterAddress);
      await tx.wait();
      console.log(`✅ Registered successfully (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`❌ Failed to register ${voterAddress}:`, error.message);
    }
  }
}

async function createProposal(contract, owner) {
  console.log("CREATING PROPOSAL");
  console.log("-".repeat(50));

  const description = "Should we implement the new privacy features?";
  console.log("Proposal:", description);

  const tx = await contract.connect(owner).createProposal(description);
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Proposal created successfully");
  console.log("Gas used:", receipt.gasUsed.toString());

  const proposalId = await contract.proposalCount() - 1n;
  console.log("Proposal ID:", proposalId.toString());

  return proposalId;
}

async function castVote(contract, voter, proposalId, voteYes) {
  console.log("CASTING VOTE");
  console.log("-".repeat(50));

  console.log("Proposal ID:", proposalId);
  console.log("Vote:", voteYes ? "YES" : "NO");
  console.log("Voter:", voter.address);

  // Create mock encrypted proof
  const mockProof = hre.ethers.randomBytes(32);

  const tx = await contract.connect(voter).vote(proposalId, voteYes, mockProof);
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Vote cast successfully");
  console.log("Gas used:", receipt.gasUsed.toString());
}

async function delegateVote(contract, delegator, delegateAddress) {
  console.log("DELEGATING VOTE");
  console.log("-".repeat(50));

  console.log("Delegator:", delegator.address);
  console.log("Delegate:", delegateAddress);

  const tx = await contract.connect(delegator).delegateVote(delegateAddress);
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Vote delegated successfully");

  // Check delegation
  const delegation = await contract.getDelegation(delegator.address);
  console.log("Delegation status:", delegation[1] ? "Active" : "Inactive");
  console.log("Delegate address:", delegation[0]);
}

async function revokeDelegation(contract, delegator) {
  console.log("REVOKING DELEGATION");
  console.log("-".repeat(50));

  console.log("Delegator:", delegator.address);

  const tx = await contract.connect(delegator).revokeDelegation();
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Delegation revoked successfully");
}

async function viewProposal(contract, proposalId) {
  console.log("PROPOSAL DETAILS");
  console.log("-".repeat(50));

  const proposal = await contract.getProposal(proposalId);
  console.log("Proposal ID:", proposalId);
  console.log("Description:", proposal[0]);
  console.log("Deadline:", new Date(Number(proposal[1]) * 1000).toLocaleString());
  console.log("Active:", proposal[2]);

  // Get encrypted votes
  const encryptedVotes = await contract.getEncryptedVotes(proposalId);
  console.log("\nEncrypted Votes:");
  console.log("Yes votes hash:", encryptedVotes[0]);
  console.log("No votes hash:", encryptedVotes[1]);
}

async function viewResults(contract, owner, proposalId) {
  console.log("PROPOSAL RESULTS");
  console.log("-".repeat(50));

  try {
    // Mock public key and signature for decryption
    const mockPublicKey = hre.ethers.randomBytes(32);
    const mockSignature = hre.ethers.randomBytes(65);

    const results = await contract.connect(owner).getProposalResults(
      proposalId,
      mockPublicKey,
      mockSignature
    );

    console.log("Proposal ID:", proposalId);
    console.log("Yes Votes:", results[0].toString());
    console.log("No Votes:", results[1].toString());
    console.log("Total Votes:", (Number(results[0]) + Number(results[1])).toString());

    if (results[0] > results[1]) {
      console.log("Result: PASSED ✅");
    } else if (results[1] > results[0]) {
      console.log("Result: REJECTED ❌");
    } else {
      console.log("Result: TIE");
    }
  } catch (error) {
    console.error("❌ Error viewing results:", error.message);
  }
}

async function runFullDemo(contract, owner, voter1, voter2) {
  console.log("RUNNING FULL DEMONSTRATION");
  console.log("=".repeat(50));

  try {
    // Step 1: Register voters
    console.log("\n📝 Step 1: Registering voters...");
    await registerVoters(contract, owner, [voter1.address, voter2.address]);

    // Step 2: Create proposal
    console.log("\n📝 Step 2: Creating proposal...");
    const proposalId = await createProposal(contract, owner);

    // Step 3: Cast votes
    console.log("\n📝 Step 3: Casting votes...");
    await castVote(contract, voter1, proposalId, true);

    // Step 4: Test delegation
    console.log("\n📝 Step 4: Testing delegation...");
    await delegateVote(contract, voter2, voter1.address);

    // Step 5: View proposal
    console.log("\n📝 Step 5: Viewing proposal details...");
    await viewProposal(contract, proposalId);

    console.log("\n✅ Full demonstration completed successfully!");
    console.log("\nNote: To view results, wait for the voting period to end and run:");
    console.log(`ACTION=7 npx hardhat run scripts/interact.js --network <network>`);

  } catch (error) {
    console.error("❌ Demo failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
