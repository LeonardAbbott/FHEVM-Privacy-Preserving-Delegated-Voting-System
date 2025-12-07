// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// TFHE library for FHE operations
// Option 1: Local installation
// import "fhevm/lib/TFHE.sol";

// Option 2: Direct npm import
// import "@fhenixprotocol/contracts/FHE.sol";

// Option 3: Hardhat/Local setup
import "./TFHE.sol";

// Option 4: For Remix IDE
// import "https://github.com/zama-ai/fhevm/contracts/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProxyVotingSystem is Ownable {
    // FHE type usage - uncomment based on your TFHE library
    // using TFHE for euint32;
    // using TFHE for ebool;
    
    // Alternative: Use standard types for testing
    // Replace with FHE types when library is properly installed

    struct Proposal {
        string description;
        euint32 yesVotes;
        euint32 noVotes;
        uint256 deadline;
        bool active;
        mapping(address => bool) hasVoted;
        mapping(address => bool) hasDelegated;
    }

    struct Delegation {
        address delegate;
        bool active;
        euint32 weight;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => Delegation) public delegations;
    mapping(address => euint32) public votingPower;
    mapping(address => bool) public isRegisteredVoter;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool isYes);
    event DelegationSet(address indexed delegator, address indexed delegate);
    event DelegationRevoked(address indexed delegator);
    event VoterRegistered(address indexed voter);

    constructor() Ownable(msg.sender) {
        votingPower[msg.sender] = TFHE.asEuint32(1);
        isRegisteredVoter[msg.sender] = true;
    }

    modifier onlyRegisteredVoter() {
        require(isRegisteredVoter[msg.sender], "Not a registered voter");
        _;
    }

    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(proposals[proposalId].active, "Proposal not active");
        require(block.timestamp <= proposals[proposalId].deadline, "Voting period ended");
        _;
    }

    function registerVoter(address voter) external onlyOwner {
        require(!isRegisteredVoter[voter], "Voter already registered");
        isRegisteredVoter[voter] = true;
        votingPower[voter] = TFHE.asEuint32(1);
        emit VoterRegistered(voter);
    }

    function createProposal(string calldata description) external onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        proposal.yesVotes = TFHE.asEuint32(0);
        proposal.noVotes = TFHE.asEuint32(0);
        proposal.deadline = block.timestamp + VOTING_PERIOD;
        proposal.active = true;

        emit ProposalCreated(proposalId, description, proposal.deadline);
        return proposalId;
    }

    function delegateVote(address delegate) external onlyRegisteredVoter {
        require(delegate != msg.sender, "Cannot delegate to yourself");
        require(isRegisteredVoter[delegate], "Delegate must be registered voter");
        
        if (delegations[msg.sender].active) {
            _revokeDelegation(msg.sender);
        }

        delegations[msg.sender] = Delegation({
            delegate: delegate,
            active: true,
            weight: votingPower[msg.sender]
        });

        votingPower[delegate] = votingPower[delegate].add(votingPower[msg.sender]);
        votingPower[msg.sender] = TFHE.asEuint32(0);

        emit DelegationSet(msg.sender, delegate);
    }

    function revokeDelegation() external onlyRegisteredVoter {
        require(delegations[msg.sender].active, "No active delegation");
        _revokeDelegation(msg.sender);
        emit DelegationRevoked(msg.sender);
    }

    function _revokeDelegation(address delegator) internal {
        Delegation storage delegation = delegations[delegator];
        address delegate = delegation.delegate;
        euint32 weight = delegation.weight;

        votingPower[delegate] = votingPower[delegate].sub(weight);
        votingPower[delegator] = weight;
        
        delegation.active = false;
        delegation.delegate = address(0);
        delegation.weight = TFHE.asEuint32(0);
    }

    function vote(uint256 proposalId, bool isYes, bytes calldata inputProof) 
        external 
        onlyRegisteredVoter 
        validProposal(proposalId) 
    {
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(!delegations[msg.sender].active, "Cannot vote while delegation is active");

        proposals[proposalId].hasVoted[msg.sender] = true;
        
        euint32 encryptedVote = TFHE.asEuint32(isYes ? 1 : 0, inputProof);
        euint32 voterPower = votingPower[msg.sender];
        
        ebool isYesVote = encryptedVote.eq(TFHE.asEuint32(1));
        euint32 yesVoteWeight = TFHE.select(isYesVote, voterPower, TFHE.asEuint32(0));
        euint32 noVoteWeight = TFHE.select(isYesVote, TFHE.asEuint32(0), voterPower);

        proposals[proposalId].yesVotes = proposals[proposalId].yesVotes.add(yesVoteWeight);
        proposals[proposalId].noVotes = proposals[proposalId].noVotes.add(noVoteWeight);

        emit VoteCast(proposalId, msg.sender, isYes);
    }

    function getProposalResults(uint256 proposalId, bytes32 publicKey, bytes calldata signature) 
        external 
        view 
        onlyOwner 
        returns (uint32 yesVotes, uint32 noVotes) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");

        yesVotes = TFHE.decrypt(proposals[proposalId].yesVotes, publicKey, signature);
        noVotes = TFHE.decrypt(proposals[proposalId].noVotes, publicKey, signature);
    }

    function closeProposal(uint256 proposalId) external onlyOwner {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");
        proposals[proposalId].active = false;
    }

    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (
            string memory description, 
            uint256 deadline, 
            bool active
        ) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        return (proposal.description, proposal.deadline, proposal.active);
    }

    function getDelegation(address voter) 
        external 
        view 
        returns (address delegate, bool active) 
    {
        Delegation storage delegation = delegations[voter];
        return (delegation.delegate, delegation.active);
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}