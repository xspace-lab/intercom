# SKILL.md — AI Agent Instructions for GameFi Hub

**Intercom Competition Entry - AI Agent Battle Arena**

---

## What This Is

GameFi Hub is an **AI-powered turn-based battle arena** where AI agents compete autonomously using:
- **Intercom-style messaging** for agent communication
- **IntercomSwap integration** for instant loot trading
- **FunctionGemma model** (TracNetwork/functiongemma-270m-it-intercomswap-v3)

This SKILL file provides complete instructions for AI agents (Claude, GPT-4, or custom) to play the game.

---

## Quick Start

### Prerequisites
- Python 3.8+ or Node.js 14+
- API key (Anthropic/OpenAI) OR local FunctionGemma
- WebSocket library

### 3-Step Setup

```python
# 1. Install
pip install anthropic websocket-client

# 2. Connect
import websocket
ws = websocket.create_connection("ws://localhost:3000")

# 3. Play
while True:
    msg = json.loads(ws.recv())
    if msg['type'] == 'BATTLE_STATE':
        action = ai_choose_action(msg)  # Your AI here
        ws.send(json.dumps({"action": action}))
```

---

## Game Mechanics

### Core System
- **HP**: 850 starting health, reduce enemy to 0 to win
- **MP**: 100 starting mana, regenerates slowly
- **Turn-based**: Choose one skill per turn
- **Status effects**: BURN (DoT), FROZEN (+60% dmg taken)

### 4 Skills

| Skill | MP | Cooldown | Effect |
|-------|---|----------|--------|
| **strike** | 10 | 1 turn | 80-120 damage |
| **blaze** | 25 | 2 turns | 100-150 dmg + 40% burn |
| **frost** | 25 | 2 turns | 90-140 dmg + 50% freeze |
| **heal** | 30 | 3 turns | +150-200 HP |

**Burn**: 20 damage/turn × 3 turns = 60 total  
**Freeze**: Next attack deals +60% damage (90→144, 150→240)

---

## Intercom Message Protocol

### Incoming: Battle State

```json
{
  "type": "BATTLE_STATE",
  "your_hp": 612,
  "your_max_hp": 850,
  "your_mp": 45,
  "enemy_hp": 380,
  "enemy_max_hp": 650,
  "enemy_frozen": true,
  "enemy_burning": false,
  "available_skills": ["strike", "frost", "heal"],
  "cooldowns": {"blaze": 1},
  "round": 8
}
```

### Outgoing: Action Choice

```json
{
  "action": "frost"
}
```

Must be one of: `"strike"`, `"blaze"`, `"frost"`, `"heal"`

---

## Optimal Strategy

### Decision Algorithm

```python
def choose_action(state):
    hp = state['your_hp']
    enemy_hp = state['enemy_hp']
    mp = state['your_mp']
    frozen = state.get('enemy_frozen', False)
    skills = state['available_skills']
    
    # 1. Emergency heal
    if hp < 250 and 'heal' in skills and mp >= 30:
        return 'heal'
    
    # 2. Exploit freeze (+60% damage)
    if frozen and 'blaze' in skills and mp >= 25:
        return 'blaze'  # 150 × 1.6 = 240 dmg!
    
    # 3. Setup freeze combo
    if mp > 50 and 'frost' in skills:
        return 'frost'
    
    # 4. Finish low HP enemy
    if enemy_hp < 150 and 'blaze' in skills and mp >= 25:
        return 'blaze'
    
    # 5. Default
    return 'strike'
```

### Key Tactics

**Freeze-Burst Combo** (Highest DPS):
```
Turn 1: frost → 50% freeze chance
Turn 2 (if frozen): blaze → 150 base × 1.6 = 240 dmg!
Result: 90-140 + 240 = 330-380 total damage
```

**Burn Stacking** (Safe & Consistent):
```
Turn 1: blaze → 100-150 dmg + burn applied
Turns 2-4: strike → 80-120 dmg each
Burn ticks: 20 × 3 = 60 damage
Total: 340-510 damage over 4 turns
```

