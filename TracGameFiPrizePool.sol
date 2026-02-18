// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TracGameFiPrizePool
 * @notice Tournament prize pool with instant payouts (zero gas!)
 * @dev Optimized for Trac Network's free transactions
 */
contract TracGameFiPrizePool {
    
    // Tournament status
    enum Status { UPCOMING, ACTIVE, ENDED, FINALIZED }
    
    // Tournament
    struct Tournament {
        uint256 id;
        string name;
        uint256 prizePool;
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        Status status;
        uint256 participantCount;
        mapping(address => uint256) playerRanks;
        mapping(uint256 => uint256) rewardDistribution;
    }
    
    // Prize claim
    struct Prize {
        uint256 amount;
        uint256 tournamentId;
        bool claimed;
    }
    
    // State
    uint256 public tournamentCount;
    mapping(uint256 => Tournament) public tournaments;
    mapping(address => uint256[]) public playerTournaments;
    mapping(address => mapping(uint256 => Prize)) public prizes;
    
    address public owner;
    uint256 public platformFee = 300; // 3% in basis points
    
    // Events
    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        uint256 prizePool,
        uint256 timestamp
    );
    
    event PlayerJoined(
        uint256 indexed tournamentId,
        address indexed player,
        uint256 timestamp
    );
    
    event TournamentEnded(
        uint256 indexed tournamentId,
        uint256 finalPrizePool,
        uint256 timestamp
    );
    
    event PrizeAwarded(
        uint256 indexed tournamentId,
        address indexed player,
        uint256 amount,
        uint256 rank,
        uint256 timestamp
    );
    
    event PrizeClaimed(
        address indexed player,
        uint256 tournamentId,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Create new tournament
     */
    function createTournament(
        string calldata _name,
        uint256 _entryFee,
        uint256 _startTime,
        uint256 _endTime,
        uint256[] calldata _rewardPercentages
    ) external onlyOwner returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be future");
        require(_endTime > _startTime, "End must be after start");
        require(_rewardPercentages.length > 0, "Must have rewards");
        
        // Validate percentages sum to 10000 (100%)
        uint256 total;
        for (uint256 i = 0; i < _rewardPercentages.length; i++) {
            total += _rewardPercentages[i];
        }
        require(total == 10000, "Percentages must sum to 100%");
        
        uint256 tournamentId = tournamentCount++;
        Tournament storage t = tournaments[tournamentId];
        
        t.id = tournamentId;
        t.name = _name;
        t.prizePool = 0;
        t.entryFee = _entryFee;
        t.startTime = _startTime;
        t.endTime = _endTime;
        t.status = Status.UPCOMING;
        t.participantCount = 0;
        
        // Set reward distribution
        for (uint256 i = 0; i < _rewardPercentages.length; i++) {
            t.rewardDistribution[i + 1] = _rewardPercentages[i];
        }
        
        emit TournamentCreated(tournamentId, _name, 0, block.timestamp);
        
        return tournamentId;
    }
    
    /**
     * @notice Join tournament
     */
    function joinTournament(uint256 _tournamentId) external payable {
        Tournament storage t = tournaments[_tournamentId];
        
        require(
            t.status == Status.UPCOMING || t.status == Status.ACTIVE,
            "Tournament not open"
        );
        require(block.timestamp < t.endTime, "Tournament ended");
        require(t.playerRanks[msg.sender] == 0, "Already joined");
        require(msg.value == t.entryFee, "Incorrect entry fee");
        
        t.prizePool += msg.value;
        t.participantCount++;
        playerTournaments[msg.sender].push(_tournamentId);
        
        // Mark as joined (rank 0 means not ranked yet)
        t.playerRanks[msg.sender] = 0;
        
        // Activate if past start time
        if (block.timestamp >= t.startTime && t.status == Status.UPCOMING) {
            t.status = Status.ACTIVE;
        }
        
        emit PlayerJoined(_tournamentId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice End tournament and distribute prizes
     */
    function endTournament(
        uint256 _tournamentId,
        address[] calldata _rankedPlayers
    ) external onlyOwner {
        Tournament storage t = tournaments[_tournamentId];
        
        require(t.status == Status.ACTIVE, "Not active");
        require(block.timestamp >= t.endTime, "Not ended yet");
        require(_rankedPlayers.length <= t.participantCount, "Too many players");
        
        t.status = Status.ENDED;
        
        // Calculate platform fee
        uint256 fee = (t.prizePool * platformFee) / 10000;
        uint256 netPrizePool = t.prizePool - fee;
        
        // Award prizes
        for (uint256 i = 0; i < _rankedPlayers.length; i++) {
            address player = _rankedPlayers[i];
            uint256 rank = i + 1;
            uint256 rewardPct = t.rewardDistribution[rank];
            
            if (rewardPct > 0) {
                uint256 prizeAmount = (netPrizePool * rewardPct) / 10000;
                
                prizes[player][_tournamentId] = Prize({
                    amount: prizeAmount,
                    tournamentId: _tournamentId,
                    claimed: false
                });
                
                t.playerRanks[player] = rank;
                
                emit PrizeAwarded(
                    _tournamentId,
                    player,
                    prizeAmount,
                    rank,
                    block.timestamp
                );
            }
        }
        
        t.status = Status.FINALIZED;
        
        // Transfer platform fee
        if (fee > 0) {
            payable(owner).transfer(fee);
        }
        
        emit TournamentEnded(_tournamentId, t.prizePool, block.timestamp);
    }
    
    /**
     * @notice Claim tournament prize
     */
    function claimPrize(uint256 _tournamentId) external {
        Prize storage prize = prizes[msg.sender][_tournamentId];
        
        require(prize.amount > 0, "No prize");
        require(!prize.claimed, "Already claimed");
        
        prize.claimed = true;
        
        payable(msg.sender).transfer(prize.amount);
        
        emit PrizeClaimed(
            msg.sender,
            _tournamentId,
            prize.amount,
            block.timestamp
        );
    }
    
    /**
     * @notice Get tournament info
     */
    function getTournamentInfo(uint256 _tournamentId) 
        external 
        view 
        returns (
            string memory name,
            uint256 prizePool,
            uint256 entryFee,
            uint256 startTime,
            uint256 endTime,
            Status status,
            uint256 participantCount
        ) 
    {
        Tournament storage t = tournaments[_tournamentId];
        return (
            t.name,
            t.prizePool,
            t.entryFee,
            t.startTime,
            t.endTime,
            t.status,
            t.participantCount
        );
    }
    
    /**
     * @notice Get player rank
     */
    function getPlayerRank(uint256 _tournamentId, address _player) 
        external 
        view 
        returns (uint256) 
    {
        return tournaments[_tournamentId].playerRanks[_player];
    }
    
    /**
     * @notice Get prize info
     */
    function getPrizeInfo(address _player, uint256 _tournamentId) 
        external 
        view 
        returns (
            uint256 amount,
            bool claimed
        ) 
    {
        Prize storage prize = prizes[_player][_tournamentId];
        return (prize.amount, prize.claimed);
    }
    
    /**
     * @notice Set platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high (max 10%)");
        platformFee = _fee;
    }
    
    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
