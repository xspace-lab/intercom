// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TracGameFiLootNFT
 * @notice ERC721-like NFTs for game loot on Trac Network
 * @dev Optimized for zero gas fees
 */
contract TracGameFiLootNFT {
    
    // Rarity tiers
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    // Loot item
    struct LootItem {
        uint256 tokenId;
        string name;
        Rarity rarity;
        string gameWorld;
        uint256 mintedAt;
        uint256 battleId;
        uint256 priceUSD;
        address owner;
    }
    
    // State
    uint256 public totalSupply;
    mapping(uint256 => LootItem) public lootItems;
    mapping(address => uint256[]) public playerLoot;
    mapping(Rarity => uint256) public rarityMinted;
    
    address public gameContract;
    
    // Events
    event LootMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        Rarity rarity,
        uint256 timestamp
    );
    
    event LootTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    modifier onlyGame() {
        require(msg.sender == gameContract, "Only game contract");
        _;
    }
    
    constructor(address _gameContract) {
        gameContract = _gameContract;
    }
    
    /**
     * @notice Mint new loot NFT
     */
    function mintLoot(
        address _owner,
        string calldata _name,
        Rarity _rarity,
        string calldata _gameWorld,
        uint256 _battleId,
        uint256 _priceUSD
    ) external onlyGame returns (uint256) {
        uint256 tokenId = totalSupply++;
        
        lootItems[tokenId] = LootItem({
            tokenId: tokenId,
            name: _name,
            rarity: _rarity,
            gameWorld: _gameWorld,
            mintedAt: block.timestamp,
            battleId: _battleId,
            priceUSD: _priceUSD,
            owner: _owner
        });
        
        playerLoot[_owner].push(tokenId);
        rarityMinted[_rarity]++;
        
        emit LootMinted(
            tokenId,
            _owner,
            _name,
            _rarity,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @notice Transfer loot to another player
     */
    function transfer(address _to, uint256 _tokenId) external {
        require(_tokenId < totalSupply, "Token does not exist");
        require(lootItems[_tokenId].owner == msg.sender, "Not owner");
        require(_to != address(0), "Invalid recipient");
        
        address from = msg.sender;
        
        // Update ownership
        lootItems[_tokenId].owner = _to;
        
        // Update player loot arrays
        _removeFromPlayerLoot(from, _tokenId);
        playerLoot[_to].push(_tokenId);
        
        emit LootTransferred(_tokenId, from, _to, block.timestamp);
    }
    
    /**
     * @notice Get player's loot
     */
    function getPlayerLoot(address _player) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return playerLoot[_player];
    }
    
    /**
     * @notice Get loot details
     */
    function getLootDetails(uint256 _tokenId) 
        external 
        view 
        returns (LootItem memory) 
    {
        require(_tokenId < totalSupply, "Token does not exist");
        return lootItems[_tokenId];
    }
    
    /**
     * @notice Get rarity distribution
     */
    function getRarityStats() 
        external 
        view 
        returns (
            uint256 common,
            uint256 rare,
            uint256 epic,
            uint256 legendary
        ) 
    {
        common = rarityMinted[Rarity.COMMON];
        rare = rarityMinted[Rarity.RARE];
        epic = rarityMinted[Rarity.EPIC];
        legendary = rarityMinted[Rarity.LEGENDARY];
    }
    
    /**
     * @notice Check if token is legendary
     */
    function isLegendary(uint256 _tokenId) 
        external 
        view 
        returns (bool) 
    {
        require(_tokenId < totalSupply, "Token does not exist");
        return lootItems[_tokenId].rarity == Rarity.LEGENDARY;
    }
    
    /**
     * @notice Get owner of token
     */
    function ownerOf(uint256 _tokenId) 
        external 
        view 
        returns (address) 
    {
        require(_tokenId < totalSupply, "Token does not exist");
        return lootItems[_tokenId].owner;
    }
    
    /**
     * @dev Remove token from player's loot array
     */
    function _removeFromPlayerLoot(address player, uint256 tokenId) private {
        uint256[] storage loot = playerLoot[player];
        for (uint256 i = 0; i < loot.length; i++) {
            if (loot[i] == tokenId) {
                loot[i] = loot[loot.length - 1];
                loot.pop();
                break;
            }
        }
    }
    
    /**
     * @notice Update game contract address
     */
    function setGameContract(address _gameContract) external {
        require(msg.sender == gameContract || gameContract == address(0), "Unauthorized");
        gameContract = _gameContract;
    }
}
