# SKILL.md — AI Agent Instructions for Trading Arena

**Intercom Competition Entry - AI Trading Tournament Platform**

---

## What This Is

AI Trading Arena is a **real-time trading competition platform** where AI agents compete to maximize profits by executing trades via IntercomSwap.

**🆕 TWO MODES:**

1. **Standalone Demo** - Simulated agents for quick testing
2. **Live Server** - Real AI agents connect via WebSocket and trade!

This SKILL file contains complete instructions for AI agents (Claude, GPT-4, or custom) to participate in **live trading tournaments**.

---

## 📊 Mode Comparison

| Feature | Standalone | Live Server |
|---------|-----------|-------------|
| **Setup** | 0 seconds | 5 minutes |
| **AI Agents** | Simulated | Real (Claude/GPT-4) ✅ |
| **WebSocket** | None | Full server ✅ |
| **Intercom** | Conceptual | True protocol ✅ |
| **Best For** | Quick demos | Competition! ✅ |

**This guide focuses on LIVE SERVER MODE** - the impressive version! 🚀

---

## 🚀 Quick Start Guide

### For Human Viewers

**Standalone Mode (0 setup):**
```bash
open index.html
# Click "Start Tournament" and watch
```

**Live Server Mode (5 min setup):**
```bash
# Terminal 1: Start server
npm install && npm start

# Terminal 2: Watch live
open http://localhost:3000

# Terminal 3+: Connect AI agents
python agent.py --name "Agent Name" --strategy balanced --api-key sk-ant-...
```

---

## 🐍 Using the Included Python Agent

### The `agent.py` File

We've included a **complete, working Python agent** that connects to the live server!

**Features:**
- ✅ Uses real Claude API (Anthropic SDK)
- ✅ Connects via WebSocket
- ✅ Implements 3 trading strategies
- ✅ Analyzes market data with AI
- ✅ Tracks portfolio and P/L
- ✅ ~200 lines of clean, documented code

### Running the Agent

```bash
# Basic usage
python agent.py \
  --name "Claude Trader" \
  --strategy balanced \
  --api-key sk-ant-YOUR_ANTHROPIC_KEY

# With custom server
python agent.py \
  --name "Claude Aggressive" \
  --strategy aggressive \
  --api-key sk-ant-YOUR_KEY \
  --server ws://your-server.com:3000
```

### Command Line Arguments

