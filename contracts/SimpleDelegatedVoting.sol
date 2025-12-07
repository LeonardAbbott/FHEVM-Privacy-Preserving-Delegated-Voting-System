// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleProxyVoting is Ownable {
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool active;
        mapping(address => bool) hasVoted;
    }

    struct Delegation {
        address delegate;
        bool active;
        uint256 weight;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public isRegisteredVoter;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool isYes);
    event DelegationSet(address indexed delegator, address indexed delegate);
    event DelegationRevoked(address indexed delegator);
    event VoterRegistered(address indexed voter);

    constructor() Ownable(msg.sender) {
        votingPower[msg.sender] = 1;
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
        votingPower[voter] = 1;
        emit VoterRegistered(voter);
    }

    function createProposal(string calldata description) external onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
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

        votingPower[delegate] += votingPower[msg.sender];
        votingPower[msg.sender] = 0;

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
        uint256 weight = delegation.weight;

        votingPower[delegate] -= weight;
        votingPower[delegator] = weight;
        
        delegation.active = false;
        delegation.delegate = address(0);
        delegation.weight = 0;
    }

    function vote(uint256 proposalId, bool isYes) 
        external 
        onlyRegisteredVoter 
        validProposal(proposalId) 
    {
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(!delegations[msg.sender].active, "Cannot vote while delegation is active");
        require(votingPower[msg.sender] > 0, "No voting power");

        proposals[proposalId].hasVoted[msg.sender] = true;
        
        uint256 voterPower = votingPower[msg.sender];
        
        if (isYes) {
            proposals[proposalId].yesVotes += voterPower;
        } else {
            proposals[proposalId].noVotes += voterPower;
        }

        emit VoteCast(proposalId, msg.sender, isYes);
    }

    function getProposalResults(uint256 proposalId) 
        external 
        view 
        returns (uint256 yesVotes, uint256 noVotes) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");

        return (proposals[proposalId].yesVotes, proposals[proposalId].noVotes);
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

    function getVotingPower(address voter) external view returns (uint256) {
        return votingPower[voter];
    }
}