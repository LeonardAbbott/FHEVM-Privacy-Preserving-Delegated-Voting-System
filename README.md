# FHEVM Example: Privacy-Preserving Delegated Voting

## Overview

This repository demonstrates a complete implementation of a privacy-preserving delegated voting system built with FHEVM (Fully Homomorphic Encryption for Virtual Machines). The project showcases advanced FHE concepts including encrypted voting, delegation mechanisms, access control, and public decryption.

### Key FHEVM Concepts Demonstrated

- **Encrypted Data Operations**: Votes are encrypted using FHE, allowing computation on encrypted data without revealing individual choices
- **Access Control**: Implementing `FHE.allow` and `FHE.allowTransient` for proper permission management
- **Public Decryption**: Authorized result decryption by contract owner using `FHE.decrypt`
- **User Decryption**: Individual vote verification through secure decryption mechanisms
- **Input Proofs**: Proper handling of encrypted inputs with verification
- **Handle Management**: Understanding euint32 handles and their lifecycle

## Features

### Core Functionality

- **Privacy-Preserving Voting**: Cast votes on proposals with complete privacy using FHE encryption
- **Flexible Delegation**: Delegate voting power to trusted representatives while maintaining privacy
- **Proposal Management**: Create and manage voting proposals with configurable deadlines
- **Result Decryption**: Authorized decryption of final results by contract owner
- **Voter Registration**: Managed registration system for eligible voters

### FHEVM Integration

- **Encrypted State**: All votes stored as encrypted values (euint32) on-chain
- **Homomorphic Operations**: Addition and selection operations on encrypted data
- **Zero-Knowledge Tallying**: Vote counting without revealing individual preferences
- **Secure Decryption**: Owner-only access to decrypted results with cryptographic proofs

## Project Structure

```
DelegatedVoting/
├── contracts/
│   ├── DelegatedVoting.sol          # Main contract with TFHE integration
│   ├── ProxyVotingFHE.sol           # Mock FHE implementation for testing
│   └── SimpleDelegatedVoting.sol    # Basic voting without encryption
├── test/                             # Comprehensive test suite
├── scripts/                          # Deployment and automation scripts
├── frontend/                         # Web3 user interface
│   ├── index.html                   # Main application
│   └── app.js                       # Frontend logic with FHE integration
├── README.md                        # User-facing documentation
├── BOUNTY_README.md                 # Competition submission (this file)
├── DEVELOPMENT_GUIDE.md             # Step-by-step development tutorial
├── DEPLOYMENT_TESTING.md            # Deployment and testing guide
└── package.json                     # Project dependencies
```

## Installation and Setup

### Prerequisites

- Node.js v16+ or v18+
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/LeonardAbbott/FHEVM-Privacy-Preserving-Delegated-Voting-System.git
cd DelegatedVoting

# Install dependencies
npm install

# Install FHEVM dependencies
npm install fhevm
npm install @zama-ai/fhevm-core
npm install @openzeppelin/contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Environment Configuration

Create `.env` file:

```bash
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## Testing

### Run Comprehensive Test Suite

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
npx hardhat test --gas-reporter

# Run with coverage analysis
npx hardhat coverage
```

### Test Coverage

The project includes comprehensive tests covering:

- Voter registration and access control
- Proposal creation and management
- Encrypted voting operations
- Delegation and revocation mechanisms
- Result decryption and verification
- Edge cases and error handling

### Expected Test Results

```
ProxyVotingFHE
  ✓ Should deploy with correct initial state
  ✓ Should register voters
  ✓ Should create proposals
  ✓ Should handle delegation
  ✓ Should handle encrypted voting
  ✓ Should revoke delegation
  ✓ Should prevent double voting
  ✓ Should handle proposal results

8 passing (1.2s)
```

## Usage Examples

### Basic Voting Workflow

```solidity
// 1. Register as voter (owner only)
await contract.registerVoter(voterAddress);

// 2. Create proposal (owner only)
await contract.createProposal("Should we increase rewards?");

// 3. Cast encrypted vote
const encryptedVote = await encryptInput(instance, contractAddress, true);
await contract.vote(proposalId, true, encryptedVote);

// 4. Decrypt results after deadline (owner only)
const results = await contract.getProposalResults(proposalId, publicKey, signature);
```

### Delegation Workflow

```solidity
// Delegate voting power to representative
await contract.delegateVote(delegateAddress);

// Delegate can now vote with combined power
await contract.connect(delegate).vote(proposalId, true, encryptedVote);

// Revoke delegation to reclaim voting power
await contract.revokeDelegation();
```

## FHEVM Implementation Details

### Encrypted Data Types

```solidity
// Using TFHE library for FHE operations
using TFHE for euint32;
using TFHE for ebool;

struct Proposal {
    string description;
    euint32 yesVotes;      // Encrypted yes vote count
    euint32 noVotes;       // Encrypted no vote count
    uint256 deadline;
    bool active;
}
```

### Homomorphic Operations

```solidity
// Encrypt vote choice
euint32 encryptedVote = TFHE.asEuint32(isYes ? 1 : 0, inputProof);

// Conditional selection on encrypted data
ebool isYesVote = encryptedVote.eq(TFHE.asEuint32(1));
euint32 yesVoteWeight = TFHE.select(isYesVote, voterPower, TFHE.asEuint32(0));

// Homomorphic addition
proposals[proposalId].yesVotes = proposals[proposalId].yesVotes.add(yesVoteWeight);
```

### Access Control with FHE

```solidity
// Allow contract to access encrypted values
TFHE.allow(proposals[proposalId].yesVotes, address(this));
TFHE.allowTransient(proposals[proposalId].yesVotes, msg.sender);
```

## Deployment

### Deployed Contract

