// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    // State variables
    address public owner;
    uint256 public campaignCount;
    
    // Structs
    struct Campaign {
        uint256 id;
        string title;
        string description;
        string imageUrl;
        address payable beneficiary;
        uint256 goal;
        uint256 raised;
        bool active;
        uint256 deadline;
        address creator;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    // Mappings and Arrays
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(address => uint256[]) public userDonations;
    mapping(uint256 => mapping(address => uint256)) public donorAmounts;

    // Events
    event CampaignCreated(uint256 indexed campaignId, string title, uint256 goal);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event CampaignCompleted(uint256 indexed campaignId, uint256 totalRaised);
    event RefundIssued(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].active, "Campaign is not active");
        require(block.timestamp <= campaigns[_campaignId].deadline, "Campaign has ended");
        _;
    }

    modifier onlyCreator(uint256 _campaignId) {
        require(msg.sender == campaigns[_campaignId].creator, "Only campaign creator can call this function");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        campaignCount = 0;
    }

    // Functions
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        address payable _beneficiary,
        uint256 _goal,
        uint256 _durationInDays
    ) public returns (uint256) {
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");

        uint256 campaignId = campaignCount;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        campaigns[campaignId] = Campaign({
            id: campaignId,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            beneficiary: _beneficiary,
            goal: _goal,
            raised: 0,
            active: true,
            deadline: deadline,
            creator: msg.sender
        });

        campaignCount++;
        emit CampaignCreated(campaignId, _title, _goal);
        return campaignId;
    }

    function donate(uint256 _campaignId) public payable campaignExists(_campaignId) campaignActive(_campaignId) {
        require(msg.value > 0, "Donation amount must be greater than 0");

        Campaign storage campaign = campaigns[_campaignId];
        campaign.raised += msg.value;
        donorAmounts[_campaignId][msg.sender] += msg.value;

        Donation memory newDonation = Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        });

        campaignDonations[_campaignId].push(newDonation);
        userDonations[msg.sender].push(_campaignId);

        emit DonationMade(_campaignId, msg.sender, msg.value);

        if (campaign.raised >= campaign.goal) {
            campaign.active = false;
            emit CampaignCompleted(_campaignId, campaign.raised);
        }
    }

    function withdrawFunds(uint256 _campaignId) public campaignExists(_campaignId) onlyCreator(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.raised > 0, "No funds to withdraw");
        require(!campaign.active || block.timestamp > campaign.deadline, "Campaign is still active");

        uint256 amount = campaign.raised;
        campaign.raised = 0;
        campaign.active = false;

        (bool success, ) = campaign.beneficiary.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(_campaignId, amount);
    }

    function requestRefund(uint256 _campaignId) public campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign has not ended yet");
        require(campaign.active, "Campaign is not active");
        require(campaign.raised < campaign.goal, "Campaign goal was reached");
        
        uint256 amount = donorAmounts[_campaignId][msg.sender];
        require(amount > 0, "No donations to refund");

        donorAmounts[_campaignId][msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(_campaignId, msg.sender, amount);
    }

    function getCampaign(uint256 _campaignId) public view campaignExists(_campaignId) returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory imageUrl,
        address beneficiary,
        uint256 goal,
        uint256 raised,
        bool active,
        uint256 deadline,
        address creator
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.title,
            campaign.description,
            campaign.imageUrl,
            campaign.beneficiary,
            campaign.goal,
            campaign.raised,
            campaign.active,
            campaign.deadline,
            campaign.creator
        );
    }

    function getCampaignDonations(uint256 _campaignId) public view campaignExists(_campaignId) returns (Donation[] memory) {
        return campaignDonations[_campaignId];
    }

    function getUserDonations(address _user) public view returns (uint256[] memory) {
        return userDonations[_user];
    }

    function checkCampaignExists(uint256 _campaignId) public view returns (bool) {
        return _campaignId < campaignCount;
    }

    function getTotalCampaigns() public view returns (uint256) {
        return campaignCount;
    }

    function getDonorAmount(uint256 _campaignId, address _donor) public view returns (uint256) {
        return donorAmounts[_campaignId][_donor];
    }
} 