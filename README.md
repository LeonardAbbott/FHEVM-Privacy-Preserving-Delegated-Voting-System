# Delegated Voting System - Privacy Proxy Voting

## 🗳️ Overview

A decentralized voting system built on Ethereum that enables privacy-preserving delegated voting through advanced cryptographic techniques. This system allows users to either vote directly on proposals or delegate their voting power to trusted representatives while maintaining complete privacy of vote choices.

## 🔐 Core Concepts

### Delegated Voting System
- **Direct Voting**: Users can vote directly on active proposals with their voting power
- **Delegation**: Users can delegate their voting power to trusted representatives
- **Flexible Authority**: Delegations can be revoked at any time, returning voting power to the original holder
- **Privacy Protection**: All votes are encrypted using FHE (Fully Homomorphic Encryption) technology

### Privacy Proxy Voting
- **Encrypted Votes**: All voting choices are encrypted and stored on-chain
- **Anonymous Tallying**: Vote counts are computed on encrypted data without revealing individual choices
- **Authorized Decryption**: Only contract owners with proper decryption keys can reveal final results
- **Complete Anonymity**: Individual voting preferences remain private throughout the entire process

## 🚀 Features

- **🔐 FHE Encryption**: Advanced privacy protection using Fully Homomorphic Encryption
- **👥 Flexible Delegation**: Delegate voting power to trusted representatives
- **📊 Transparent Governance**: View proposals and participate in democratic decision-making  
- **🛡️ Privacy-First**: Vote choices remain encrypted and private
- **⚡ Real-time Updates**: Instant feedback on transactions and voting status
- **🌐 Web3 Integration**: Seamless MetaMask integration for Ethereum interactions

## 📋 Smart Contract

**Network**: Ethereum Sepolia Testnet  
**Contract Address**: `0xA52413121E6C22502efACF91714889f85BaA9A88`

### Key Functions
- `vote()` - Cast encrypted votes on proposals
- `delegateVote()` - Delegate voting power to representatives  
- `revokeDelegation()` - Reclaim delegated voting power
- `createProposal()` - Create new voting proposals (owner only)
- `getProposalResults()` - Decrypt and view results (owner only)

## 🎥 Demo

### Live Application
🌐 **Website**: [https://delegated-voting.vercel.app/](https://delegated-voting.vercel.app/)

### Video Demonstration
📹 **Demo Video**: Available in the repository showing complete voting workflow including:
- Wallet connection and FHE key generation
- Voter registration process
- Creating blockchain proposals
- Direct voting with encryption
- Delegation to representatives
- Result decryption by authorized parties

### On-Chain Transactions
📸 **Transaction Screenshots**: View real blockchain interactions including:
- Voter registration transactions
- Proposal creation on Sepolia testnet
- Encrypted vote submissions
- Delegation transactions with gas fees
- Smart contract interactions via MetaMask

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Blockchain**: Solidity, Ethereum, Sepolia Testnet
- **Encryption**: FHE (Fully Homomorphic Encryption) simulation
- **Web3**: ethers.js, MetaMask integration
- **Deployment**: Vercel hosting platform

## 🔧 Usage

### Getting Started
1. Visit the live application at [delegated-voting.vercel.app](https://delegated-voting.vercel.app/)
2. Connect your MetaMask wallet (ensure you're on Sepolia testnet)
3. Register as a voter through the interface
4. Generate FHE encryption keys automatically

### Voting Process
1. **Direct Voting**: Select proposals and cast encrypted votes
2. **Delegation**: Choose trusted representatives to vote on your behalf
3. **Management**: Monitor delegation status and revoke when needed
4. **Privacy**: All vote choices remain encrypted until authorized decryption

### Key Features in Action
- **Voter Registration**: Register yourself and delegate candidates
- **Proposal Creation**: Create new proposals for community voting
- **Encrypted Voting**: Cast votes with automatic FHE encryption
- **Result Decryption**: View decrypted results (contract owner only)
- **Delegation Management**: Delegate, monitor, and revoke voting power

## 🔍 Privacy & Security

- **Zero-Knowledge**: Individual votes remain private during the entire process
- **Homomorphic Encryption**: Enables computation on encrypted vote data
- **Decentralized Trust**: No central authority can access individual vote choices
- **Transparent Process**: All transactions verifiable on Ethereum blockchain
- **Flexible Permissions**: Users maintain full control over their voting power

## 📊 Contract Verification

View the smart contract on Etherscan:
- **Sepolia Testnet**: [https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88](https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88)

## 🤝 Contributing

We welcome contributions to improve the delegated voting system! Please feel free to:
- Submit bug reports and feature requests
- Contribute code improvements
- Enhance documentation
- Test the system and provide feedback

## 📞 Links

- **GitHub Repository**: [https://github.com/LeonardAbbott/DelegatedVoting](https://github.com/LeonardAbbott/DelegatedVoting)
- **Live Demo**: [https://delegated-voting.vercel.app/](https://delegated-voting.vercel.app/)
- **Smart Contract**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xA52413121E6C22502efACF91714889f85BaA9A88)

## 📜 License

This project is licensed under the MIT License - see the repository for details.

---

**Built with ❤️ for decentralized democracy and privacy-preserving governance**