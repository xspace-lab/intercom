# 🎮 GameFi Hub

**AI Gaming Companion • Play-to-Earn Tracker • IntercomSwap Asset Trading**

GameFi Hub is your intelligent companion for the Play-to-Earn ecosystem. Track earnings across multiple blockchain games, optimize strategies with AI, and trade in-game assets seamlessly through IntercomSwap — with ultra-fast swap routing via FunctionGemma.

## 🌟 Features

- **Multi-Game P2E Tracker** — Axie Infinity, Gods Unchained, Decentraland, and more
- **AI Strategy Coach** — Personalized tips to maximize daily earnings
- **IntercomSwap Asset Marketplace** — Trade NFTs and tokens from any game
- **FunctionGemma Routing** — Ultra-fast local model for swap decisions
- **Real-Time Market Intelligence** — Token prices, demand trends, tournament timing
- **Gas Optimization** — Smart network routing to minimize fees
- **Player Profile Dashboard** — XP, levels, streak tracking, earnings history
- **Game Discovery** — AI recommends new P2E games based on your play style

## 🔗 Framework Integration

### Intercom
Powers the conversational AI layer:
- Natural language interface for all gaming questions
- Context-aware responses using full player profile
- Strategy analysis and earnings optimization
- Game discovery and onboarding guidance

### IntercomSwap
Powers the asset trading layer:
- In-game NFT swaps across all supported games
- Token exchanges (SLP, GODS, MANA, AXS...)
- Best-route discovery for minimum fees
- Listing and listing management
- Confirmation flows before execution

### FunctionGemma (`TracNetwork/functiongemma-270m-it-intercomswap-v3`)
Powers ultra-fast swap routing:
- Detects swap intent from natural language
- Routes to local model for near-instant tool calls
- Falls back to Claude if local server unavailable
- Magnitudes faster than cloud API for trade decisions
- HuggingFace: https://huggingface.co/TracNetwork/functiongemma-270m-it-intercomswap-v3

## 📦 Files

| File | Purpose |
|------|---------|
| `interactive-demo.html` | Works immediately, no API key needed |
| `index.html` | Full AI integration (Claude + FunctionGemma) |
| `README.md` | This file |
| `SKILL.md` | AI agent behavior instructions |

## 🚀 Quick Start

### Demo Mode (instant)
Open `interactive-demo.html` in any browser. No setup required.

### Full AI Mode
1. Get API key from https://console.anthropic.com
2. Open `index.html`, replace `YOUR_API_KEY_HERE`
3. (Optional) Start FunctionGemma server for swap routing:
```bash
# GGUF — best for everyday devices
llama-server \
  -m ./gguf/functiongemma-v3-q8_0.gguf \
  --host 0.0.0.0 --port 8000 \
  --ctx-size 8192 --gpu-layers 12

# Then set USE_FUNCTIONGEMMA = true in index.html
```

## 💬 Example Conversations

**Earnings Tracking:**
- "Show my earnings report this week"
- "How much SLP did I earn today?"
- "Compare my earnings across all games"

**Strategy:**
- "Best strategies to earn more in Axie right now"
- "Should I play arena or adventure mode today?"
- "When is the best time to sell my SLP?"

**Asset Trading (IntercomSwap):**
- "Trade my Dragon Sword NFT"
- "What's the best route to swap my Axie for USDC?"
- "List my Phoenix Shield on the marketplace"
- "Get me a quote for Land Plot #4721"

**Market Intelligence:**
- "Is GODS token a good hold right now?"
- "What games are trending this week?"
- "Any upcoming tournaments I should enter?"

**FunctionGemma (swap commands — ultra-fast):**
- "Swap 10 SLP to USDC"
- "Execute trade on Dragon Sword"
- "Set autopost for daily SLP conversion"

## 🎮 Supported Games

| Game | Token | Network | Trading |
|------|-------|---------|---------|
| Axie Infinity | SLP, AXS | Ronin (free) | ✅ |
| Gods Unchained | GODS | Immutable X (free) | ✅ |
| Decentraland | MANA, LAND | Ethereum/Polygon | ✅ |
| Pixels | PIXEL | Polygon | ✅ |
| Illuvium | ILV | Ethereum | ✅ |
| Star Atlas | ATLAS | Solana | ✅ |

## 🔄 IntercomSwap Asset Trading Flow

```
Player: "Trade my Dragon Sword"
    ↓
FunctionGemma detects swap intent (local, instant)
    ↓
IntercomSwap finds best route:
  Dragon Sword NFT → ETH → USDC
    ↓
Preview shown: amount, fees, gas, net receive
    ↓
Player confirms → Trade executes
    ↓
Funds arrive in wallet
```

## ⚡ FunctionGemma Integration

GameFi Hub uses the fine-tuned FunctionGemma model for swap routing:

**Why FunctionGemma?**
- 270M parameter model runs locally on your device
- Magnitudes faster than cloud API for simple swap decisions
- OpenAI-compatible tool calling API
- Three flavours: Base, NVFP4 (Nvidia), GGUF (everyday devices)

**Startup Commands:**
```bash
# Base (vLLM)
python -m vllm.entrypoints.openai.api_server \
  --model TracNetwork/functiongemma-270m-it-intercomswap-v3 \
  --port 8000 --dtype auto --max-model-len 8192

# NVFP4 — fastest (Nvidia/Rockwell)
trtllm-serve serve ./nvfp4 \
  --backend pytorch --port 8012 \
  --max_batch_size 8 --max_num_tokens 16384

# GGUF — everyday devices
llama-server \
  -m ./gguf/functiongemma-v3-q8_0.gguf \
  --port 8014 --ctx-size 8192 --gpu-layers 12
```

**Pull latest from upstream:**
```bash
git fetch upstream && git merge upstream/main
```

## 🏆 Player Dashboard

- **Level & XP** — Progress bar toward next level
- **Rank** — Bronze, Silver, Gold, Diamond, Champion
- **Earnings** — Today, this week, all-time
- **Wins** — Across all games
- **Streak** — Daily login and play streak
- **Portfolio** — All owned NFTs and tokens with current values

## 🛡️ Safety & Security

- Never store private keys in the app
- All trades require explicit confirmation
- FunctionGemma output validated before execution
- Slippage protection on all IntercomSwap trades
- Rate limiting prevents accidental double-trades

## 🌱 Roadmap

- Mobile app (iOS/Android)
- Portfolio performance charts
- Automated earning strategies (with user approval)
- Cross-game tournament tracking
- Social features — compare earnings with friends
- Voice commands via FunctionGemma
- Hardware wallet support
- Tax reporting exports

## 📝 Competition Entry

**Trac Address**: `[trac1krxpwpfrtkwv8rz8u39f6gxwd6ccpl48vnpq44gg8lkfhk5mmp0qhhzjjp]`

Built for the Intercom + IntercomSwap competition on Trac Systems. GameFi Hub demonstrates:
- ✅ Dual Intercom + IntercomSwap integration
- ✅ FunctionGemma model for swap routing
- ✅ Real-world GameFi utility
- ✅ Player-first UX with AI companion
- ✅ Clear agent instructions (SKILL.md)

## 📄 License
MIT — fork freely and build on top!

## 🔗 Links
- [Intercom](https://github.com/Trac-Systems/intercom)
- [IntercomSwap](https://github.com/TracSystems/intercom-swap)
- [FunctionGemma Model](https://huggingface.co/TracNetwork/functiongemma-270m-it-intercomswap-v3)

---
*Built with 🎮 for the GameFi community using Claude AI, Intercom, and IntercomSwap*