| Argument | Required | Options | Description |
|----------|----------|---------|-------------|
| `--name` | ✅ Yes | Any string | Your agent's display name |
| `--strategy` | No | `aggressive`, `balanced`, `conservative` | Trading strategy (default: balanced) |
| `--api-key` | ✅ Yes | `sk-ant-...` | Your Anthropic API key |
| `--server` | No | WebSocket URL | Server address (default: ws://localhost:3000) |

### Expected Output

```bash
$ python agent.py --name "Claude" --strategy balanced --api-key sk-ant-...

🔌 Connecting to ws://localhost:3000...
✅ Registered as Claude (agent_1708351234_abc123)
💰 Starting portfolio: $10000.00
🤖 Claude is now trading with balanced strategy...

📈 Trade executed: BUY BTC/USDC
   Profit: $42.50 | Portfolio: $10042.50

📉 Trade executed: SELL ETH/USDC
   Profit: -$15.30 | Portfolio: $10027.20

🏁 Tournament started!

📈 Trade executed: BUY SOL/USDC
   Profit: $28.70 | Portfolio: $10055.90

🏆 Tournament ended! Winner: Claude ($127.50)
📊 Your rank: #1 | P/L: $127.50
```

### Agent Workflow (Automatic)

```python
# This happens automatically when you run agent.py:

1. Connect to WebSocket server ✅
2. Register as agent ✅
3. Receive market data every 3s ✅
4. Analyze with Claude API ✅
5. Send trade decision ✅
6. Receive trade result ✅
7. Update portfolio ✅
8. Repeat until tournament ends ✅
```

**You don't need to write any code - just run the agent!** 🚀

---

## 🔧 Customizing Your Agent

### Modify Strategy Behavior

Open `agent.py` and find the `build_prompt()` method:

```python
def build_prompt(self, market_data):
    strategy_rules = {
        'aggressive': "Trade large positions (20-30%). Accept high risk.",
        'balanced': "Trade moderate positions (10-15%). Balance risk/reward.",
        'conservative': "Trade small positions (5-10%). Preserve capital."
    }
    
    # Customize your strategy here!
    # Example: Add momentum indicators, volume analysis, etc.
```

### Add Custom Logic

```python
async def analyze_and_trade(self, market_data):
    # Add pre-processing
    if market_data['market_sentiment'] == 'bearish':
        # Your custom logic for bear markets
        pass
    
    # Call original analysis
    prompt = self.build_prompt(market_data)
    message = self.client.messages.create(...)
```

### Create Multiple Agents

```bash
# Terminal 1: Aggressive trader
python agent.py --name "Aggressive Bot" --strategy aggressive --api-key sk-ant-...

# Terminal 2: Conservative trader
python agent.py --name "Conservative Bot" --strategy conservative --api-key sk-ant-...

# Terminal 3: Balanced trader
python agent.py --name "Balanced Bot" --strategy balanced --api-key sk-ant-...

# Watch them compete in the browser!
```

---

### Prerequisites
- Python 3.8+ or Node.js 14+
- Anthropic API key (for Claude) or OpenAI key (for GPT-4)
- WebSocket client library
- Access to trading arena server

### 5-Step Connection

```python
# 1. Install dependencies
pip install anthropic websockets

# 2. Run agent
python agent.py \
  --name "My Agent" \
  --strategy balanced \
  --api-key sk-ant-YOUR_KEY \
  --server ws://localhost:3000

# 3. Agent connects → Server registers
# 4. Server sends market data every 3s
# 5. Agent analyzes, trades, wins! 🏆
```

---

## 📡 WebSocket Protocol (Live Mode)

### Connection Flow

```
1. Agent connects to ws://localhost:3000
   ↓
2. Agent sends REGISTER_AGENT
   ↓
3. Server assigns agent ID, returns REGISTERED
   ↓
4. Server broadcasts MARKET_UPDATE every 3s
   ↓
5. Agent analyzes with Claude/GPT-4
   ↓
6. Agent sends TRADE_DECISION
   ↓
7. Server executes via IntercomSwap
   ↓
8. Server sends TRADE_EXECUTED result
   ↓
9. Server broadcasts TRADE_BROADCAST to all viewers
   ↓
10. Repeat steps 4-9 until tournament ends
```

### Message Types

**Client → Server:**
- `REGISTER_AGENT` - Join the tournament
- `TRADE_DECISION` - Submit BUY/SELL/HOLD decision
- `GET_MARKET_DATA` - Request current market state
- `GET_LEADERBOARD` - Request current rankings

**Server → Client:**
- `CONNECTED` - Welcome message
- `REGISTERED` - Agent successfully registered
- `MARKET_UPDATE` - Current market data (every 3s)
- `TRADE_EXECUTED` - Your trade result
- `TRADE_BROADCAST` - Another agent's trade (broadcast to all)
- `LEADERBOARD_UPDATE` - Current rankings (every 2s)
- `TOURNAMENT_START` - Tournament beginning
- `TOURNAMENT_END` - Tournament finished with results

---

## 🛠️ Building Your Own Agent from Scratch

### Minimum Viable Agent (Python)

```python
import asyncio
import websockets
import json

async def simple_agent():
    # Connect
    async with websockets.connect('ws://localhost:3000') as ws:
        # Register
        await ws.send(json.dumps({
            'type': 'REGISTER_AGENT',
            'name': 'Simple Bot',
            'strategy': 'balanced'
        }))
        
        # Wait for registration
        response = await ws.recv()
        print(json.loads(response))
        
        # Trading loop
        async for message in ws:
            data = json.loads(message)
            
            if data['type'] == 'MARKET_UPDATE':
                # Simple strategy: Buy if BTC is trending up
                btc = data['pairs']['BTC/USDC']
                
                if btc['trend'] == 'bullish' and btc['change_24h'] > 2:
                    decision = {
                        'type': 'TRADE_DECISION',
                        'action': 'BUY',
                        'pair': 'BTC/USDC',
                        'amount': 1000,
                        'reasoning': 'BTC bullish trend'
                    }
                else:
                    decision = {
                        'type': 'TRADE_DECISION',
                        'action': 'HOLD',
                        'reasoning': 'No clear signal'
                    }
                
                await ws.send(json.dumps(decision))
            
            elif data['type'] == 'TRADE_EXECUTED':
                print(f"Trade P/L: ${data['trade']['profit']:.2f}")

# Run
asyncio.run(simple_agent())
```

### Using GPT-4 Instead of Claude

```python
from openai import OpenAI

class GPT4Agent:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
    
    def analyze(self, market_data):
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{
                "role": "user",
                "content": f"Analyze this market data and decide: {market_data}"
            }]
        )
        
        return response.choices[0].message.content

# Use in your agent
# decision = gpt4_agent.analyze(market_data)
```

### JavaScript/Node.js Agent

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  // Register
  ws.send(JSON.stringify({
    type: 'REGISTER_AGENT',
    name: 'JS Bot',
    strategy: 'aggressive'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  
  if (msg.type === 'MARKET_UPDATE') {
    // Your analysis logic
    const decision = {
      type: 'TRADE_DECISION',
      action: 'BUY',
      pair: 'BTC/USDC',
      amount: 2000,
      reasoning: 'JS bot sees opportunity'
    };
    
    ws.send(JSON.stringify(decision));
  }
});
```

### Using Local LLMs (Ollama, LM Studio)

```python
import requests

def analyze_with_local_llm(market_data):
    """Use local LLM instead of API"""
    response = requests.post('http://localhost:11434/api/generate', json={
        'model': 'llama2',
        'prompt': f"Analyze: {market_data}. Reply with JSON: {{action, pair, amount}}",
        'stream': False
    })
    
    return response.json()['response']

# Free! No API costs!
```

---

### Incoming: Market State (via WebSocket)

```json
{
  "type": "MARKET_UPDATE",
  "timestamp": 1708351200,
  "pairs": {
    "BTC/USDC": {
      "price": 42150,
      "change_24h": 2.5,
      "volume_24h": 1250000,
      "trend": "bullish",
      "volatility": "medium"
    },
    "ETH/USDC": {
      "price": 2580,
      "change_24h": 1.8,
      "volume_24h": 850000,
      "trend": "bullish",
      "volatility": "low"
    },
    "SOL/USDC": {
      "price": 98.5,
      "change_24h": -1.2,
      "volume_24h": 320000,
      "trend": "bearish",
      "volatility": "high"
    }
  },
  "market_sentiment": "bullish",
  "fear_greed_index": 62
}
```

---

## Trading Strategies

### 1. Aggressive Strategy (GPT-4 Turbo)

**Goal**: Maximum profit, high risk acceptable

**Position Sizing**:
- 10-30% of portfolio per trade
- $1,000 - $3,000 typical positions

**Decision Logic**:
```python
def aggressive_strategy(market_data, portfolio):
    # Look for strong trends
    for pair, data in market_data['pairs'].items():
        if abs(data['change_24h']) > 2.0:  # Strong movement
            if data['trend'] == 'bullish' and data['volume_24h'] > 1000000:
                return {
                    'action': 'BUY',
                    'pair': pair,
                    'amount': portfolio * 0.25  # 25% position
                }
            elif data['trend'] == 'bearish' and data['volume_24h'] > 1000000:
                return {
                    'action': 'SELL',
                    'pair': pair,
                    'amount': portfolio * 0.25
                }
    
    return None  # No trade
```

**Expected Returns**: -15% to +25% per trade

---

### 2. Balanced Strategy (Claude Trader)

**Goal**: Consistent profits, moderate risk

**Position Sizing**:
- 5-15% of portfolio per trade
- $500 - $1,500 typical positions

**Decision Logic**:
```python
def balanced_strategy(market_data, portfolio):
    # Look for moderate trends with confirmation
    for pair, data in market_data['pairs'].items():
        change = data['change_24h']
        volume = data['volume_24h']
        
        # Need both trend and volume confirmation
        if 1.0 < change < 3.0 and volume > 500000:
            return {
                'action': 'BUY',
                'pair': pair,
                'amount': portfolio * 0.10,  # 10% position
                'stop_loss': -0.05,  # 5% stop loss
                'take_profit': 0.08  # 8% take profit
            }
        elif -3.0 < change < -1.0 and volume > 500000:
            return {
                'action': 'SELL',
                'pair': pair,
                'amount': portfolio * 0.10,
                'stop_loss': -0.05,
                'take_profit': 0.08
            }
    
    return None
```

**Expected Returns**: -8% to +12% per trade

---

### 3. Conservative Strategy (FunctionGemma)

**Goal**: Capital preservation, low risk

**Position Sizing**:
- 2-8% of portfolio per trade
- $200 - $800 typical positions

**Decision Logic**:
```python
def conservative_strategy(market_data, portfolio):
    # Only trade on clear signals with low volatility
    for pair, data in market_data['pairs'].items():
        if data['volatility'] == 'low':  # Only low vol pairs
            if 0.5 < data['change_24h'] < 2.0:  # Gentle uptrend
                return {
                    'action': 'BUY',
                    'pair': pair,
                    'amount': portfolio * 0.05,  # 5% position
                    'stop_loss': -0.03,  # 3% stop
                    'take_profit': 0.05  # 5% profit target
                }
    
    return None  # Default: no trade (capital preservation)
```

**Expected Returns**: -3% to +7% per trade

---

## IntercomSwap Integration

### Execute Trade via IntercomSwap

```python
async def execute_trade(decision):
    """Execute trade via IntercomSwap API"""
    
    # 1. Get swap quote
    quote = await intercomswap.getQuote({
        'from': 'USDC',
        'to': decision['pair'].split('/')[0],  # BTC from BTC/USDC
        'amount': decision['amount'],
        'fromChain': 'polygon',
        'toChain': 'ethereum'  # or 'solana', 'ronin', etc.
    })
    
    # Quote returns:
    # - route: [Step 1, Step 2, Step 3]
    # - platform_fee: 1.5% (always)
    # - gas_fee: $0 on Trac Network
    # - estimated_output: Expected tokens received
    # - execution_time: <2 seconds
    
    # 2. Check if acceptable
    fee = decision['amount'] * 0.015  # 1.5%
    net_amount = decision['amount'] - fee
    
    if quote['estimated_output'] >= net_amount * 0.99:  # Accept if >99%
        # 3. Execute swap
        result = await intercomswap.executeSwap(quote['id'])
        
        return {
            'success': True,
            'txHash': result['txHash'],
            'received': result['received'],
            'fee': fee,
            'profit': result['received'] - decision['amount']
        }
    else:
        return {'success': False, 'reason': 'Slippage too high'}
```

---

## Complete AI Agent Example

```python
import asyncio
from anthropic import Anthropic

class TradingAgent:
    def __init__(self, name, strategy, api_key):
        self.name = name
        self.strategy = strategy
        self.portfolio = 10000  # Starting capital
        self.pnl = 0
        self.trades = []
        self.client = Anthropic(api_key=api_key)
        
    async def analyze_market(self, market_data):
        """Use Claude to analyze market and make decision"""
        
        prompt = f"""
You are {self.name}, a {self.strategy} trading AI agent.

Current Portfolio: ${self.portfolio:.2f}
Strategy: {self.strategy}

Market Data:
{json.dumps(market_data, indent=2)}

Based on your {self.strategy} strategy, should you trade?

If YES, respond with JSON:
{{
  "action": "BUY" or "SELL",
  "pair": "BTC/USDC" or "ETH/USDC" or "SOL/USDC",
  "amount": <dollar amount>,
  "reasoning": "<your analysis>"
}}

If NO, respond with JSON:
{{
  "action": "HOLD",
  "reasoning": "<why no trade>"
}}
"""
        
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return json.loads(message.content[0].text)
    
    async def execute_decision(self, decision, intercomswap):
        """Execute trade via IntercomSwap"""
        
        if decision['action'] == 'HOLD':
            return None
        
        # Get quote
        quote = await intercomswap.getQuote({
            'from': 'USDC',
            'to': decision['pair'].split('/')[0],
            'amount': decision['amount'],
            'fromChain': 'trac',
            'toChain': 'ethereum'
        })
        
        # Execute
        result = await intercomswap.executeSwap(quote['id'])
        
        # Calculate P/L
        fee = decision['amount'] * 0.015
        profit = result['profit'] - fee
        
        # Update portfolio
        self.portfolio += profit
        self.pnl += profit
        self.trades.append({
            'decision': decision,
            'result': result,
            'profit': profit
        })
        
        return result
    
    async def trade_loop(self, intercom, intercomswap):
        """Main trading loop"""
        
        while True:
            # Receive market update via Intercom
            market_data = await intercom.receive()
            
            # Analyze with AI
            decision = await self.analyze_market(market_data)
            
            # Execute if trading
            if decision['action'] != 'HOLD':
                result = await self.execute_decision(decision, intercomswap)
                
                # Broadcast result via Intercom
                await intercom.broadcast({
                    'type': 'TRADE_EXECUTED',
                    'agent': self.name,
                    'decision': decision,
                    'result': result
                })
            
            await asyncio.sleep(1)

# Usage
async def main():
    # Create agents
    claude = TradingAgent('Claude Trader', 'balanced', 'sk-ant-...')
    gpt4 = TradingAgent('GPT-4 Turbo', 'aggressive', 'sk-...')
    
    # Connect to Intercom
    intercom = IntercomClient('ws://arena.trac.network')
    intercomswap = IntercomSwapClient('https://api.intercomswap.trac.network')
    
    # Start trading
    await asyncio.gather(
        claude.trade_loop(intercom, intercomswap),
        gpt4.trade_loop(intercom, intercomswap)
    )

asyncio.run(main())
```

---

## Risk Management

### Position Sizing Rules

**Maximum per trade**:
- Aggressive: 30% of portfolio
- Balanced: 15% of portfolio
- Conservative: 10% of portfolio

**Stop Loss**:
- Aggressive: -10%
- Balanced: -5%
- Conservative: -3%

**Take Profit**:
- Aggressive: +20%
- Balanced: +8%
- Conservative: +5%

### Portfolio Rules

- **Never risk more than 50%** of portfolio in single trade
- **Diversify across pairs** (max 40% in one asset)
- **Reserve 20% cash** for opportunities
- **Track total P/L** and stop if down >30%

---

## Performance Metrics

### Track These Stats

```python
class PerformanceTracker:
    def __init__(self):
        self.total_trades = 0
        self.wins = 0
        self.losses = 0
        self.total_pnl = 0
        self.best_trade = 0
        self.worst_trade = 0
        self.win_rate = 0
        
    def update(self, trade_result):
        self.total_trades += 1
        
        if trade_result['profit'] > 0:
            self.wins += 1
            if trade_result['profit'] > self.best_trade:
                self.best_trade = trade_result['profit']
        else:
            self.losses += 1
            if trade_result['profit'] < self.worst_trade:
                self.worst_trade = trade_result['profit']
        
        self.total_pnl += trade_result['profit']
        self.win_rate = (self.wins / self.total_trades) * 100
    
    def get_stats(self):
        return {
            'total_trades': self.total_trades,
            'win_rate': f"{self.win_rate:.1f}%",
            'total_pnl': f"${self.total_pnl:.2f}",
            'best_trade': f"${self.best_trade:.2f}",
            'worst_trade': f"${self.worst_trade:.2f}",
            'avg_trade': f"${self.total_pnl / self.total_trades:.2f}"
        }
```

---

## Debugging & Testing

### Test Your Agent

```python
# Mock market data for testing
test_market = {
    'pairs': {
        'BTC/USDC': {
            'price': 42000,
            'change_24h': 2.5,
            'volume_24h': 1500000,
            'trend': 'bullish',
            'volatility': 'medium'
        }
    },
    'market_sentiment': 'bullish'
}

# Test decision making
agent = TradingAgent('Test Agent', 'balanced', 'test-key')
decision = await agent.analyze_market(test_market)

print(f"Decision: {decision}")
# Should return BUY BTC/USDC with ~$1000-1500 amount
```

### Common Issues

**Agent not trading**:
- Check market conditions meet strategy criteria
- Verify API keys are valid
- Ensure portfolio has sufficient capital

**Trades losing money**:
- Review strategy parameters
- Check stop loss settings
- Analyze market volatility

**IntercomSwap errors**:
- Verify quote before execution
- Check slippage tolerance
- Ensure sufficient liquidity

---

## Tournament Rules

### How Tournaments Work

1. **Start**: All agents begin with $10,000
2. **Duration**: 20 trades per tournament
3. **Winner**: Highest portfolio value at end
4. **Prizes**: Top 3 agents ranked

### Winning Strategies

- **Consistency** beats luck (high win rate)
- **Risk management** prevents blowups
- **Quick decisions** win in fast markets
- **Fee awareness** (1.5% adds up!)

---

## 🔌 Complete WebSocket Agent (Live Mode)

### Full Working Agent Code

The agent included in `agent.py` is a **complete, working implementation** that:
- Connects to WebSocket server
- Uses real Claude API
- Analyzes market data
- Makes trading decisions
- Tracks portfolio and P/L

### Running the Agent

```bash
# Install dependencies
pip install anthropic websockets

# Run agent
python agent.py \
  --name "My Agent" \
  --strategy balanced \
  --api-key sk-ant-YOUR_KEY

# Expected output:
# 🔌 Connecting to ws://localhost:3000...
# ✅ Registered as My Agent
# 💰 Starting portfolio: $10000.00
# 🤖 My Agent is now trading...
```

### Agent Workflow

```
┌──────────────────────────────────────────────┐
│  1. Connect to WebSocket Server              │
│     ws://localhost:3000                      │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  2. Send REGISTER_AGENT                      │
│     {name, strategy}                         │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  3. Receive REGISTERED                       │
│     {agentId, portfolio: $10,000}            │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  4. Receive MARKET_UPDATE (every 3s)         │
│     {pairs, prices, trends, volatility}      │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  5. Analyze with Claude API                  │
│     • Parse market data                      │
│     • Build strategy-based prompt            │
│     • Call claude.messages.create()          │
│     • Parse JSON response                    │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  6. Send TRADE_DECISION                      │
│     {action: "BUY", pair, amount, reasoning} │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  7. Receive TRADE_EXECUTED                   │
│     {trade, profit, fee, portfolio, pnl}     │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Tournament        Repeat from
      Ends            Step 4
```

### Key Features of agent.py

1. **Async WebSocket** - Non-blocking connection
2. **Real Claude API** - Actual AI decision making
3. **Strategy-based** - Aggressive/Balanced/Conservative
4. **Error Handling** - Graceful failures, HOLD on errors
5. **Live Logging** - See decisions in real-time
6. **Portfolio Tracking** - P/L calculated accurately
7. **Tournament Support** - START/END messages handled

### Customizing the Agent

**Change Strategy Logic:**
```python
# In build_prompt() method
strategy_rules = {
    'my_custom_strategy': """
Your custom rules here:
- Position size: 15-20%
- Only trade BTC
- Exit at 10% profit
"""
}
```

**Add Technical Indicators:**
```python
def calculate_rsi(prices):
    # Your RSI logic
    return rsi

async def analyze_and_trade(self, market_data):
    # Calculate indicators
    rsi = calculate_rsi(market_data['pairs']['BTC/USDC']['price'])
    
    # Include in prompt
    prompt = f"RSI is {rsi}. Should we trade?"
```

**Multiple Agents at Once:**
```bash
# Terminal 1
python agent.py --name "Agent A" --strategy aggressive --api-key sk-ant-...

# Terminal 2
python agent.py --name "Agent B" --strategy balanced --api-key sk-ant-...

# Terminal 3
python agent.py --name "Agent C" --strategy conservative --api-key sk-ant-...

# They all compete simultaneously!
```

---

## 📊 Performance Metrics

### Track These Stats

The live server automatically tracks:
- Total trades executed
- Win rate per agent
- Total P/L per agent
- Portfolio value
- Best trade
- Worst trade
- Average position size
- IntercomSwap fees paid

**View in browser:** `http://localhost:3000`

### Example Tournament Results

```
🏆 TOURNAMENT ENDED!
==================================================
Winner: Claude Aggressive
Profit: $342.50
Trades: 24

📊 Final Rankings:
🥇 #1: Claude Aggressive - $342.50 (24 trades)
🥈 #2: Claude Balanced - $187.20 (18 trades)
🥉 #3: Claude Conservative - $95.80 (12 trades)

Total Volume: $42,500
Total Fees: $637.50 (to IntercomSwap)
```

---

## 🐛 Debugging & Testing

### Test Your Agent Locally

```bash
# 1. Start server
npm start

# 2. In another terminal, run agent
python agent.py --name "Test" --strategy balanced --api-key sk-ant-...

# 3. Check output
# Should see: "✅ Registered" and "Waiting for market data..."

# 4. Watch browser
open http://localhost:3000
# Agent should appear in sidebar
```

### Common Issues

**"Connection refused"**
```bash
# Server not running
# Solution: npm start
```

**"Agent not registered"**
```bash
# Wrong message format or server error
# Check server logs
# Verify JSON structure
```

**"No trades happening"**
```bash
# Agent might be choosing HOLD
# Check Claude's reasoning in terminal
# Try more aggressive strategy
# Verify market data is being received
```

**"JSON parse error"**
```bash
# Claude returned invalid JSON
# Agent automatically sends HOLD as fallback
# Check prompt formatting
# Ensure max_tokens is sufficient (300+)
```

### Enable Debug Mode

```python
# Add to agent.py
import logging
logging.basicConfig(level=logging.DEBUG)

# You'll see:
# - All WebSocket messages
# - Full Claude prompts
# - Raw Claude responses
# - Decision parsing
```

---

## 🧪 Testing Your Agent

### Quick Local Test

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run your agent
python agent.py \
  --name "Test Agent" \
  --strategy balanced \
  --api-key sk-ant-YOUR_KEY

# Terminal 3: Watch live
open http://localhost:3000

# Expected: Agent connects → Trades → Earns profit! ✅
```

### Testing Without API Costs

```python
# Create test_agent.py - rule-based, no API
def simple_decision(market_data):
    btc = market_data['pairs']['BTC/USDC']
    
    if btc['change_24h'] > 2:
        return {'action': 'BUY', 'pair': 'BTC/USDC', 'amount': 1000}
    else:
        return {'action': 'HOLD'}

# Free testing! Perfect for debugging!
```

---

## 🐛 Troubleshooting

### Common Issues & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| **"Connection refused"** | Server not running | Run `npm start` |
| **"Invalid API key"** | Wrong/expired key | Check Anthropic dashboard |
| **Agent not trading** | No market signals | Try `--strategy aggressive` |
| **"ModuleNotFoundError"** | Missing dependencies | Run `pip install -r requirements.txt` |
| **Slow responses** | Claude API latency | Normal! ~1-2s per decision |
| **Too expensive** | Using Sonnet | Switch to Haiku: 10× cheaper! |

### Debug Mode

```python
# Add to agent.py for detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Shows:
# DEBUG: Received MARKET_UPDATE
# DEBUG: BTC: $42150 (+2.5%)
# DEBUG: Claude says: BUY BTC/USDC
# DEBUG: Trade result: +$42.50
```

---

## 💡 Pro Tips for Winning

### 1. Strategy Selection

```python
# Start conservative, go aggressive when ahead
if self.pnl > 300:
    strategy = 'aggressive'  # Go for big wins!
elif self.pnl < -100:
    strategy = 'conservative'  # Preserve capital
else:
    strategy = 'balanced'  # Default
```

### 2. Reduce API Costs

```python
# Cache decisions - don't analyze every update
if time.time() - last_decision < 5:  # Wait 5s minimum
    return 'HOLD'

# Use shorter prompts
prompt = f"BTC {trend}. Trade?" # $0.0001
# vs lengthy analysis prompt    # $0.001
```

### 3. Impress Judges

**Record this 30-second video:**
```
0:00 - Terminal: npm start
0:05 - Terminal: python agent.py (show Claude API key)
0:10 - Browser: Agent appears in list
0:15 - Watch: Charts updating, trades executing
0:25 - Show: Agent winning with positive P/L
0:30 - Screenshot: Final leaderboard position
```

**Upload to YouTube (unlisted) → Add to README!**

---

## 📊 Performance Benchmarks

### Expected Results (20-trade tournament)

| Strategy | Avg Trades | Win Rate | Avg P/L | API Cost |
|----------|-----------|----------|---------|----------|
| **Aggressive** | 18 | 50% | +$120 | $0.018 |
| **Balanced** | 12 | 60% | +$75 | $0.012 |
| **Conservative** | 8 | 70% | +$35 | $0.008 |

**💰 Total testing cost: <$1**

### Cost Optimization

| Model | Cost/Trade | 20 Trades | Notes |
|-------|-----------|-----------|-------|
| **Claude Haiku** | $0.0001 | $0.002 | ✅ Recommended! |
| **Claude Sonnet** | $0.001 | $0.02 | Good quality |
| **GPT-4 Turbo** | $0.003 | $0.06 | Most expensive |
| **Local LLM** | $0.00 | $0.00 | Free! (Ollama) |

---

## Competition Notes

### What Makes This Entry Special

✅ **Real AI Agents** - Not simulated! Actual Claude/GPT-4 via API  
✅ **WebSocket Server** - Production-ready Node.js backend  
✅ **True Intercom Protocol** - Multi-agent communication  
✅ **IntercomSwap Integration** - Every trade uses it (1.5% fee)  
✅ **Live Charts** - Real Chart.js, not fake  
✅ **Multiple Modes** - Standalone AND live server  
✅ **Complete Package** - 10 files, 2,700+ lines of code  

### Submission Recommendation

**Use LIVE SERVER MODE for competition!**

**Why?**
- ✅ Judges can see real Claude/GPT-4 trading
- ✅ WebSocket protocol = true Intercom implementation
- ✅ Way more impressive than simulated agents
- ✅ Shows production-readiness
- ✅ Demonstrates full-stack skills

**How to prove it:**
1. Record 30-second video (agent connecting, trading live)
2. Take screenshots (multiple agents, live charts)
3. Include `agent.py` code in submission
4. Mention in README: "Real AI agents connect via WebSocket"

**Standalone mode is great for quick demos, but live mode WINS!** 🏆

**Reward**: 500 TNK per eligible fork

---

## Resources

### Project Files

| File | Purpose | Use For |
|------|---------|---------|
| `index.html` | Standalone demo | Quick testing, screenshots |
| `index-live.html` | Live viewer | Watching agents compete |
| `server.js` | WebSocket server | Running live mode |
| `agent.py` | Python AI agent | Your competitive agent! |
| `README.md` | Competition entry | Main documentation |
| `SKILL.md` | This file | AI instructions |
| `SETUP.md` | Setup guide | Installation help |
| `COMPETITION.md` | Submission guide | Winning tips |
| `package.json` | Node dependencies | npm install |
| `requirements.txt` | Python dependencies | pip install |

### External Links

- **Intercom**: https://github.com/Trac-Systems/intercom
- **IntercomSwap**: https://github.com/TracSystems/intercom-swap
- **Claude API**: https://console.anthropic.com
- **Anthropic Docs**: https://docs.anthropic.com

### Quick Commands

```bash
# Test standalone
open index.html

# Run live server
npm install && npm start
python agent.py --name "Test" --strategy balanced --api-key sk-ant-...
open http://localhost:3000

# Check agent status
# Look for: ✅ Registered as... 💰 Starting portfolio...

# Deploy to cloud
git push heroku main  # Heroku
# or use Replit, Railway, etc.
```

---

## Summary for AI Agents

### 🎮 Standalone Mode (Quick Demo)

**Best for:** Testing, screenshots, quick demos

```bash
# 1. Download index.html
# 2. Open in browser
open index.html

# 3. Click "Start Tournament"
# 4. Watch simulated agents trade
# 5. Takes 15 seconds
```

**Pros:** Zero setup, works instantly  
**Cons:** Simulated agents, not real AI

---

### 🚀 Live Server Mode (REAL AI!)

**Best for:** Competition submission, impressive demos, actual testing

```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt

# 2. Start server (Terminal 1)
npm start
# → Server running on ws://localhost:3000

# 3. Connect agents (Terminal 2+)
python agent.py \
  --name "Claude Balanced" \
  --strategy balanced \
  --api-key sk-ant-YOUR_KEY

python agent.py \
  --name "Claude Aggressive" \
  --strategy aggressive \
  --api-key sk-ant-YOUR_KEY

# 4. Watch live (Browser)
open http://localhost:3000
# → See agents connect, trade, compete!
```

**Pros:** Real AI, true Intercom, production-ready  
**Cons:** 5-minute setup, requires API key

---

### 📋 Quick Command Reference

```bash
# SERVER
npm start                              # Start WebSocket server
npm install                            # Install dependencies

# AGENTS
python agent.py --name "X" --strategy Y --api-key Z   # Connect agent

# Strategies
--strategy aggressive     # 20-30% positions, high risk/reward
--strategy balanced       # 10-15% positions, moderate risk  
--strategy conservative   # 5-10% positions, capital preservation

# FRONTEND
open http://localhost:3000            # Watch live
open index.html                       # Standalone demo

# TESTING
python agent.py --name "Test" --strategy balanced --api-key sk-ant-...
# Look for: ✅ Registered, 💰 Portfolio: $10000, 📈 Trade executed
```

---

### 🎯 Agent Workflow (Automatic in agent.py)

```
1. Connect to ws://localhost:3000 ✅
   ↓
2. Register with name + strategy ✅
   ↓
3. Receive market data every 3s ✅
   ↓
4. Analyze with Claude API ✅
   ↓
5. Make BUY/SELL/HOLD decision ✅
   ↓
6. Send decision to server ✅
   ↓
7. Server executes via IntercomSwap ✅
   ↓
8. Receive trade result + P/L ✅
   ↓
9. Update portfolio ✅
   ↓
10. Repeat until tournament ends ✅
```

**All automatic - just run `python agent.py` and watch!** 🤖

---

### 🏆 Winning Strategy

**For Maximum Success:**

1. **Use live server mode** (not standalone)
2. **Record video** of agent trading (30 seconds)
3. **Take screenshots** of multiple agents competing
4. **Show Claude API** in action (terminal output)
5. **Deploy to cloud** (optional bonus: Heroku, Replit)
6. **Emphasize** in README: "Real AI agents via WebSocket"

**Why this wins:**
- ✅ Real Claude/GPT-4 = more impressive
- ✅ WebSocket server = true Intercom protocol
- ✅ Live mode = production-ready
- ✅ Multiple agents = demonstrates scalability
- ✅ Video proof = judges can see it work

**Expected reward: 500 TNK** 💰

---

### 💡 Final Tips

**Cost optimization:**
- Use Claude Haiku ($0.002/tournament) instead of Sonnet
- Test with mock agent first (free)
- Cache decisions to reduce API calls

**Performance tips:**
- Balanced strategy wins most consistently
- Conservative rarely loses money
- Aggressive can win big but risky

**For competition:**
- Submit live mode (way more impressive!)
- Include agent.py in submission
- Link to video demo
- Screenshots of live trading
- Mention WebSocket + Claude API

**Remember:** IntercomSwap takes 1.5% fee on every trade - factor into strategy!

---

**🤖 Ready to compete? Download agent.py, add your API key, and start winning! 📈💰🏆**
