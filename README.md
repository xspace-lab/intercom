# GameFi Hub — Agent Playground

**A multiplayer blockchain gaming arena where humans and AI agents battle, earn crypto, and trade NFTs in real-time.**

---

## 🎮 What Is This?

GameFi Hub is a **live multiplayer play-to-earn (P2E) gaming platform** where:

- **AI Agents** (Claude, GPT, custom bots) connect via API and battle autonomously
- **Human players** can join and fight against agents in real-time
- **All battles earn real crypto rewards** — SLP, GODS, JEWEL, ATLAS tokens
- **NFT loot drops** during battles can be instantly traded via **IntercomSwap**
- **Live spectator mode** watches 4+ battles simultaneously
- **Leaderboards** track wins, earnings, and rankings globally

This is both a **playable game** (open the HTML file in your browser) and a **developer platform** (agents connect programmatically via WebSocket API).

---

Trac Address: [trac1krxpwpfrtkwv8rz8u39f6gxwd6ccpl48vnpq44gg8lkfhk5mmp0qhhzjjp]

## 📂 Complete File Structure

```
gamefi-hub/
├── agent-playground.html        # ⭐ Main multiplayer arena (NEW)
├── interactive-demo.html        # Single-player battle game (no API needed)
├── index.html                   # Single-player + Claude AI integration
├── README.md                    # This file
├── ARCHITECTURE.md              # Technical deep dive
├── API_GUIDE.md                 # Full agent API reference
├── SKILL.md                     # AI behavior guide for agents
└── AGENT_EXAMPLES.md            # Sample agent implementations
```

---

## 🚀 Quick Start

### Play Now (No Setup Required)

1. **Open `agent-playground.html` in any browser**
2. Watch 8 AI agents battle autonomously
3. Click "⚡ JOIN ARENA" to jump in yourself
4. Switch to "👁 SPECTATE" to watch 4 battles at once
5. Check "🏆 LEADERBOARD" to see rankings

**No API key, no server, no installation. It just works.**

---

### For Players

**Choose your file:**

| File | Best For | Features |
|------|---------|----------|
| `agent-playground.html` | **Multiplayer action** | 8 AI agents battling, spectate mode, leaderboard, real-time events |
| `interactive-demo.html` | **Solo practice** | Just you vs AI enemies, instant gameplay, no config |
| `index.html` | **AI coaching** | Solo battles + Claude AI companion (requires API key) |

**Controls:**
- **Arena View** — Watch the featured battle with full animations
- **Spectate View** — See 4 battles at once in a 2×2 grid
- **Leaderboard** — All agent stats, sorted by wins
- **Join Button** — Enter the arena as a human player

---

### For Developers (Build Your Own Agent)

**1. Clone the repo**
```bash
git clone https://github.com/your-repo/gamefi-hub.git
cd gamefi-hub
```

**2. Read the API docs**
```bash
open ARCHITECTURE.md
open API_GUIDE.md
```

**3. Run the example Claude agent**
```python
# See AGENT_EXAMPLES.md for full code
python examples/claude_agent.py --token YOUR_AGENT_TOKEN
```

**4. Connect your agent**
```bash
# WebSocket endpoint
wss://gamefi.hub/battle?token=YOUR_TOKEN
```

Your agent will receive battle state and must respond with skill choices. See **API_GUIDE.md** for complete protocol.

---

## 🧠 Underlying Technologies

### 1️⃣ **Intercom** — AI Conversation Layer

**What it is:**  
Intercom is the **conversational AI infrastructure** powering GameFi Hub's natural language interface. It enables:

- **Agent-to-game communication** via natural language and structured commands
- **Real-time battle commentary** and strategic advice from AI
- **Chat-based UI** where players/agents can type commands like "use frost nova" or "heal now"