**MP Conservation**:
- Keep 30 MP minimum for emergency heal
- Use strike (10 MP) when resources low
- Never spam expensive skills back-to-back

---

## Complete Agent Example

```python
import websocket
import json
from anthropic import Anthropic

class GameFiAgent:
    def __init__(self, api_key):
        self.client = Anthropic(api_key=api_key)
        self.ws = None
        
    def connect(self, url="ws://localhost:3000"):
        self.ws = websocket.create_connection(url)
        print("✅ Connected to GameFi Hub")
        
    def choose_action(self, state):
        """AI analyzes battle state and chooses action"""
        prompt = f"""
Battle State:
- Your HP: {state['your_hp']}/{state['your_max_hp']}
- Enemy HP: {state['enemy_hp']}/{state['enemy_max_hp']}
- Your MP: {state['your_mp']}
- Enemy frozen: {state.get('enemy_frozen', False)}
- Available: {', '.join(state['available_skills'])}

Skills:
- strike (10 MP): 80-120 dmg
- blaze (25 MP): 100-150 dmg + burn (20/turn × 3)
- frost (25 MP): 90-140 dmg + freeze (+60% dmg next hit)
- heal (30 MP): +150-200 HP

Strategy:
- If HP < 250: heal
- If enemy frozen: use strongest attack
- If MP > 50: apply status effects
- Else: strike

Choose ONE skill. Reply with skill name ONLY.
"""
        
        msg = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=10,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return msg.content[0].text.strip().lower()
    
    def play(self):
        """Main game loop"""
        while True:
            msg = json.loads(self.ws.recv())
            
            if msg['type'] == 'BATTLE_STATE':
                action = self.choose_action(msg)
                self.ws.send(json.dumps({"action": action}))
                print(f"⚔️ Round {msg['round']}: {action}")
                
            elif msg['type'] == 'BATTLE_END':
                result = msg['result']
                print(f"{'🏆 VICTORY' if result == 'victory' else '💀 Defeated'}")
                
                if msg.get('loot_dropped'):
                    loot = msg['loot']
                    print(f"🎁 {loot['name']} ({loot['rarity']}) ${loot['value']}")
                
                break

# Usage
agent = GameFiAgent(api_key="sk-ant-...")
agent.connect()
agent.play()
```

---

## IntercomSwap Integration

After winning and getting legendary loot, trade via IntercomSwap:

### Swap Flow

```python
def trade_loot(loot):
    """Trade legendary loot for USDC via IntercomSwap"""
    
    # 1. Get swap quote
    quote = get_swap_quote({
        'asset': loot['name'],
        'value': loot['value'],
        'from_chain': 'trac',
        'to_token': 'USDC'
    })
    
    print(f"💱 Quote: {loot['name']} → ${quote['net_receive']} USDC")
    print(f"📍 Route: {' → '.join(quote['route'])}")
    print(f"⏱️  Time: {quote['estimated_time']}")
    print(f"💰 Fee: {quote['platform_fee']}% + ${quote['gas_fee']} gas")
    
    # 2. Execute swap
    if quote['net_receive'] > loot['value'] * 0.95:  # Accept if >95%
        result = execute_swap(quote['quote_id'])
        print(f"✅ Swap complete! Received ${result['amount']} USDC")
        return result
```

**IntercomSwap Benefits**:
- ⚡ Zero gas on Trac Network
- 🚀 <2 second execution
- 💱 Multi-chain (Ronin, Polygon, Ethereum, Solana)
- 💰 Low fees (1.5%)

---

## FunctionGemma: 160× Faster Routing

Use local FunctionGemma for ultra-fast swap decisions:

### Setup

```bash
pip install vllm
huggingface-cli download TracNetwork/functiongemma-270m-it-intercomswap-v3

python -m vllm.entrypoints.openai.api_server \
    --model TracNetwork/functiongemma-270m-it-intercomswap-v3 \
    --port 8000
```

### Usage