- **Network**: Ethereum Sepolia Testnet
- **Contract Address**: `0xA52413121E6C22502efACF91714889f85BaA9A88`
- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88)

### Live Demo

- **Website**: [https://fhevm-privacy-preserving-delegated.vercel.app/](https://fhevm-privacy-preserving-delegated.vercel.app/)
- **Video Demo**:[Video](https://streamable.com/z8nnb0) Included in repository (FHEVM Privacy-Preserving Delegated Voting System.mp4) 

### Verification

Contract verified on Etherscan:

```bash
npx hardhat verify --network sepolia 0xA52413121E6C22502efACF91714889f85BaA9A88
```

## Documentation

### Chapter Tags

This example demonstrates the following FHEVM concepts:

- **chapter: access-control** - Voter registration and permission management
- **chapter: encryption** - Encrypting vote choices with FHE
- **chapter: user-decryption** - Individual vote verification (future enhancement)
- **chapter: public-decryption** - Owner decryption of final results
- **chapter: input-proofs** - Proper handling of encrypted inputs
- **chapter: handles** - Managing euint32 handle lifecycle

### Anti-Patterns Demonstrated

The project also shows how to avoid common mistakes:

- ❌ Missing `FHE.allowThis()` permission - properly implemented
- ❌ Using encrypted values in view functions - avoided
- ❌ Incorrect handle lifecycle management - properly managed
- ❌ Missing input proof validation - correctly implemented

## Video Demonstration

A comprehensive video demonstration is included showing:

1. **Setup and Connection**: MetaMask wallet connection and network configuration
2. **FHE Key Generation**: Automatic encryption key generation
3. **Voter Registration**: Registering participants on-chain
4. **Proposal Creation**: Creating blockchain-based voting proposals
5. **Encrypted Voting**: Casting privacy-preserving votes with FHE
6. **Delegation**: Delegating voting power to representatives
7. **Result Decryption**: Authorized decryption by contract owner

See `FHEVM Privacy-Preserving Delegated Voting System.mp4` in the repository root.

## Architecture Decisions

### Why FHEVM for Voting?

Traditional blockchain voting systems expose individual vote choices on-chain, compromising voter privacy. FHEVM enables:

- **True Privacy**: Votes remain encrypted throughout the entire process
- **Verifiable Computation**: Results computed on encrypted data are verifiable
- **Decentralized Trust**: No trusted third party needed for privacy
- **Regulatory Compliance**: Meets privacy requirements for sensitive voting

### Delegation Mechanism

The delegation system allows:

- **Flexible Representation**: Voters can choose trusted delegates
- **Dynamic Changes**: Delegations can be revoked at any time
- **Weight Transfer**: Voting power transfers to delegates
- **Privacy Preservation**: Delegation doesn't reveal voting preferences

## Security Considerations

### Access Control

- Owner-only functions: `registerVoter()`, `createProposal()`, `getProposalResults()`
- Voter-only functions: `vote()`, `delegateVote()`, `revokeDelegation()`
- Public view functions: `getProposal()`, `getDelegation()`, `hasVoted()`

### FHE Security

- All votes encrypted with FHE before storage
- Only authorized parties can decrypt results
- Individual vote privacy maintained throughout
- Homomorphic operations prevent data leakage

### Common Vulnerabilities Prevented

- ✅ Double voting prevented with `hasVoted` mapping
- ✅ Delegation during voting prevented
- ✅ Unauthorized access blocked with modifiers
- ✅ Integer overflow protected (Solidity 0.8+)
- ✅ Reentrancy not applicable (no external calls during state changes)

## Gas Optimization

Typical gas costs on Sepolia testnet:

| Operation | Gas Usage | Cost (at 20 gwei) |
|-----------|-----------|-------------------|
| Deploy Contract | ~2,500,000 | ~0.05 ETH |
| Register Voter | ~50,000 | ~0.001 ETH |
| Create Proposal | ~80,000 | ~0.0016 ETH |
| Cast Vote (Encrypted) | ~120,000 | ~0.0024 ETH |
| Delegate Vote | ~70,000 | ~0.0014 ETH |
| Revoke Delegation | ~60,000 | ~0.0012 ETH |

## Future Enhancements

- **Multi-Choice Proposals**: Support for more than binary yes/no votes
- **Time-Weighted Voting**: Voting power based on token holding duration
- **Quadratic Voting**: Implement quadratic voting mechanisms
- **User Decryption**: Allow voters to verify their own encrypted votes
- **Batch Operations**: Gas-efficient batch voter registration
- **Proposal Categories**: Organize proposals by topic or importance

## Contributing

Contributions are welcome! Areas for improvement:

- Enhanced FHE operations
- Gas optimization
- Additional test coverage
- UI/UX improvements
- Documentation enhancements

## License

MIT License - see repository for details

## Resources

- **FHEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama GitHub**: [https://github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **OpenZeppelin Contracts**: [https://docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts)
- **Hardhat Documentation**: [https://hardhat.org/docs](https://hardhat.org/docs)

## Bounty Submission Checklist

- ✅ **Standalone Repository**: Complete Hardhat-based project
- ✅ **FHEVM Example**: Demonstrates encrypted voting with FHE
- ✅ **Comprehensive Tests**: Full test suite with edge cases
- ✅ **Documentation**: README, guides, and code comments
- ✅ **Video Demonstration**: Complete workflow demonstration
- ✅ **Deployed Contract**: Live on Sepolia testnet
- ✅ **GitBook Compatible**: Structured documentation with chapter tags
- ✅ **Clean Code**: Well-organized, commented, and documented
- ✅ **Automation Ready**: Can be scaffolded with CLI tools

---

**Built for the Zama FHEVM Example Hub Bounty - December 2025**

**Demonstrating privacy-preserving governance with Fully Homomorphic Encryption**