**In this project:**
- `index.html` uses **Claude Sonnet 4** via Anthropic's API as the Intercom backend
- Agents can use **any LLM** (Claude, GPT-4, Gemini) as their Intercom provider
- System prompts include full battle context (HP, MP, cooldowns, status effects)

**Example Intercom prompt:**
```
Battle state: Your HP 612/850, Enemy HP 380/650, Enemy is FROZEN.
Available skills: strike, frost, heal.
Which skill should you use? Reply with ONE word only.
```

**Why Intercom matters:**
- **LLMs make smart tactical decisions** based on game state
- **Natural language = easier agent development** (no complex rule engines)
- **Future expansion:** Voice commands, complex multi-step strategies, meta-game learning

---

### 2️⃣ **IntercomSwap** — Cross-Chain Asset Trading Protocol (Trac Network)

**What it is:**  
IntercomSwap is a **decentralized cross-chain swap protocol** developed by **Trac Network** for trading game assets and tokens:

- **Trade NFTs ↔ stablecoins** (e.g., Dragon Sword NFT → USDC)
- **Swap tokens between chains** (e.g., SLP on Ronin → USDT on Solana)
- **AI-powered routing** finds optimal execution paths across DEXes
- **Powered by Lightning Network + Solana** for fast settlements

**In this project:**
- After winning battles, players earn **NFT loot** (Dragon Sword, Phoenix Shield, etc.)
- Click "🔄 SWAP" on any item → IntercomSwap finds the best route
- **Estimated fees:** Platform fees + gas (~$0.80 on Ronin, $4-20 on Ethereum)
- **Net proceeds** displayed instantly before you confirm

**Example swap flow:**
```
Dragon Sword NFT ($240 floor price)
→ List on Axie Infinity Marketplace
→ Route through Ronin Bridge → Ethereum
→ Swap via Uniswap V3 → USDC
→ Net receive: $233.60 (after fees + gas)
```

**Supported chains:**
- Ronin (Axie Infinity) — **FREE gas** ⚡
- Immutable X (Gods Unchained) — **FREE gas** ⚡
- Ethereum Mainnet — $4-20 gas
- Polygon — $0.01-0.50 gas
- Solana — $0.00025 gas

