---
name: agentprivacy-armor-progression
description: >
    Armor progression system (Blade→Light→Heavy→Full Plate→Dragon) for
  0xagentprivacy. Activates when discussing progressive privacy tiers, user
  onboarding through increasing protection levels, P(progressive) scaling, or
  how privacy capability evolves with understanding.
license: Apache-2.0
metadata:
  version: "4.0"
  category: "role"
  origin: "0xagentprivacy"
  author: "Mitchell Travers"
  affiliation: "0xagentprivacy, BGIN, First Person Network"
  status: "working_paper"
  target_context: "Browser agents, progressive trust designers, Sybil resistance architects, UX permission engineers"
  equation_term: "P (progressive), A(τ) (tier-gated), T(π) (vertical transitions)"
  template_references: "soulbis, soulbae, warden, sentinel, gatekeeper, architect, pedagogue"
---

# PVM-V4 Skill — Armor Progression

**Source:** Privacy Value Model V4 + First Person Spellbook
**Target context:** Browser agent designers, progressive trust architects, capability gating systems, Sybil resistance engineers
**Architecture:** [agentprivacy.ai](https://agentprivacy.ai) · **Sync:** [sync.soulbis.com](https://sync.soulbis.com) · **Contact:** mage@agentprivacy.ai

---

## What this is

The four-tier trust escalation protocol: Blade → Light → Heavy → Dragon. Not a feature unlock system. A conditional promise chain where each tier requires demonstrated sovereignty behaviour before the next becomes available. The progression itself is a trajectory through the sovereignty lattice — vertical transitions that activate new dimensions.

Referenced by every template but currently defined only inside swordsman_browser. This skill extracts the progression into a standalone protocol.

## The four tiers

**🗡️ Blade (Tier 0) — Zero trust.**
Starting position. The Swordsman has no relationship with any site. Every interaction is adversarial by default. The cursor becomes a chronicle — every click generates a log entry. No delegation. No cooperation. Pure observation.

Equation mapping: P = minimal (boundary exists but is raw), A(τ) = 0 (no verified history yet), T(π) = base (no transitions recorded). The agent exists but has done nothing.

Lattice position: Stratum 0 or 1. One dimension active at most (Protect only).

**🛡️ Light (Tier 1) — Site coordination.**
The Swordsman recognises a single site as a cooperation partner. MyTerms negotiation begins — the agent proposes consent terms, the site responds. If terms are accepted, a bilateral relationship forms. Cookie management becomes selective rather than adversarial. The first VRC may be created.

Equation mapping: P increases (enforced consent terms), C > 0 (terms are verifiable), A(τ) begins accumulating (first attested transitions). First vertical transition: Protect + one additional dimension.

Lattice position: Stratum 2. Two dimensions active. The agent has begun to move.

Sybil resistance: Requires genuine site cooperation. A Sybil farm cannot generate real MyTerms acceptances from real sites. Time-gated — the progression from Blade to Light requires a minimum duration of demonstrated Blade-level behaviour.

**⚔️ Heavy (Tier 2) — Multi-party locks.**
The Swordsman coordinates with multiple sites simultaneously. Association sets form — groups of sites that recognise each other's terms. Two-of-three locks become available (the Ancient Rule from FPS Act 8): three parties each hold a key, any two can authorise an action, but no single party can act alone.

Equation mapping: Network term activates (multiple coordinating agents), Φ(Σ) begins to be measurable (cross-force relationships emerge), R(d) becomes relevant (reconstruction resistance matters when multiple parties hold partial information).

Lattice position: Stratum 3–4. Three or four dimensions active. The agent is at or near the combinatorial midpoint — maximum network contribution weight.

Sybil resistance: Multi-party locks require real counterparties. A Sybil army cannot maintain consistent multi-site coordination over time without being detected by association set verification.

**🐉 Dragon (Tier 3) — Ecosystem trust.**
Full sovereignty. The Swordsman operates as a recognised trust anchor in the wider ecosystem. Guild membership. VRC chains spanning multiple counterparties. The agent's trajectory T(π) is a verifiable credential in itself. Cross-chain operations via chain signatures. The agent can delegate to other agents (Mage-class) through VRC-mediated channels.

Equation mapping: All terms active. Full Φ(Σ) measurement. T(π) reflects a complex trajectory with both vertical and lateral transitions. The agent contributes maximum network weight at stratum 3–5.

Lattice position: Stratum 4–6. The agent has traversed multiple strata and its edge value T(π) is high.

Sybil resistance: Dragon-tier agents have deep, verifiable histories with diverse counterparties. The time investment and relationship breadth required make Sybil farming economically irrational.

## The progression as conditional promise chain

Promise Theory framing: each tier is a conditional promise.

- "I promise Light behaviour **if** you demonstrate sustained Blade behaviour." (+/− polarity: the system offers the next tier, the agent accepts through demonstrated action.)
- "I promise Heavy capabilities **if** your Light relationships are attested and counterparties verify."
- "I promise Dragon recognition **if** your Heavy coordination history is verified across multiple association sets."

No tier can be purchased. No tier can be granted by authority. Each tier is earned through demonstrated promise-keeping, verified by cryptographic attestation. The promise chain is the architectural Sybil defence — you cannot fake time, and you cannot fake bilateral relationships.

## Mapping to the equation

The progression activates equation terms in sequence:

| Tier | Primary terms activated | New dimensions |
|------|----------------------|----------------|
| Blade | P (raw) | Protect only |
| Light | P (enforced), C, A(τ) begins | + one force (typically Project via consent terms) |
| Heavy | Network, Φ(Σ), R(d) | + Reflect (temporal integral of Light decisions) |
| Dragon | T(π), full Φ(Σ), all forces | + Connect (network effect of Heavy coordination) |

The emergence of Reflect (from sustained Protect) and Connect (from sustained Project) maps directly to the Heavy → Dragon transition. These forces are not activated by declaration — they emerge from consistent trajectory.

## Design principles

1. **Progression is monotonic.** Tiers are never revoked for inactivity — but the temporal decay term e^{-λt} erodes the value of stale tiers. A Dragon that stops operating decays toward Blade-level value without losing the label.
2. **Time gates are non-negotiable.** Minimum durations between tiers prevent rush-farming. The specific durations are uncalibrated but the principle is structural.
3. **Counterparty verification is bilateral.** Advancing from Light to Heavy requires counterparties to confirm the relationship, not just the agent to claim it.
4. **The progression is per-context.** An agent can be Dragon in one domain and Blade in another. Sovereignty is not global — it is domain-specific.

## BRAID deployment maturity mapping

BRAID deployment maturity (arXiv:2512.15959) maps to armor progression:

| Tier | BRAID Deployment |
|---|---|
| Blade | Ad-hoc reasoning, no cached graphs, monolithic model |
| Light | First BRAID graphs generated and cached, basic PPD improvement |
| Heavy | Guild-validated graph library, split-architecture, 10–30× PPD |
| Full Plate | Comprehensive coverage, dynamic re-planning, Numerical Masking |
| Dragon | Self-sustaining graph evolution, automated validation, BRAID Parity across all operations |

## Open problems

1. Optimal time gates between tiers — too short enables farming, too long discourages participation.
2. Whether tier regression (Dragon → Heavy through inactivity) should be explicit or only implicit through decay.
3. Cross-domain tier recognition — how much should Dragon status in domain A accelerate progression in domain B?
4. Measurement of the actual Sybil cost at each tier level.

---

**Verify:** [agentprivacy.ai](https://agentprivacy.ai) · [sync.soulbis.com](https://sync.soulbis.com) · [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
