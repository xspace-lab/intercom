// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TracGameFiBattleHistory
 * @notice Battle history contract optimized for Trac Network
 * @dev Zero gas fees on Trac Network mainnet
 */
contract TracGameFiBattleHistory {
    
    // Battle outcome types
    enum Outcome { WIN, LOSS, DRAW }
    
    // Battle record
    struct Battle {
        uint256 battleId;
        address player;
        address opponent;
        uint256 timestamp;
        Outcome outcome;
        uint256 tokensEarned;  // In wei (18 decimals)
        uint256 xpGained;
        string gameWorld;
        uint256 roundsPlayed;
        bool lootDropped;
        uint256 lootTokenId;
    }
    
    // State
    uint256 public totalBattles;
    uint256 public totalTokensDistributed;
    
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256[]) public playerBattles;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    mapping(address => uint256) public playerEarnings;
    
    // Owner for admin functions
    address public owner;
    
    // Events
    event BattleRecorded(
        uint256 indexed battleId,
        address indexed player,
        Outcome outcome,
        uint256 tokensEarned,
        uint256 xpGained,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Record a battle result
     * @dev Optimized for Trac Network's zero gas fees
     */
    function recordBattle(
        address _player,
        address _opponent,
        Outcome _outcome,
        uint256 _tokensEarned,
        uint256 _xpGained,
        string calldata _gameWorld,
        uint256 _roundsPlayed,
        bool _lootDropped,
        uint256 _lootTokenId
    ) external returns (uint256) {
        require(_player != address(0), "Invalid player");
        
        uint256 battleId = totalBattles++;
        
        battles[battleId] = Battle({
            battleId: battleId,
            player: _player,
            opponent: _opponent,
            timestamp: block.timestamp,
            outcome: _outcome,
            tokensEarned: _tokensEarned,
            xpGained: _xpGained,
            gameWorld: _gameWorld,
            roundsPlayed: _roundsPlayed,
            lootDropped: _lootDropped,
            lootTokenId: _lootTokenId
        });
        
        playerBattles[_player].push(battleId);
        
        if (_outcome == Outcome.WIN) {
            playerWins[_player]++;
            playerEarnings[_player] += _tokensEarned;
            totalTokensDistributed += _tokensEarned;
        } else if (_outcome == Outcome.LOSS) {
            playerLosses[_player]++;
        }
        
        emit BattleRecorded(
            battleId,
            _player,
            _outcome,
            _tokensEarned,
            _xpGained,
            block.timestamp
        );
        
        return battleId;
    }
    
    /**
     * @notice Get player battle history
     */
    function getPlayerBattles(address _player) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return playerBattles[_player];
    }
    
    /**
     * @notice Get battle details
     */
    function getBattleDetails(uint256 _battleId) 
        external 
        view 
        returns (Battle memory) 
    {
        require(_battleId < totalBattles, "Battle does not exist");
        return battles[_battleId];
    }
    
    /**
     * @notice Get player statistics
     */
    function getPlayerStats(address _player) 
        external 
        view 
        returns (
            uint256 wins,
            uint256 losses,
            uint256 earnings,
            uint256 battleCount,
            uint256 winRate
        ) 
    {
        wins = playerWins[_player];
        losses = playerLosses[_player];
        earnings = playerEarnings[_player];
        battleCount = playerBattles[_player].length;
        
        if (battleCount > 0) {
            winRate = (wins * 10000) / battleCount; // Basis points
        }
    }
    
    /**
     * @notice Get recent battles (last N)
     */
    function getRecentBattles(uint256 count) 
        external 
        view 
        returns (Battle[] memory) 
    {
        uint256 start = totalBattles > count ? totalBattles - count : 0;
        uint256 length = totalBattles - start;
        
        Battle[] memory recent = new Battle[](length);
        
        for (uint256 i = 0; i < length; i++) {
            recent[i] = battles[start + i];
        }
        
        return recent;
    }
    
    /**
     * @notice Get leaderboard (top N players by wins)
     */
    function getLeaderboard(address[] calldata _players) 
        external 
        view 
        returns (
            address[] memory players,
            uint256[] memory wins,
            uint256[] memory earnings
        ) 
    {
        players = _players;
        wins = new uint256[](_players.length);
        earnings = new uint256[](_players.length);
        
        for (uint256 i = 0; i < _players.length; i++) {
            wins[i] = playerWins[_players[i]];
            earnings[i] = playerEarnings[_players[i]];
        }
    }
    
    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
