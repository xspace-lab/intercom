/**
 * AI Trading Arena - WebSocket Server
 * Real AI agents connect and compete in live trading tournaments
 * 
 * Run: node server.js
 * Then AI agents can connect to ws://localhost:3000
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server for serving frontend
const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index-live.html';
  
  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/html';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game state
const agents = new Map(); // Connected AI agents
const tournaments = new Map();
let currentTournament = null;
let marketTick = 0;

// Market data generator
const PAIRS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'MATIC/USDC'];

function generateMarketData() {
  const data = {
    type: 'MARKET_UPDATE',
    timestamp: Date.now(),
    tick: marketTick++,
    pairs: {}
  };
  
  PAIRS.forEach(pair => {
    const basePrice = {
      'BTC/USDC': 42000,
      'ETH/USDC': 2500,
      'SOL/USDC': 95,
      'MATIC/USDC': 0.85
    }[pair];
    
    const volatility = Math.random() * 0.05; // 0-5% movement
    const direction = Math.random() > 0.5 ? 1 : -1;
    const price = basePrice * (1 + (volatility * direction));
    const change24h = (Math.random() * 6) - 3; // -3% to +3%
    
    data.pairs[pair] = {
      price: parseFloat(price.toFixed(2)),
      change_24h: parseFloat(change24h.toFixed(2)),
      volume_24h: Math.floor(Math.random() * 2000000) + 500000,
      trend: change24h > 0 ? 'bullish' : 'bearish',
      volatility: Math.abs(change24h) > 2 ? 'high' : Math.abs(change24h) > 1 ? 'medium' : 'low'
    };
  });
  
  data.market_sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
  data.fear_greed_index = Math.floor(Math.random() * 100);
  
  return data;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 New connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('❌ Message parse error:', error);
      ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
    }
  });
  
  ws.on('close', () => {
    // Find and remove disconnected agent
    for (const [id, agent] of agents.entries()) {
      if (agent.ws === ws) {
        console.log(`👋 Agent disconnected: ${agent.name}`);
        agents.delete(id);
        broadcast({ type: 'AGENT_DISCONNECTED', agentId: id });
        break;
      }
    }
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Welcome to AI Trading Arena!',
    timestamp: Date.now()
  }));
});

// Message handler
function handleMessage(ws, data) {
  console.log('📨 Received:', data.type);
  
  switch (data.type) {
    case 'REGISTER_AGENT':
      registerAgent(ws, data);
      break;
      
    case 'TRADE_DECISION':
      handleTradeDecision(ws, data);
      break;
      
    case 'GET_MARKET_DATA':
      ws.send(JSON.stringify(generateMarketData()));
      break;
      
    case 'GET_LEADERBOARD':
      sendLeaderboard(ws);
      break;
      
    case 'START_TOURNAMENT':
      startTournament(data);
      break;
      
    default:
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type' }));
  }
}

// Register AI agent
function registerAgent(ws, data) {
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const agent = {
    id: agentId,
    ws: ws,
    name: data.name || 'Anonymous Agent',
    strategy: data.strategy || 'balanced',
    portfolio: 10000,
    pnl: 0,
    trades: [],
    wins: 0,
    losses: 0,
    totalVolume: 0,
    connected: true
  };
  
  agents.set(agentId, agent);
  
  console.log(`✅ Agent registered: ${agent.name} (${agent.strategy})`);
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: 'REGISTERED',
    agentId: agentId,
    portfolio: agent.portfolio,
    message: `Welcome ${agent.name}! You're ready to trade.`
  }));
  
  // Broadcast to all
  broadcast({
    type: 'NEW_AGENT',
    agent: {
      id: agentId,
      name: agent.name,
      strategy: agent.strategy,
      portfolio: agent.portfolio
    }
  });
  
  // Start sending market updates
  sendMarketUpdates(ws);
}

// Handle trade decision from AI agent
function handleTradeDecision(ws, data) {
  // Find agent
  let agent = null;
  for (const [id, a] of agents.entries()) {
    if (a.ws === ws) {
      agent = a;
      agent.id = id;
      break;
    }
  }
  
  if (!agent) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Agent not registered' }));
    return;
  }
  
  // Validate decision
  if (!data.action || !['BUY', 'SELL', 'HOLD'].includes(data.action)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid action' }));
    return;
  }
  
  if (data.action === 'HOLD') {
    ws.send(JSON.stringify({ type: 'TRADE_ACKNOWLEDGED', action: 'HOLD' }));
    return;
  }
  
  // Execute trade
  const trade = executeTrade(agent, data);
  
  // Update agent
  agent.trades.push(trade);
  agent.portfolio += trade.profit;
  agent.pnl += trade.profit;
  agent.totalVolume += trade.amount;
  
  if (trade.profit > 0) {
    agent.wins++;
  } else {
    agent.losses++;
  }
  
  // Send result to agent
  ws.send(JSON.stringify({
    type: 'TRADE_EXECUTED',
    trade: trade,
    portfolio: agent.portfolio,
    pnl: agent.pnl
  }));
  
  // Broadcast to all viewers
  broadcast({
    type: 'TRADE_BROADCAST',
    agent: {
      id: agent.id,
      name: agent.name
    },
    trade: trade
  });
  
  console.log(`💰 Trade: ${agent.name} ${data.action} ${data.pair} - P/L: $${trade.profit.toFixed(2)}`);
}

// Execute trade with IntercomSwap simulation
function executeTrade(agent, decision) {
  const amount = decision.amount || 1000;
  
  // Simulate market execution
  let profit;
  if (agent.strategy === 'aggressive') {
    profit = (Math.random() * 400) - 150; // -$150 to +$250
  } else if (agent.strategy === 'balanced') {
    profit = (Math.random() * 200) - 80; // -$80 to +$120
  } else {
    profit = (Math.random() * 100) - 30; // -$30 to +$70
  }
  
  // IntercomSwap fee (1.5%)
  const fee = amount * 0.015;
  profit -= fee;
  
  return {
    timestamp: Date.now(),
    pair: decision.pair,
    action: decision.action,
    amount: amount,
    profit: profit,
    fee: fee,
    reasoning: decision.reasoning || 'No reasoning provided'
  };
}

// Send market updates to connected agent
function sendMarketUpdates(ws) {
  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      clearInterval(interval);
      return;
    }
    
    const marketData = generateMarketData();
    ws.send(JSON.stringify(marketData));
  }, 3000); // Every 3 seconds
}

// Send leaderboard
function sendLeaderboard(ws) {
  const leaderboard = Array.from(agents.values())
    .map(a => ({
      id: a.id,
      name: a.name,
      strategy: a.strategy,
      portfolio: a.portfolio,
      pnl: a.pnl,
      trades: a.trades.length,
      wins: a.wins,
      losses: a.losses,
      winRate: a.trades.length > 0 ? (a.wins / a.trades.length) * 100 : 0
    }))
    .sort((a, b) => b.pnl - a.pnl);
  
  ws.send(JSON.stringify({
    type: 'LEADERBOARD',
    leaderboard: leaderboard
  }));
}

// Broadcast to all connected clients
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Start tournament
function startTournament(data) {
  console.log('🏁 Starting tournament...');
  
  currentTournament = {
    id: Date.now(),
    startTime: Date.now(),
    maxTrades: data.maxTrades || 20,
    duration: data.duration || 60000, // 1 minute
    status: 'active'
  };
  
  broadcast({
    type: 'TOURNAMENT_START',
    tournament: currentTournament
  });
  
  // End tournament after duration
  setTimeout(() => {
    endTournament();
  }, currentTournament.duration);
}

// End tournament
function endTournament() {
  if (!currentTournament) return;
  
  currentTournament.status = 'ended';
  currentTournament.endTime = Date.now();
  
  const results = Array.from(agents.values())
    .map(a => ({
      name: a.name,
      pnl: a.pnl,
      portfolio: a.portfolio,
      trades: a.trades.length,
      winRate: a.trades.length > 0 ? (a.wins / a.trades.length) * 100 : 0
    }))
    .sort((a, b) => b.pnl - a.pnl);
  
  broadcast({
    type: 'TOURNAMENT_END',
    tournament: currentTournament,
    results: results,
    winner: results[0]
  });
  
  console.log('🏆 Tournament ended! Winner:', results[0]?.name);
}

// Periodic market data broadcast
setInterval(() => {
  const marketData = generateMarketData();
  broadcast(marketData);
}, 5000);

// Periodic leaderboard update
setInterval(() => {
  broadcast({
    type: 'LEADERBOARD_UPDATE',
    agents: Array.from(agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      pnl: a.pnl,
      portfolio: a.portfolio,
      trades: a.trades.length
    }))
  });
}, 2000);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 AI Trading Arena Server Running!');
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('\n💡 AI agents can now connect and trade!');
});

module.exports = { server, wss };
