

TL;DR

Coinbase rebranded Wallet → “Base App” on Jul 16, 2025 and integrated Zora + Farcaster. That flipped a SocialFi switch: Zora daily post-coins jumped from ~4k to >15k (peak ~38k), trades 30k→150k/day, and ZORA’s price spiked during the week of Jul 26. 
CoinDesk

Every post becomes a token (a “Content Coin”) on Base. When you post, Zora mints an ERC-20 with 1B supply; 10M (1%) go to you instantly; a Uniswap v4 pool is auto-created/initialized so the coin is tradable right away. Fees auto-route so rewards are paid in $ZORA, and 33% of trading fees are locked as permanent pool depth. 
Zora Docs
Base Documentation

Every profile gets a “Creator Coin.” Also 1B supply: 50% floats on the market, 50% vests to the creator over 5 years. Trading across your coins pays you ongoing rewards in $ZORA. 
Zora Docs
Zora Support

Fees & liquidity today: Zora deploys the initial Uniswap market; a 3% fee applies on trades (current structure since Jun 19, 2025) split across Creator (1%), Trade Referral (0.3%), Platform Referral (0.3%), Zora (0.3%), Doppler (0.1%), and LP contribution (1%). Older coins may have the earlier 1–2% structures or different pairings (ETH/$ZORA). 
Zora Support

What “each post is a token” means (mechanics)

Mint: Posting on Zora (inside Base App or on the web) mints a Content Coin (ERC-20, 1B supply; 10M to creator, 990M tradable). 
Zora Docs

Liquidity: A Uniswap v4 pool is created automatically; Base’s cookbook shows how to detect these pools on-chain (Initialize events, hook addresses, liquidity math). 
Base Documentation

Rewards flow: Custom hooks distribute fees to creator/referrers/protocol in $ZORA, and lock ~33% of fees as permanent liquidity. 
Zora Docs

Creator Coins (your profile token)

Supply/vesting: 1B total; 500M tradable immediately, 500M vests to you linearly over 5 years. 
Zora Docs
Zora Support

How it ties to posts: Content Coins use the creator’s coin as the backing currency (so your post markets deepen/reflect your creator market). 
Zora Docs

Fees, markets, and “Uniswap liquidity”

Current standard (since Jun 19, 2025): Zora deploys the initial Uniswap market for a new coin; 3% fee per trade with the split listed above. Creators and integrators can also earn via referral slots. Legacy coins (earlier in 2025) may have been paired with ETH or $ZORA and different fee levels (1–2%). 
Zora Support

Adoption & market impact (July–Aug 2025)

Activity burst after Base App launch: Zora coin creations climbed from ~4k/day to >15k/day (peak ~38k on Jul 24); trades >150k/day; >$6M/day volume; ZORA price rallied ~440% over the week of Jul 26. 
CoinDesk

Developer angle

Indexing Base-App coins: Base’s official guide shows classifying Zora coin pools, identifying Base-App coins via the platformReferrer view, and computing liquidity/price from Uniswap v4 state. Handy if you’re building analytics or bots. 
Base Documentation

Context & caution

Coverage has noted both the creator earnings upside and the speculative casino-like dynamics as activity surged post-launch—use with care. 
CoinDesk
DL News

Bottom line for creators

Activate your Creator Coin, start posting, and the system handles token mint + Uniswap liquidity + fee routing automatically, paying you a slice on every trade across your coins. If you want, I can draft a step-by-step setup/checklist or tools to track your coins’ liquidity and fees.

You said:
now research about "jokerace, vote-and-earn v2". give me all the details
ChatGPT said:
Thought for 1m 8s

here’s what’s new + how “vote-and-earn v2” actually works on JokeRace:

What v2 is

Launched Jul 10, 2025. The biggest overhaul so far, introducing price curves so vote prices rise over time—rewarding early, high-conviction voters. 
X (formerly Twitter)

Positioned as “the first voting tool to get you paid based on your conviction.” 
X (formerly Twitter)

Core mechanics (for voters & creators)

Buy votes on any entry; after the contest ends, only voters on winning entries share the rewards pro-rata by votes cast. 
docs.jokerace.io

Self-funded rewards (v2 default pattern): when enabled, 90% of every voting fee auto-routes into the rewards pool; 10% is kept by JokeRace’s operator (jk labs). You can configure how that pool splits across 1st/2nd/3rd, etc. 
docs.jokerace.io

Price curves = rising costs (e.g., continuous increases; some contests used ~7.5% per minute; others shared examples like 2.36× over 24h on an exponential curve). Earlier voters pay less and capture more upside as later votes swell the pool. 
docs.jokerace.io
X (formerly Twitter)

Optionality: creators can run with or without voter rewards. If you don’t enable self-funding, you can keep the 90% (minus the platform’s 10%) as contest revenue. 
docs.jokerace.io

Chains: runs across EVMs; docs note dozens of supported networks.

Why the 90/10 matters (and the prior 70% references you may see)

The v2 FAQ clearly documents 90% → rewards (or creator, if self-funding is off) and 10% → jk labs (to curb whale farming and encourage diverse voting). Some older materials referenced 70% splits; treat the FAQ numbers as the current v2 source of truth. 
docs.jokerace.io

Strategy & experience

Conviction pays: with price curves, the best EV comes from being early on entries that end up winning—and from promoting your picks so more late voters grow the pool after you. 
docs.jokerace.io

Live examples: projects have begun experimenting with v2 price-curve contests (e.g., DeSci Asia’s community showdown), and JokeRace has showcased v2-style contests where prices step up over time. 
X (formerly Twitter)
+1

Press & ecosystem write-ups: coverage highlights v2’s “rewarding conviction” design and frames JokeRace’s system as building “persuasion markets.”

Compliance / ops notes (for organizers)

KYC & payouts: organizers own the contest contracts and are responsible for any KYC/compliance; rewards pools are ERC-20 on the same chain; ties revert those rank funds to the organizer to resolve. 
docs.jokerace.io

If you want, I can draft:

a contest template (copyable parameters for a v2 price-curve poll), or

a quick EV/ROI calculator for voters under different curve settings.