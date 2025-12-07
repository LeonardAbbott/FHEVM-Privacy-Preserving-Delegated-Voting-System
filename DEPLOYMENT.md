# Deployment Guide - Privacy Voting System

Complete guide for deploying, testing, and verifying the Privacy-Preserving Delegated Voting System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Testnet Deployment](#testnet-deployment)
5. [Contract Verification](#contract-verification)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Git**: Latest version
- **MetaMask**: Browser extension installed

### Required Accounts

1. **Infura Account**
   - Sign up at [infura.io](https://infura.io/)
   - Create a new project
   - Copy the Project ID

2. **Etherscan Account**
   - Sign up at [etherscan.io](https://etherscan.io/)
   - Generate API key from account settings

3. **MetaMask Wallet**
   - Install MetaMask extension
   - Create or import wallet
   - Add Sepolia testnet
   - Get Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

---

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd privacy-voting-system

# Install dependencies
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Infura RPC URL
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID

# Wallet private key (without 0x prefix)
PRIVATE_KEY=your-private-key-here

# Etherscan API key
ETHERSCAN_API_KEY=your-etherscan-api-key

# Optional: Enable gas reporting
REPORT_GAS=false
```

### Step 3: Verify Installation

```bash
# Check Hardhat installation
npx hardhat --version

# Compile contracts
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

---

## Local Development

### Start Local Network

Terminal 1:
```bash
npm run node
```

This starts a local Hardhat network with:
- 20 test accounts with 10,000 ETH each
- HTTP and WebSocket JSON-RPC server at `http://127.0.0.1:8545`

### Deploy Locally

Terminal 2:
```bash
npm run deploy:localhost
```

Expected output:
```
Starting deployment process...
==================================================
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH
==================================================

Deploying ProxyVotingFHE contract...
Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Run Simulation

```bash
npm run simulate
```

This runs a comprehensive simulation including:
- Registering 5 voters
- Creating 3 proposals
- Casting votes
- Testing delegation
- Security validations

---

## Testnet Deployment

### Step 1: Prepare Wallet

1. Ensure you have Sepolia ETH (minimum 0.1 ETH recommended)
2. Verify your wallet address:

```bash
# This will be shown during deployment
npm run deploy:sepolia
```

### Step 2: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

The deployment process will:
1. Check account balance
2. Estimate gas costs
3. Deploy the contract
4. Wait for confirmations
5. Display contract address
6. Save deployment info to `deployments/` folder

Expected output:
```
Starting deployment process...
==================================================
Deploying contracts with account: 0xYourAddress
Account balance: 0.5 ETH
==================================================

Deploying ProxyVotingFHE contract...
Estimating gas...
Estimated gas: 2500000
Transaction hash: 0x...
Waiting for confirmations...
==================================================
✅ ProxyVotingFHE deployed successfully!
Contract address: 0xA52413121E6C22502efACF91714889f85BaA9A88
==================================================

Network Information:
  Name: sepolia
  Chain ID: 11155111
  Explorer: https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88
```

### Step 3: Save Contract Address

The contract address is automatically saved to:
- `deployments/sepolia-[timestamp].json`
- Console output

Update your frontend `index.html` with the new contract address.

---

## Contract Verification

### Verify on Etherscan

```bash
npm run verify:sepolia
```

Or manually:

```bash
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

Expected output:
```
Contract verification started...
Successfully submitted source code for contract
Waiting for verification result...
Successfully verified contract ProxyVotingFHE on Etherscan.
https://sepolia.etherscan.io/address/0xYOUR_CONTRACT_ADDRESS#code
```

### Verification Benefits

Once verified, you can:
- Read contract source code on Etherscan
- Interact with contract via Etherscan UI
- View function calls and events
- Build trust with users

---

## Testing Guide

### Run All Tests

```bash
npm test
```

Expected output:
```
  ProxyVotingFHE
    Deployment
      ✓ Should set the correct owner
      ✓ Should register owner as voter
      ✓ Should initialize with zero proposals
    Voter Registration
      ✓ Should allow owner to register new voters
      ✓ Should not allow non-owner to register voters
      ✓ Should not allow registering same voter twice
    Proposal Creation
      ✓ Should allow owner to create proposals
      ✓ Should not allow non-owner to create proposals
    Voting
      ✓ Should allow registered voters to vote
      ✓ Should not allow double voting
    Delegation
      ✓ Should allow voters to delegate
      ✓ Should transfer voting power
      ✓ Should allow revoking delegation

  50 passing (2.5s)
```

### Run with Gas Reporter

```bash
npm run test:gas
```

Output includes gas usage per function:
```
·-----------------------------------------|-------------------------·
|  Solc version: 0.8.19                   ·  Optimizer enabled: true │
··························|···············|·············|················
|  Methods                                                            │
··················|·······|···············|·············|················
|  ProxyVotingFHE                                                     │
··················|·······|···············|·············|················
|  registerVoter  ·   -   ·      50000   ·      60000 │          2  │
|  createProposal ·   -   ·      80000   ·      90000 │          3  │
|  vote           ·   -   ·     120000   ·     130000 │          5  │
|  delegateVote   ·   -   ·      70000   ·      75000 │          2  │
··················|·······|···············|·············|················
```

### Run Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` folder.

---

## Contract Interaction

### Using Interact Script

The `interact.js` script provides multiple actions:

#### Action 1: Register Voters

```bash
ACTION=1 npm run interact:sepolia
```

#### Action 2: Create Proposal

```bash
ACTION=2 npm run interact:sepolia
```

#### Action 3: Cast Vote

```bash
ACTION=3 npm run interact:sepolia
```

#### Action 4: Delegate Vote

```bash
ACTION=4 npm run interact:sepolia
```

#### Action 5: Revoke Delegation

```bash
ACTION=5 npm run interact:sepolia
```

#### Action 6: View Proposal

```bash
ACTION=6 npm run interact:sepolia
```

#### Action 7: View Results (Owner Only)

```bash
ACTION=7 npm run interact:sepolia
```

#### Action 8: Full Demo

```bash
npm run interact:sepolia
# or
ACTION=8 npm run interact:sepolia
```

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

Then interact directly:

```javascript
const contract = await ethers.getContractAt(
  "ProxyVotingFHE",
  "0xYOUR_CONTRACT_ADDRESS"
);

// Check proposal count
const count = await contract.proposalCount();
console.log("Proposals:", count.toString());

// Register voter
const tx = await contract.registerVoter("0xVoterAddress");
await tx.wait();
console.log("Voter registered");
```

---

## Network Configuration

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR-PROJECT-ID`
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://faucet.sepolia.dev

### Local Network

- **Chain ID**: 31337
- **RPC URL**: `http://127.0.0.1:8545`
- **Accounts**: 20 test accounts with 10,000 ETH each

---

## Deployment Checklist

Before deploying to mainnet, ensure:

- [ ] All tests passing
- [ ] Gas optimization completed
- [ ] Security audit performed
- [ ] Contract verified on Etherscan
- [ ] Documentation complete
- [ ] Frontend updated with contract address
- [ ] Environment variables secured
- [ ] Backup of private keys
- [ ] Emergency pause mechanism tested
- [ ] Multi-signature wallet for owner functions

---

## Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution**:
- Check wallet balance: `npm run deploy:sepolia` shows balance
- Get more Sepolia ETH from faucets
- Minimum recommended: 0.1 ETH

### Issue: "Invalid API Key" (Etherscan)

**Solution**:
- Verify `ETHERSCAN_API_KEY` in `.env`
- Generate new API key from Etherscan
- Ensure no extra spaces in `.env` file

### Issue: "Network connection failed"

**Solution**:
- Check Infura project status
- Verify `SEPOLIA_URL` is correct
- Test connection: `curl https://sepolia.infura.io/v3/YOUR-PROJECT-ID`

### Issue: "Compilation failed"

**Solution**:
```bash
# Clean and recompile
npm run clean
npm run compile
```

### Issue: "Transaction timeout"

**Solution**:
- Network congestion - wait and retry
- Increase gas price in `hardhat.config.js`
- Check Sepolia network status

### Issue: "Contract already verified"

**Solution**:
- This is expected if contract was previously verified
- Contract is ready to use

---

## Gas Optimization Tips

1. **Batch Operations**: Register multiple voters in a single transaction
2. **Efficient Storage**: Use packed storage variables
3. **View Functions**: Use view/pure functions for reads (no gas)
4. **Event Monitoring**: Use events instead of storage for historical data

---

## Security Best Practices

1. **Private Keys**: Never commit `.env` file
2. **Access Control**: Verify owner functions are protected
3. **Input Validation**: Test edge cases in all functions
4. **Reentrancy**: Contract uses safe patterns
5. **Upgradeability**: Consider proxy pattern for mainnet

---

## Deployment Costs

Estimated costs on Sepolia (testnet - free):
- **Deploy Contract**: ~0.05 ETH
- **Register Voter**: ~0.002 ETH
- **Create Proposal**: ~0.003 ETH
- **Cast Vote**: ~0.005 ETH

Estimated costs on Mainnet (approximate):
- Multiply above by current gas price
- Monitor gas prices: https://etherscan.io/gastracker

---

## Support and Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org)

### Community
- GitHub Issues: Report bugs and request features
- Ethereum Stack Exchange: Technical questions

### Tools
- [Remix IDE](https://remix.ethereum.org): Browser-based Solidity IDE
- [Tenderly](https://tenderly.co): Transaction monitoring
- [Etherscan](https://etherscan.io): Blockchain explorer

---

## Continuous Integration

### GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
```

---

## Next Steps

After successful deployment:

1. **Update Frontend**: Deploy updated frontend with new contract address
2. **Documentation**: Share contract address and ABI with users
3. **Monitoring**: Set up transaction monitoring
4. **Community**: Announce deployment to community
5. **Maintenance**: Plan for upgrades and improvements

---

## Deployment Summary

**Current Deployment**:
- **Network**: Sepolia Testnet
- **Contract**: ProxyVotingFHE
- **Address**: `0xA52413121E6C22502efACF91714889f85BaA9A88`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88)
- **Status**: Verified ✅

**Features**:
- Privacy-preserving voting with FHE simulation
- Flexible vote delegation
- 7-day voting periods
- Owner-controlled governance
- Fully tested and verified

---

**For questions or issues, please refer to the README.md or create an issue in the repository.**
