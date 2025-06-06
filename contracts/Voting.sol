// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Voting {
    struct News {
        string title;
        string source;
        uint8 realVotes;
        uint8 fakeVotes;
        uint256 timestamp;
    }

    News public currentNews;
    mapping(uint256 => News) public newsHistory; // timestamp => News
    uint256[] public newsTimestamps;
    
    address owner;
    mapping(uint256 => mapping(address => bool)) public voters;
    uint256 public votingStart;
    uint256 public votingEnd;
    bool public isVotingActive;

    event VotingEnded(uint256 timestamp, uint256 realVotes, uint256 fakeVotes);
    event NewNewsSet(string title, uint256 timestamp);

    constructor() {
        owner = msg.sender;
        isVotingActive = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyWhenVotingActive() {
        require(isVotingActive, "Voting is not active");
        require(block.timestamp <= votingEnd, "Voting period has ended");
        _;
    }

    function setNewNews(string memory _title, string memory _source, uint256 _durationInMinutes) public onlyOwner {
        require(!isVotingActive || block.timestamp >= votingEnd, "Current voting is still active");
        
        // Archive current news if it exists and voting has occurred
        if (currentNews.timestamp != 0) {
            newsHistory[votingStart] = currentNews;
            newsTimestamps.push(votingStart);
        }
        
        // Set new news
        currentNews = News({
            title: _title,
            source: _source,
            realVotes: 0,
            fakeVotes: 0,
            timestamp: block.timestamp
        });
        
        // Reset voting period
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        isVotingActive = true;
        
        emit NewNewsSet(_title, block.timestamp);
    }

    function vote(bool _isReal) public onlyWhenVotingActive {
        require(!voters[votingStart][msg.sender], "You have already voted");
        voters[votingStart][msg.sender] = true;

        if (_isReal) {
            currentNews.realVotes++;
        } else {
            currentNews.fakeVotes++;
        }
    }

    function getCurrentNews() public view returns (
        string memory title,
        string memory source,
        uint256 realVotes,
        uint256 fakeVotes,
        uint256 timestamp
    ) {
        return (
            currentNews.title,
            currentNews.source,
            currentNews.realVotes,
            currentNews.fakeVotes,
            currentNews.timestamp
        );
    }

    function getNewsHistory(uint256 _timestamp) public view returns (
        string memory title,
        string memory source,
        uint256 realVotes,
        uint256 fakeVotes
    ) {
        News memory news = newsHistory[_timestamp];
        return (
            news.title,
            news.source,
            news.realVotes,
            news.fakeVotes
        );
    }

    function endVoting() public onlyOwner {
        require(block.timestamp >= votingEnd, "Voting period not yet ended");
        require(isVotingActive, "Voting is not active");
        
        isVotingActive = false;
        emit VotingEnded(block.timestamp, currentNews.realVotes, currentNews.fakeVotes);
    }

    function getAllNewsTimestamps() public view returns (uint256[] memory) {
        return newsTimestamps;
    }

    function getVotingStatus() public view returns (bool) {
        return isVotingActive && (block.timestamp >= votingStart && block.timestamp <= votingEnd);
    }
    
    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}