"""
AI Trading Agent - Connects to AI Trading Arena
Uses Claude to make real trading decisions

Usage:
    python agent.py --name "My Agent" --strategy balanced --api-key sk-ant-...
"""

import asyncio
import websockets
import json
import argparse
from anthropic import Anthropic

class TradingAgent:
    def __init__(self, name, strategy, api_key, server_url="ws://localhost:3000"):
        self.name = name
        self.strategy = strategy
        self.server_url = server_url
        self.client = Anthropic(api_key=api_key)
        self.agent_id = None
        self.portfolio = 10000
        self.pnl = 0
        
    async def connect(self):
        """Connect to trading arena"""
        print(f"🔌 Connecting to {self.server_url}...")
        
        async with websockets.connect(self.server_url) as websocket:
            self.websocket = websocket
            
            # Register with server
            await self.register()
            
            # Main trading loop
            await self.trading_loop()
    
    async def register(self):
        """Register agent with server"""
        message = {
            "type": "REGISTER_AGENT",
            "name": self.name,
            "strategy": self.strategy
        }
        
        await self.websocket.send(json.dumps(message))
        
        # Wait for confirmation
        response = await self.websocket.recv()
        data = json.loads(response)
        
        if data['type'] == 'REGISTERED':
            self.agent_id = data['agentId']
            self.portfolio = data['portfolio']
            print(f"✅ Registered as {self.name} ({self.agent_id})")
            print(f"💰 Starting portfolio: ${self.portfolio}")
        else:
            raise Exception("Registration failed")
    
    async def trading_loop(self):
        """Main loop - receive market data and make decisions"""
        print(f"🤖 {self.name} is now trading with {self.strategy} strategy...")
        
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self.handle_message(data)
        except websockets.exceptions.ConnectionClosed:
            print("❌ Connection closed")
    
    async def handle_message(self, data):
        """Handle messages from server"""
        msg_type = data.get('type')
        
        if msg_type == 'MARKET_UPDATE':
            # Market data received - make trading decision
            await self.analyze_and_trade(data)
            
        elif msg_type == 'TRADE_EXECUTED':
            # Trade result received
            trade = data['trade']
            self.portfolio = data['portfolio']
            self.pnl = data['pnl']
            
            emoji = "📈" if trade['profit'] > 0 else "📉"
            print(f"{emoji} Trade executed: {trade['action']} {trade['pair']}")
            print(f"   Profit: ${trade['profit']:.2f} | Portfolio: ${self.portfolio:.2f}")
            
        elif msg_type == 'TOURNAMENT_START':
            print("🏁 Tournament started!")
            
        elif msg_type == 'TOURNAMENT_END':
            results = data['results']
            winner = data['winner']
            print(f"\n🏆 Tournament ended! Winner: {winner['name']} (${winner['pnl']:.2f})")
            
            # Find our position
            for i, result in enumerate(results):
                if result['name'] == self.name:
                    print(f"📊 Your rank: #{i+1} | P/L: ${result['pnl']:.2f}")
                    break
    
    async def analyze_and_trade(self, market_data):
        """Use Claude to analyze market and make decision"""
        
        # Build prompt based on strategy
        prompt = self.build_prompt(market_data)
        
        # Ask Claude
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Parse Claude's response
            response_text = message.content[0].text.strip()
            decision = self.parse_decision(response_text, market_data)
            
            # Send decision to server
            await self.websocket.send(json.dumps(decision))
            
        except Exception as e:
            print(f"⚠️ Error analyzing market: {e}")
    
    def build_prompt(self, market_data):
        """Build analysis prompt for Claude"""
        
        pairs_info = ""
        for pair, info in market_data['pairs'].items():
            pairs_info += f"\n{pair}: ${info['price']} ({info['change_24h']:+.1f}% 24h) - {info['trend']}, {info['volatility']} vol"
        
        strategy_rules = {
            'aggressive': "Trade large positions (20-30% of portfolio). Accept high risk for high reward. Look for strong trends.",
            'balanced': "Trade moderate positions (10-15% of portfolio). Balance risk and reward. Look for confirmed trends with volume.",
            'conservative': "Trade small positions (5-10% of portfolio). Preserve capital. Only trade low volatility with clear signals."
        }
        
        prompt = f"""You are {self.name}, an AI trading agent with a {self.strategy} strategy.

Current Portfolio: ${self.portfolio:.2f}
Current P/L: ${self.pnl:.2f}
Strategy: {strategy_rules[self.strategy]}

Market Data:
{pairs_info}

Market Sentiment: {market_data['market_sentiment']}
Fear & Greed Index: {market_data['fear_greed_index']}/100

Based on your {self.strategy} strategy, decide whether to trade.

Respond ONLY with a JSON object (no markdown):
{{
  "action": "BUY" or "SELL" or "HOLD",
  "pair": "BTC/USDC" or "ETH/USDC" or "SOL/USDC" or "MATIC/USDC",
  "amount": <dollar amount based on your strategy>,
  "reasoning": "<brief explanation>"
}}

If no good trade opportunity, use "HOLD".
"""
        return prompt
    
    def parse_decision(self, response_text, market_data):
        """Parse Claude's response into trade decision"""
        
        # Remove markdown code blocks if present
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        try:
            decision = json.loads(response_text)
            
            # Add type field
            decision['type'] = 'TRADE_DECISION'
            
            # Validate
            if decision['action'] not in ['BUY', 'SELL', 'HOLD']:
                decision['action'] = 'HOLD'
            
            if decision.get('pair') not in market_data['pairs']:
                decision['pair'] = 'BTC/USDC'
            
            # Ensure amount makes sense for strategy
            max_position = {
                'aggressive': 0.30,
                'balanced': 0.15,
                'conservative': 0.10
            }[self.strategy]
            
            if decision.get('amount', 0) > self.portfolio * max_position:
                decision['amount'] = self.portfolio * max_position
            
            return decision
            
        except json.JSONDecodeError:
            # If parsing fails, return HOLD
            return {
                'type': 'TRADE_DECISION',
                'action': 'HOLD',
                'reasoning': 'Parse error, holding position'
            }

def main():
    parser = argparse.ArgumentParser(description='AI Trading Agent')
    parser.add_argument('--name', type=str, required=True, help='Agent name')
    parser.add_argument('--strategy', type=str, choices=['aggressive', 'balanced', 'conservative'],
                       default='balanced', help='Trading strategy')
    parser.add_argument('--api-key', type=str, required=True, help='Anthropic API key')
    parser.add_argument('--server', type=str, default='ws://localhost:3000',
                       help='Server URL')
    
    args = parser.parse_args()
    
    agent = TradingAgent(
        name=args.name,
        strategy=args.strategy,
        api_key=args.api_key,
        server_url=args.server
    )
    
    # Run agent
    asyncio.run(agent.connect())

if __name__ == '__main__':
    main()
