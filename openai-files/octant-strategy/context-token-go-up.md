A “price-only-up” token that stays simple

Name idea: Handle Pass (per topic handle).
Standard: ERC-1155 (one token ID per handle) or a very plain ERC-20 per handle.
Payment: USDC only (no oracles, no AMMs).
Transfers: Optional but I recommend non-transferable except through the built-in sell queue to prevent off-chain dumps.

Core mechanic: High-Water Staircase + FIFO sell queue

Price is a function of the historical high-water mark (HWM) supply, not the current supply. That means the displayed mint price never decreases even if people redeem.

Example (linear, super simple math):

Base price P₀ = 10 USDC

Step = +1 USDC every N = 100 new mints

price(HWM) = P₀ + step * floor(HWM / N)

You can also do a gentle exponential schedule, but linear keeps audits light.

Buying:

If there are sellers in the queue, a buy first fills the sell queue at the current price (no discount), paying sellers FIFO.

Only after the queue is empty do we mint new tokens at the current price; when the mint crosses a tranche boundary (every 100th mint in the example), the mint price steps up by +1 USDC.

Selling (“waitlist”):

A holder deposits tokens into escrow and is placed in a FIFO sell queue at the current price (optionally they can set a minimum acceptable price ≤ current).

The sale executes automatically when enough inbound buy volume arrives to clear their queued amount.

They can cancel and exit the queue any time (tokens returned).

Why this fits your stack: all proceeds are routed to your handle-level/community pools with per-handle dashboards (Micro-P&L, OKRs, payouts). That’s already in your plan and is the clearest “anti-rug” story (funds to public budgets, visible on-chain), not a dev-controlled treasury.

What “only up or flat” really means here

The displayed mint price never goes down because it’s pinned to HWM supply, not current circulating supply.

Secondary sales never undercut the displayed price; they’re filled from the queue at the displayed price.

If demand stalls, price stays flat and the queue grows (illiquidity risk is explicit rather than hidden).

Split of incoming USDC (keep it boring)

90–95% → the handle’s sponsored/community pools (your transparent budgets).

0–5% → (optional) “exit buffer” pot that can auto-buy from the queue at a drip rate if things stall. (You can skip this for v1 to keep code minimal.)

5% → ops (Coach/Steward stipends etc.).
All of these can show up in the handle dashboards you described.

Contract sketch (audit-lite)

Libraries: OpenZeppelin ERC-1155 (or ERC-20), SafeERC20, ReentrancyGuard.

State: hwmSupply, trancheSize, basePrice, step, sellQueue (FIFO ring buffer), escrowBalances.

Buy() flow: fill queue → if empty, mint → update HWM → recalc price.

Sell() flow: move tokens to escrow, enqueue an order; Cancel() returns escrowed tokens.

Math: integers only; price in USDC’s 6 decimals; no oracles; no AMM; no rebasing.

UX copy (avoid “investment vibes”)

Call it a supporter pass for a DAO-owned handle. Rights: voting boosts, access to behind-the-scenes calls, name credits, and no promise of profit. Your doc already sets a great tone—community budgets, DAO ownership of handles, and transparent payouts—so keep the token framed as access & governance, not yield.

Why this isn’t a “rug & pull” magnet

No dev-controlled pool: revenue routes by rule to public budgets per handle.

No trust in market makers: We don’t touch AMMs; price discovery is a simple, deterministic schedule.

No “bank run” spiral: sellers can’t push the price down; they simply wait in a transparent queue.

Trade-offs (be explicit)

Liquidity risk: if buy demand slows, sellers wait. That’s intentional. You can mitigate with the (optional) exit buffer or periodic sponsor buybacks.

Speculative pressure: “only up” narrative can attract flippers. Add per-wallet caps and cooldowns (e.g., 7-day hold before queueing).

Side markets: to keep “only-up” intact, either make tokens non-transferable or restrict transfers to the sell-queue contract.

Is this naive or unoriginal?

Variants of bonding curves and tranche sales exist, but the HWM-based, queue-matched resale is a pragmatic twist: it removes reserve-math risk, keeps math trivial, and aligns with your DAO-owned handle architecture. It’s not “brand-new theory,” but it is original enough in how it’s constrained for safety and simplicity—and perfect for supporter/donor psychology (not traders).

What you might be missing is mostly guardrails (caps, cooldowns, non-transferability) and plain-English disclaimers: this is a supporter pass, not an investment; sales are matched to future demand; you may wait.

TL;DR spec you can hand to an engineer

Price: P = P0 + step * floor(HWM / N) (e.g., P0=10 USDC, step=+1 USDC, N=100).

Buy: fill FIFO sell queue at P; if empty → mint at P; update HWM and P as tranches are crossed.

Sell: escrow tokens → FIFO queue at P → paid out by future buys; cancel anytime.

Funds routing: 90–95% to handle/community pools; 5% ops; optional 0–5% exit buffer.

Protections: non-transferable (queue-only exits), per-wallet caps, 7-day cooldown, reentrancy guard, integers only.

Narrative fit: DAO-owned handles, public dashboards, gasless UX, Google login—exactly as in your plan.

If you want, I can turn this into a one-pager spec or a minimal interface (buy, sell, cancel) next.