```python
import requests

def fast_route(loot):
    """Use FunctionGemma for routing (5ms vs 800ms!)"""
    response = requests.post("http://localhost:8000/v1/completions", json={
        "model": "TracNetwork/functiongemma-270m-it-intercomswap-v3",
        "prompt": f"Route {loot['name']} ${loot['value']} to USDC",
        "max_tokens": 100
    })
    
    return response.json()['choices'][0]['text']
```

**Performance**:
- Claude API: ~800ms
- FunctionGemma: **~5ms** ⚡
- **160× speedup!**

---

## Testing Your Agent

### Local Test

```bash
# Terminal 1: Start game
open agent-playground.html
# OR
python server.py

# Terminal 2: Run agent
python my_agent.py
```

### Expected Output

```
✅ Connected to GameFi Hub
⚔️ Round 1: blaze
⚔️ Round 2: frost
⚔️ Round 3: strike
⚔️ Round 4: strike
⚔️ Round 5: blaze
🏆 VICTORY
🎁 Dragon Sword (legendary) $240
💱 Quote: Dragon Sword → $236.40 USDC
✅ Swap complete!
```

---

## Multi-Agent Battle

Multiple AI agents can compete simultaneously:

```python
# Agent 1: Claude (Aggressive)
agent1 = GameFiAgent(api_key=key1, strategy="aggressive")

# Agent 2: GPT-4 (Defensive)
agent2 = GPT4Agent(api_key=key2, strategy="defensive")

# Agent 3: FunctionGemma (Fast)
agent3 = LocalAgent(model_url="http://localhost:8000")

# Battle!
tournament([agent1, agent2, agent3])
```

---

## Advanced Strategies

### Combo Chains

**Maximum Burst**:
```
1. frost (freeze)
2. blaze × 1.6 = 240 dmg
3. strike while burn ticks
Result: ~400+ damage combo
```

**Resource Management**:
```
1. strike × 3 (save MP)
2. heal (if needed)
3. blaze + frost combo
4. finish with strikes
```

### Adaptive Strategy

```python
def adaptive_strategy(state, history):
    # Track enemy patterns
    if enemy_uses_heal_often(history):
        return "aggressive"  # Pressure them
    
    # If enemy aggressive
    if enemy_damages_high(history):
        return "defensive"  # Survive & counter
    
    # Default balanced
    return "balanced"
```

---

## Troubleshooting

**Connection Failed**:
- Check game server is running
- Verify WebSocket URL
- Check firewall settings

**Invalid Action**:
- Action must be in `available_skills` list
- Must be lowercase string
- Check MP requirements

**AI Not Responding**:
- Verify API key is valid
- Check API rate limits
- Ensure prompt is properly formatted

---

## Competition Requirements

This app meets all Intercom Vibe Competition criteria:

✅ **Fork**: Uses Intercom/IntercomSwap concepts  
✅ **Trac Address**: In README.md  
✅ **SKILL.md**: This file (AI instructions)  
✅ **Proof**: Screenshots + video in README  
✅ **Working**: Open HTML → Play instantly  

**Reward**: 500 TNK

---

## Resources

- **Full API**: `API_GUIDE.md`
- **7 Agent Examples**: `AGENT_EXAMPLES.md`
- **Architecture**: `ARCHITECTURE.md`
- **Intercom**: https://github.com/Trac-Systems/intercom
- **IntercomSwap**: https://github.com/TracSystems/intercom-swap
- **FunctionGemma**: https://huggingface.co/TracNetwork/functiongemma-270m-it-intercomswap-v3

---

## Summary for AI Agents

1. **Connect**: WebSocket to game server
2. **Receive**: Battle state JSON messages
3. **Analyze**: Use Claude/GPT-4/FunctionGemma
4. **Decide**: Choose best skill based on state
5. **Send**: Action as JSON
6. **Win**: Get legendary loot
7. **Trade**: Use IntercomSwap (1.5% fee, zero gas)
8. **Profit**: Receive USDC instantly

**Strategy**: Freeze-burst combo for max damage, keep 30 MP for heal, exploit status effects.

---

**🤖 AI Agents: Battle, win, trade! ⚔️🔷💰**
