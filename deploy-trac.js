// scripts/deploy-trac.js
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔷 Deploying GameFi Hub contracts to Trac Network...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "wei\n");

  const network = hre.network.name;
  console.log("Network:", network, "\n");

  // ═══════════════════════════════════════════
  //  1. Deploy Battle History Contract
  // ═══════════════════════════════════════════
  console.log("📜 Deploying TracGameFiBattleHistory...");
  const BattleHistory = await hre.ethers.getContractFactory("TracGameFiBattleHistory");
  const battleHistory = await BattleHistory.deploy();
  await battleHistory.deployed();
  console.log("✅ BattleHistory deployed to:", battleHistory.address);
  console.log("   Gas used: FREE on Trac Network! ⚡\n");

  // ═══════════════════════════════════════════
  //  2. Deploy Loot NFT Contract
  // ═══════════════════════════════════════════
  console.log("📜 Deploying TracGameFiLootNFT...");
  const LootNFT = await hre.ethers.getContractFactory("TracGameFiLootNFT");
  const lootNFT = await LootNFT.deploy(battleHistory.address);
  await lootNFT.deployed();
  console.log("✅ LootNFT deployed to:", lootNFT.address);
  console.log("   Game contract set to:", battleHistory.address);
  console.log("   Gas used: FREE on Trac Network! ⚡\n");

  // ═══════════════════════════════════════════
  //  3. Deploy Prize Pool Contract
  // ═══════════════════════════════════════════
  console.log("📜 Deploying TracGameFiPrizePool...");
  const PrizePool = await hre.ethers.getContractFactory("TracGameFiPrizePool");
  const prizePool = await PrizePool.deploy();
  await prizePool.deployed();
  console.log("✅ PrizePool deployed to:", prizePool.address);
  console.log("   Gas used: FREE on Trac Network! ⚡\n");

  // ═══════════════════════════════════════════
  //  4. Test Transactions (Optional)
  // ═══════════════════════════════════════════
  if (network === "trac-testnet") {
    console.log("🧪 Running test transactions on testnet...\n");
    
    // Test battle recording
    console.log("Testing recordBattle...");
    const testBattle = await battleHistory.recordBattle(
      deployer.address,
      "0x0000000000000000000000000000000000000000",
      0, // WIN
      hre.ethers.utils.parseEther("2.5"),
      140,
      "axie",
      8,
      false,
      0
    );
    await testBattle.wait();
    console.log("✅ Test battle recorded! TX:", testBattle.hash);
    
    // Test NFT minting
    console.log("Testing mintLoot...");
    const testMint = await lootNFT.mintLoot(
      deployer.address,
      "Test Sword",
      3, // LEGENDARY
      "axie",
      0,
      24000
    );
    await testMint.wait();
    console.log("✅ Test NFT minted! TX:", testMint.hash);
    console.log();
  }

  // ═══════════════════════════════════════════
  //  5. Save Deployment Info
  // ═══════════════════════════════════════════
  const deployment = {
    network: network,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      battleHistory: battleHistory.address,
      lootNFT: lootNFT.address,
      prizePool: prizePool.address
    },
    config: {
      gasCost: "FREE",
      intercomSwapIntegrated: true,
      tracWalletSupported: true
    }
  };

  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const filename = `trac-${network}-${Date.now()}.json`;
  const filepath = path.join(deploymentDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));

  // Also save to web3 directory for easy access
  const web3ConfigPath = path.join(__dirname, '../web3/contract-addresses.json');
  const web3Config = {
    [network]: {
      battleHistory: battleHistory.address,
      lootNFT: lootNFT.address,
      prizePool: prizePool.address,
      lastUpdated: new Date().toISOString()
    }
  };
  
  // Merge with existing config if present
  if (fs.existsSync(web3ConfigPath)) {
    const existing = JSON.parse(fs.readFileSync(web3ConfigPath, 'utf8'));
    Object.assign(existing, web3Config);
    fs.writeFileSync(web3ConfigPath, JSON.stringify(existing, null, 2));
  } else {
    fs.writeFileSync(web3ConfigPath, JSON.stringify(web3Config, null, 2));
  }

  console.log("═══════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════\n");
  console.log("📝 Contract Addresses:");
  console.log("   BattleHistory:   ", battleHistory.address);
  console.log("   LootNFT:         ", lootNFT.address);
  console.log("   PrizePool:       ", prizePool.address);
  console.log("\n💾 Deployment saved to:");
  console.log("   ", filename);
  console.log("   web3/contract-addresses.json");
  console.log("\n🔗 Trac Network Explorer:");
  
  const explorerUrls = {
    'trac-mainnet': 'https://explorer.trac.network',
    'trac-testnet': 'https://testnet-explorer.trac.network'
  };
  
  const explorerUrl = explorerUrls[network] || explorerUrls['trac-testnet'];
  console.log("   BattleHistory: ", `${explorerUrl}/address/${battleHistory.address}`);
  console.log("   LootNFT:       ", `${explorerUrl}/address/${lootNFT.address}`);
  console.log("   PrizePool:     ", `${explorerUrl}/address/${prizePool.address}`);
  
  console.log("\n🔗 Next steps:");
  console.log("   1. Contracts are deployed and ready!");
  console.log("   2. Update your frontend if needed (addresses auto-saved)");
  console.log("   3. Test with Trac wallet: open blockchain-arena.html");
  console.log("   4. Zero gas fees = no funding needed! 🎉");
  console.log("\n💡 IntercomSwap Integration:");
  console.log("   - API: https://api.intercomswap.trac.network/v1");
  console.log("   - Docs: https://github.com/Trac-Systems/intercomswap-agent");
  console.log("\n⚡ All transactions on Trac Network are FREE!");
  console.log("   - Record battles: FREE");
  console.log("   - Mint NFTs: FREE");
  console.log("   - Claim prizes: FREE");
  console.log("   - Swap assets: FREE\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
