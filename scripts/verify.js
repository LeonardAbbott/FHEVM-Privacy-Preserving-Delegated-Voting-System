const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Contract Verification Script");
  console.log("=".repeat(50));

  // Get contract address from command line or deployment file
  let contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    // Try to read from latest deployment file
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
        console.log(`Using contract address from ${files[0]}`);
      }
    }
  }

  if (!contractAddress) {
    console.error("❌ Error: Contract address not found");
    console.log("Please provide contract address using one of these methods:");
    console.log("1. Set CONTRACT_ADDRESS environment variable");
    console.log("2. Pass as command line argument");
    console.log("\nExample:");
    console.log("  CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.js --network sepolia");
    process.exit(1);
  }

  console.log("Contract address:", contractAddress);

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("=".repeat(50));

  // Verify the contract is deployed
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("❌ Error: No contract found at address:", contractAddress);
    process.exit(1);
  }

  console.log("✅ Contract found at address");
  console.log("\nStarting verification on Etherscan...");
  console.log("This may take a few moments...\n");

  try {
    // Verify the contract on Etherscan
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/ProxyVotingFHE.sol:ProxyVotingFHE"
    });

    console.log("=".repeat(50));
    console.log("✅ Contract verified successfully!");
    console.log("=".repeat(50));

    if (network.chainId === 11155111n) {
      console.log("\nView verified contract at:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("=".repeat(50));
      console.log("ℹ️  Contract is already verified!");
      console.log("=".repeat(50));

      if (network.chainId === 11155111n) {
        console.log("\nView verified contract at:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      }
    } else {
      console.error("=".repeat(50));
      console.error("❌ Verification failed:");
      console.error(error.message);
      console.error("=".repeat(50));

      console.log("\nTroubleshooting tips:");
      console.log("1. Ensure ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Wait a few blocks after deployment before verifying");
      console.log("3. Check that the contract address is correct");
      console.log("4. Verify you're using the correct network");

      process.exit(1);
    }
  }

  // Display contract information
  console.log("\n" + "=".repeat(50));
  console.log("CONTRACT INFORMATION");
  console.log("=".repeat(50));

  try {
    const ProxyVotingFHE = await hre.ethers.getContractAt("ProxyVotingFHE", contractAddress);

    const proposalCount = await ProxyVotingFHE.proposalCount();
    const votingPeriod = await ProxyVotingFHE.VOTING_PERIOD();
    const owner = await ProxyVotingFHE.owner();

    console.log("Contract Name: ProxyVotingFHE");
    console.log("Owner:", owner);
    console.log("Proposal Count:", proposalCount.toString());
    console.log("Voting Period:", (Number(votingPeriod) / 86400).toString(), "days");
    console.log("=".repeat(50));
  } catch (error) {
    console.log("Could not fetch contract details");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification script failed:", error);
    process.exit(1);
  });