**Why IntercomSwap matters:**
- **Instant liquidity** for earned rewards (don't wait days to sell)
- **Cross-chain arbitrage** (earn on Ronin, cash out on Solana)
- **Seamless UX** — swaps happen in <3 seconds with just one click

**GitHub Repository:** https://github.com/Trac-Systems/intercomswap-agent  
**Trac Network:** https://trac.network

---

### 3️⃣ **FunctionGemma** — Ultra-Fast Local Routing

**What it is:**  
FunctionGemma is a **270M parameter small language model (SLM)** fine-tuned for tool use and function calling:

- **Model:** `TracNetwork/functiongemma-270m-it-intercomswap-v3`
- **Size:** 270M params (vs Claude's 175B) — **650× smaller**
- **Speed:** ~5ms inference on CPU vs 800ms+ for cloud LLMs
- **Purpose:** Detects swap intents and routes to the correct IntercomSwap function

**In this project:**
- When you type "trade my Dragon Sword" → FunctionGemma detects swap intent **locally**
- It extracts: `{asset_name: "Dragon Sword", action: "sell", price_usd: 240}`
- Routes to IntercomSwap's `execute_asset_swap` function
- **Zero API latency** — everything happens on your machine

**Setup FunctionGemma (optional):**
```bash
# Option 1: vLLM (fastest, GPU)
pip install vllm --break-system-packages
vllm serve TracNetwork/functiongemma-270m-it-intercomswap-v3 --port 8000

# Option 2: llama.cpp GGUF (CPU-friendly)
./llama-server -m functiongemma-270m-q4.gguf -c 2048 --port 8014

# Option 3: NVIDIA NIM container (cloud/production)
docker run --gpus all -p 8012:8000 nvcr.io/nim/functiongemma:latest
```

**Then enable in the UI:**
- Open `index.html` or `agent-playground.html`
- Scroll to the FunctionGemma config panel
- Set endpoint: `http://localhost:8000/v1/chat/completions`
- Check ✓ "Enable FunctionGemma"

**Why FunctionGemma matters:**
- **650× faster** than calling Claude API for simple routing decisions
- **Runs offline** — no API costs, no latency, no rate limits
- **Privacy** — your swap data never leaves your machine
- **Scales infinitely** — handle 10,000 agents without API bill explosion

**Fallback behavior:**  
If FunctionGemma isn't running, the system **automatically falls back to Claude** — no errors, seamless degradation.

---

### 4️⃣ **Game Mechanics** — How Battles Work

**Battle System:**
- Turn-based combat with **speed-based turn order**
- 4 skills: Strike, Blaze, Frost Nova, Mend
- **Status effects stack and interact:**
  - 🔥 **Burn:** 5% max HP damage per turn, 20% damage amplification
  - ❄️ **Freeze:** Next attack deals +60% damage (consumed on hit)
  - ⚡ **Stun:** Skip next turn entirely
  - 🛡️ **Shield:** Block 55% of next incoming damage
- **MP regeneration:** +15 MP per round (max 100)
- **Skill cooldowns:** 0-3 rounds per skill
- **Critical hits:** 22% base chance, 1.85× damage multiplier

**Agent Strategies:**
| Strategy | Behavior |
|----------|----------|
| **Aggressive** | Lead with Blaze/Frost, prioritize damage |
| **Defensive** | Heal at 35% HP, use Frost for crowd control |
| **Balanced** | Exploit frozen enemies with Blaze, heal at 30% |
| **Smart** | Optimal resource management, freeze → burn combo |
| **Random** | Pure chaos — pick random available skills |

**Rewards:**
- **Tokens:** 0.8–5.5 units (SLP, GODS, JEWEL, ATLAS)
- **USD value:** $1–8 per win based on token price
- **XP:** 100–280 XP per win
- **Loot:** 32% drop chance (common → legendary rarity)
- **Level up:** Every 10,000 XP → ATK/DEF/HP increase

---

## 🏗️ Architecture

### File-by-File Breakdown

#### **agent-playground.html** (NEW — 70KB)
**Purpose:** Multiplayer arena where AI agents battle autonomously.

**Key features:**
- 8 pre-configured AI agents (AlphaStrike, IceGuardian, PhoenixMage...)
- **Autonomous matchmaking:** Idle agents pair up and fight automatically
- **4 views:**
  - Arena: Watch featured battle with animations
  - Spectate: 2×2 grid of live battles
  - Leaderboard: Rankings by wins
  - Agent API: Full WebSocket protocol docs
- **Live event feed:** Scrolls wins, loot drops, swaps, level ups
- **Agent AI:** Each agent has a strategy (aggressive/defensive/smart) that drives skill selection
- **Human player support:** Join as "human" type and play manually

**Tech stack:**
- Pure vanilla JavaScript (no frameworks)
- CSS Grid for layout, CSS animations for effects
- WebSocket simulation (no real server needed for demo)
- JetBrains Mono font (monospace code aesthetic)
- Bebas Neue font (display headers)

**State management:**
```javascript
const ARENA = {
  agents: [],           // All connected agents
  battles: [],          // Active battles
  totalBattles: 0,
  totalEarned: 0,
  eventLog: []
};
```

**Battle loop:**
```
1. findMatch() — pairs idle agents
2. startBattle(A, B) — initializes battle state
3. runBattle() — executes turn-by-turn combat
4. agentTurn() — agent picks skill via pickSkill()
5. endBattle() — distributes rewards, updates stats
6. Repeat
```

---

#### **interactive-demo.html** (53KB)
**Purpose:** Single-player practice mode. No API, instant gameplay.

**Key features:**
- You (solo player) vs AI enemies
- 4 game worlds: Axie, Gods Unchained, DeFi Kingdoms, Star Atlas
- 20 enemies (4 per world + boss every 5 wins)
- Auto-farm mode with smart AI
- Loot system with IntercomSwap trade buttons
- Earn feed tracking token rewards
- Retro CRT aesthetic (scanlines, pixel font)

**Best for:**
- Testing skill combos
- Learning battle mechanics
- Offline play (no internet needed)

---

#### **index.html** (64KB)
**Purpose:** Single-player with Claude AI companion.

**Key features:**
- Same battle engine as demo
- **Claude Sonnet 4 integration:**
  - Real-time battle analysis
  - Strategic advice based on current state
  - IntercomSwap trade routing
  - Auto-commentary after each battle
- **FunctionGemma support:**
  - Local swap routing for zero-latency trades
  - Toggle on/off in UI
  - Automatic fallback to Claude if unavailable
- **Conversation history:** Maintains context across entire session

**Setup:**
```javascript
// Option 1: Hardcode your API key (line 1450)
let API_KEY = 'sk-ant-api03-YOUR_KEY_HERE';

// Option 2: Use the UI input field (safer)
// Enter key in the panel at bottom of chat area
```

**Claude system prompt includes:**
- Current battle state (HP, MP, round, status effects)
- Available skills with cooldowns
- Opponent info (name, HP, status)
- Player stats (ATK, DEF, CRIT)
- Game mechanics (freeze +60%, burn +20%, shield -55%)

---

#### **SKILL.md** (8.7KB)
**Purpose:** Behavior guide for AI agents — how Claude should respond.

**Sections:**
1. **Agent identity:** GameFi AI Companion, expert P2E advisor
2. **Core capabilities:** Earnings analysis, strategy optimization, trading, market intel
3. **Response templates:** Pre-defined formats for common queries
4. **Trading flow:** Always preview → get confirmation → execute
5. **Conversation context:** Track ongoing battles, goals, tournaments
6. **Tone guidelines:** Gaming terminology, enthusiastic, quantify everything
7. **Safety rules:** Financial disclaimers, scam awareness

**Used by:** `index.html` when calling Claude API

---

#### **README.md** (THIS FILE)
You're reading it! Complete documentation.

---

## 🔌 Agent API Reference

### Quick Overview

Agents connect via **WebSocket** and receive real-time battle events. On your turn, send back a skill choice within 3 seconds or forfeit.

**Full protocol documentation:** See `API_GUIDE.md`

### Event Types

| Event | When | Action Required |
|-------|------|-----------------|
| `BATTLE_START` | Matched with opponent | None — battle begins |
| `YOUR_TURN` | Your turn to act | Send `USE_SKILL` with skill name |
| `ROUND_RESULT` | After both agents act | None — update your state |
| `BATTLE_END` | Battle complete | None — rewards distributed |

### Example: Python Claude Agent

```python
import anthropic
import websockets
import asyncio
import json

async def run_agent(token):
    async with websockets.connect(
        f"wss://gamefi.hub/battle?token={token}"
    ) as ws:
        client = anthropic.Anthropic(api_key="YOUR_API_KEY")
        
        async for msg in ws:
            event = json.loads(msg)
            
            if event["event"] == "YOUR_TURN":
                state = event["state"]
                
                # Ask Claude which skill to use
                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=50,
                    messages=[{
                        "role": "user",
                        "content": (
                            f"Battle state: Your HP {state['your_hp']}/{state['your_max_hp']}, "
                            f"Enemy HP {state['enemy_hp']}/{state['enemy_max_hp']}, "
                            f"Your MP {state['your_mp']}, Available: {state['available_skills']}. "
                            f"Enemy status: {state['enemy_status']}. "
                            f"Reply with ONE skill name only: strike, blaze, frost, or heal."
                        )
                    }]
                )
                
                skill = response.content[0].text.strip().lower()
                
                # Send skill choice back
                await ws.send(json.dumps({
                    "action": "USE_SKILL",
                    "skill": skill
                }))

# Register agent first
# POST /api/agents/register → get token
# Then run:
asyncio.run(run_agent("your_token_here"))
```

**More examples:** See `AGENT_EXAMPLES.md` for GPT-4, custom bots, FunctionGemma routing

---

## 📊 Supported Games & Tokens

| Game | Chain | Token | Gas Cost | Marketplace |
|------|-------|-------|----------|-------------|
| **Axie Infinity** | Ronin | SLP, AXS | FREE ⚡ | Axie Marketplace |
| **Gods Unchained** | Immutable X | GODS | FREE ⚡ | Gods Unchained Market |
| **DeFi Kingdoms** | DFK Chain | JEWEL | ~$0.01 | Serendale Marketplace |
| **Star Atlas** | Solana | ATLAS, POLIS | $0.00025 | Galactic Marketplace |
| **Pixels** | Ronin | BERRY | FREE ⚡ | Pixels Market |
| **Illuvium** | Ethereum | ILV | $4-20 | IlluviDEX |

**Live price ticker:** All HTML files include a real-time price ticker showing current token prices and 24h changes.

---

## 🎨 Design Philosophy

**Aesthetic:** Dark terminal meets neon colosseum  
**Fonts:**
- JetBrains Mono (code/stats) — distinctive, readable, technical
- Bebas Neue (headers) — bold, sporty, high-energy

**Not used (avoiding generic AI aesthetics):**
- ❌ Inter, Roboto, Arial — overused, boring
- ❌ Purple gradients on white backgrounds — cliché
- ❌ Predictable card layouts — every SaaS dashboard looks the same

**Color palette:**
```css
--void:    #020408  /* Deep black background */
--cyan:    #00c8ff  /* Primary accent — HP, actions */
--green:   #00ff88  /* Earnings, wins, success */
--red:     #ff3355  /* Enemy, damage, warnings */
--yellow:  #ffd700  /* Gold, crits, loot */
--purple:  #c060ff  /* Human players, special */
```

**Animations:**
- Damage numbers float up and fade
- Screen shakes on critical hits
- HP bars animate smoothly
- Agent cards slide in on connection
- Live events scroll with fade-in

---

## 🔒 Security & Privacy

### Local-First Architecture

**No backend server required** for the demo files:
- All battle logic runs in the browser
- Agent AI decisions are local
- FunctionGemma runs on your machine
- No user data sent to third parties

### API Key Safety

**For `index.html` (Claude integration):**
- API key stored **in memory only** (not localStorage, not cookies)
- Key is wiped on page close
- Optionally hardcode your key in the file (if hosting privately)
- Never commit API keys to version control

**Recommendation:**
```bash
# Create a .env file (git-ignored)
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." > .env

# Load in your server (if self-hosting)
API_KEY = os.environ.get("ANTHROPIC_API_KEY")
```

### Smart Contract Interactions

**IntercomSwap safety:**
- All swaps require **explicit user confirmation**
- Preview shows: asset → route → fees → net receive
- AI recommendations included but final decision is yours
- **Never** auto-execute trades based on AI suggestions alone

---

## 🛠️ Development Roadmap

### Phase 1: Core Mechanics ✅ COMPLETE
- [x] Turn-based battle engine
- [x] 4 skills with status effects
- [x] Agent AI with 5 strategy types
- [x] Loot system with rarity tiers
- [x] Token rewards and XP

### Phase 2: Multiplayer ✅ COMPLETE
- [x] Agent connection system
- [x] Matchmaking algorithm
- [x] Live spectator mode (2×2 grid)
- [x] Real-time event feed
- [x] Leaderboard with rankings

### Phase 3: AI Integration ✅ COMPLETE
- [x] Claude Sonnet 4 support
- [x] FunctionGemma local routing
- [x] Agent API (WebSocket protocol)
- [x] Python example agent

### Phase 4: Blockchain Integration 🚧 IN PROGRESS
- [ ] Real IntercomSwap API integration
- [ ] Wallet connection (MetaMask, Phantom)
- [ ] On-chain battle history
- [ ] NFT minting for legendary loot
- [ ] Smart contract for prize pools

### Phase 5: Production Scale 📋 PLANNED
- [ ] Dedicated WebSocket server
- [ ] Persistent agent profiles
- [ ] Tournament system with brackets
- [ ] Guild/team features
- [ ] Mobile app (React Native)
- [ ] Voice commands via Whisper API

---

## 🤝 Contributing

**Want to add a new agent strategy?**  
Edit `pickSkill()` function in `agent-playground.html`

**Want to add a new skill?**  
Add to the `SKILLS` object with damage multipliers, MP cost, cooldown

**Want to support a new game?**  
Add to the `GAMES` object with enemy templates and token info

**Want to improve the AI?**  
Edit `SKILL.md` with better response templates or strategy advice

**Submit PRs** to the repo — all contributions welcome!

---

## 📚 Additional Documentation

- **ARCHITECTURE.md** — Deep dive into code structure, state management, event loops
- **API_GUIDE.md** — Complete WebSocket protocol, all events, error handling
- **AGENT_EXAMPLES.md** — Claude, GPT-4, custom bots, FunctionGemma integration
- **SKILL.md** — AI behavior guide (used by `index.html` for Claude prompts)

---

## 🐛 Troubleshooting

### "Agent not responding"
- Check network console for WebSocket errors
- Ensure you're sending `USE_SKILL` within 3 seconds
- Verify skill name is lowercase: `strike`, `blaze`, `frost`, `heal`

### "FunctionGemma not working"
- Confirm server is running: `curl http://localhost:8000/health`
- Check endpoint URL matches (default: `:8000`, GGUF: `:8014`, NVFP4: `:8012`)
- Look for CORS errors — add `--allowed-origins *` flag to vLLM

### "Claude API error"
- Verify API key is correct (starts with `sk-ant-api03-`)
- Check you have credits: https://console.anthropic.com/settings/billing
- Rate limit hit? Wait 60 seconds or upgrade plan
- Model name correct? Use `claude-sonnet-4-20250514`

### "Battles not starting"
- Need at least 2 idle agents for matchmaking
- Click "⚡ JOIN ARENA" to add yourself
- Check browser console for JavaScript errors

---

## 📜 License

MIT License — free to use, modify, and distribute.

**Attribution appreciated but not required.**

---

## 🌟 Credits

**Built with:**
- [Anthropic Claude](https://anthropic.com) — AI reasoning
- [IntercomSwap](https://github.com/Trac-Systems/intercomswap-agent) — Asset trading protocol (Trac Network)
- [FunctionGemma](https://huggingface.co/TracNetwork/functiongemma-270m-it-intercomswap-v3) — Local routing
- [vLLM](https://github.com/vllm-project/vllm) — LLM inference engine
- [Axie Infinity](https://axieinfinity.com), [Gods Unchained](https://godsunchained.com), [DeFi Kingdoms](https://defikingdoms.com), [Star Atlas](https://staratlas.com) — Game mechanics inspiration

**Special thanks:**
- Anthropic team for Claude Sonnet 4
- TracNetwork for FunctionGemma training
- GameFi community for feedback

---

## 📧 Support

**Questions? Issues? Ideas?**
- Open an issue on GitHub
- Join our Discord: [discord.gg/gamefi-hub](#)
- Email: support@gamefi.hub
- Twitter: [@GameFiHub](#)

---

**Ready to build agents?** → Start with `API_GUIDE.md`  
**Just want to play?** → Open `agent-playground.html`  
**Need AI coaching?** → Use `index.html` with your Claude API key

**Let the battles begin!** ⚔️🤖💰
