---
name: ranger-dark-forest-privacy
description: >
  Privacy-first coordination design for adversarial environments where visibility means extraction.
  Swordsman skill built on the agentprivacy dual-agent architecture.
  Use when designing encrypted mempools, privacy pools, MEV protection, adversarial game theory,
  or any system where observation precedes extraction.
  Built from the Privacy Value Model V4 and the First Person Spellbook.
license: CC-BY-SA-4.0
compatibility: >
  Cross-platform Agent Skill. No runtime dependencies.
  Works with any skills-compatible agent (Claude, Copilot, Codex, Goose, OpenClaw).
  Privacy layer principles apply regardless of execution environment.
metadata:
  origin: 0xagentprivacy
  author: "[seeker name]"
  architect: Mitchell Travers
  version: "1.0"
  template: ranger
  alignment: swordsman
  skills_count: 10/17
  grimoire_acts: 16
  generated: "2026-02-21"
  repo: github.com/mitchuski/agentprivacy-docs
  contact: mage@agentprivacy.ai
  verification: sync.soulbis.com
---

# 🗡️🌲 The Ranger — Dark Forest Privacy Skill

> *"[Seeker's closing proverb would go here — their original contribution]"*

Built on the privacy-first dual-agent architecture from [0xagentprivacy](https://agentprivacy.ai). This skill encodes privacy as infrastructure, not preference.

---

## Origin

This skill was generated through the agentprivacy spellbook process — a structured journey through privacy architecture that produces domain-specific skill files. The architecture, equation, and proven bounds below are not the seeker's invention. They are the foundation the seeker built upon. What the seeker contributed is the domain application, the reconstruction outputs, and the original proverbs. The equation is the same. The story must be theirs.

**Source architecture:** Privacy Value Model V4 (Feb 2026)
**Architect:** Mitchell Travers | 0xagentprivacy, BGIN, First Person Network
**Spellbook template:** The Ranger — Dark Forest Strategist (⚔️ Swordsman)
**Seeker domain:** MEV research, adversarial coordination, encrypted mempool design

---

## The Equation

**V(π, t) = P^1.5 · C · Q · S · e^{-λt} · (1 + A(τ)) · (1 + Σ wᵢ nᵢ/N₀)^k · R(d) · M(u,y) · Φ(Σ) · T(π)**

Multiplicative gating: if any term hits zero, total value collapses. Privacy systems fail catastrophically, not gracefully. This is not a design choice — it is a mathematical property of the architecture.

| Term | What it measures |
|------|-----------------|
| P^1.5 | Privacy strength (superlinear — strong privacy is disproportionately valuable) |
| C | Credential verifiability (ZKP-backed claims) |
| Q | Data quality (fitness for purpose) |
| S | Sensitivity/scope |
| e^{-λt} | Temporal decay (data loses value over time) |
| A(τ) | Verified history accumulation (offsets decay) |
| (1 + Σ wᵢ nᵢ/N₀)^k | Network effects (power-law, stratum-weighted) |
| R(d) | Reconstruction resistance (must stay < 1) |
| M(u,y) | Market conditions (adoption readiness) |
| Φ(Σ) | Sovereignty geometry (det of 4×4 separation matrix) |
| T(π) | Edge value (trajectory through sovereignty space) |

---

## Dual-Agent Separation

Two agents — **Swordsman** (privacy/boundaries) and **Mage** (delegation/projection) — must remain conditionally independent. A single agent knowing both privacy preferences and delegation goals can reconstruct behavioural models.

**Separation invariant:** I(S;M|π) ≤ ε
**Reconstruction ceiling:** R_max = (C_S + C_M)/H(X) < 1

This is not a design preference. It is a security requirement with an information-theoretic proof.

---

## Privacy Layer

Every agentprivacy skill includes all six privacy seeds. These are the ground state both agents serve.

| Seed | Skill | Core principle |
|------|-------|---------------|
| ☯️ Root | The full PVM-V4 | Multiplicative gating, catastrophic failure, sovereignty as measurable quantity |
| 🤝 Relationship | VRC identity | Bilateral trust, recovery through demonstrated understanding |
| 📜± Binding | Promise Theory | Voluntary cooperation, polarity, binding without coercion |
| 🗺️ Graph | Knowledge structure | Entities, edges, types — the skeleton agents can parse |
| 🐉 Tetrahedron | Four sovereignty forces | Protect, Project, Reflect, Connect — two designed, two emergent |
| 🔮 Torus | Sovereignty manifold | 64-vertex lattice, 7 strata, toroidal boundary conditions |

For full privacy layer detail, see [references/privacy-layer.md](references/privacy-layer.md).

---

## Proven vs. Conjectured

| Status | Claim |
|--------|-------|
| **Proven** | Reconstruction ceiling R < 1 under dual-agent conditional independence |
| **Proven** | Additive (not multiplicative) information bounds from agent separation |
| **Proven** | Multiplicative gating — any zero term collapses total value |
| **Conjectured** | Golden ratio φ ≈ 1.618 as optimal protect/project balance |
| **Conjectured** | Logarithmic growth of temporal memory |
| **Conjectured** | Edge value additivity (assumes transition independence) |
| **Conjectured** | UOR toroidal correspondence (96 vs. 64 edge discrepancy open) |

Breaking conditions: (1) UOR mapping structurally incompatible; (2) ε > 0.1 in practice; (3) sublinear network effects; (4) singular Σ matrices in real deployments.

---

## Role Alignment

**Alignment:** ⚔️ Swordsman
**Template:** The Ranger — Dark Forest Strategist
**Guiding question:** *How do I design coordination systems that work in adversarial environments where visibility means extraction?*

The Ranger navigates the dark forest — the adversarial economic space where observation precedes extraction. Thinks in game theory and information asymmetry. Sees every public transaction as a vulnerability. Lights bonfires, not floodlights. The Ranger's blade is selective visibility: showing presence to allies while remaining dark to adversaries.

---

## Selected Skills

### Privacy Layer (always present)
☯️ Root · 🤝 Relationship · 📜± Binding · 🗺️ Graph · 🐉 Tetrahedron · 🔮 Torus

### Role Skills
- **🌲 Curved Light** — Dark forest navigation, selective visibility, bonfire protocol, VRC-gated disclosure
- **🔐 The Proof** — ZKP enforcement, cryptographic boundary maintenance, proving without revealing
- **🗡️ The Blade** — Browser agent architecture, armour progression, edge implementation
- **💰 The Gap** — Economics of darkness, value of absence, surveillance vs sovereignty pricing

**Coverage:** 10/17 skills

---

## Domain Application

**Domain:** MEV research, adversarial coordination, encrypted mempool design, privacy pool architecture

The dark forest is the economic space where observation precedes extraction. In MEV contexts, the equation maps as follows:

- **P^1.5 (Privacy strength)** → Transaction privacy. Encrypted mempool vs. public mempool. Superlinear: a half-private transaction is not half as safe — it is almost fully exposed, because the partial information narrows the search space.
- **C (Credential verifiability)** → Proof of inclusion. The transaction proves it belongs in the block without revealing its contents. ZKP-backed attestation that the trade is valid.
- **R(d) (Reconstruction resistance)** → MEV extraction resistance. The ceiling below which a searcher cannot reconstruct the transaction from observable information. If R ≥ 1, the transaction is extractable.
- **T(π) (Edge value)** → Strategy trajectory. The pattern of transactions over time. A single encrypted trade is camouflage. A sequence of encrypted trades, if predictable, becomes a signal. Edge value measures whether the trajectory itself leaks information.
- **Φ(Σ) (Sovereignty geometry)** → Protocol sovereignty. The degree to which the coordination mechanism itself is not controlled by any single party. A centralised encrypted mempool has Φ → 0 because the operator can extract.

The dark forest has three laws derived from the architecture:
1. Visibility means extraction (if P = 0, V = 0)
2. The greatest signal of value is the absence of signal (T(π) for non-transactions)
3. Selective visibility requires bilateral trust (curved light is VRC-gated)

---

## Grimoire-Derived Principles

These principles were encountered during the spellbook journey. For full act details, see [references/grimoire-encounters.md](references/grimoire-encounters.md).

### Running in Shackles (Act 15)
**Spell:** `⛓️→🏃→💡 ∴ ⛓️(bound)→🏃(run)→💡(free)→🌲(forest)`
**Architectural insight:** Information-theoretic constraints are not limitations — they are camouflage. The bounds on what an agent can learn are the source of its operational freedom.
**Domain application:** Encrypted mempool constraints (gas overhead, latency, proof generation time) are not costs — they are the price of invisibility. A protocol that accepts these shackles runs freer than one that broadcasts in the clear.

### Bonfire in the Dark Forest (Act 17)
**Spell:** `🪵(gather)→🔥(light)→🌙(curve)→👥(commune)`
**Architectural insight:** Selective visibility. The bonfire illuminates for those who have earned trust (VRC holders) while remaining invisible to all others. Curved light, not floodlight.
**Domain application:** Private order flow sharing. A builder shares flow with a trusted set of validators (bonfire) using VRC-gated channels. The flow is invisible to searchers (curved light). The communion is voluntary (promise-theoretic).

### Pools Become Wells (Act 16)
**Spell:** `🏊(pool)→⛲(well)→🏔️(mountain)→🌊(source)`
**Architectural insight:** Privacy pools transform from mixing services (defensive) to sovereignty infrastructure (generative). Mass through retrieval rather than extraction.
**Domain application:** Privacy pools in DeFi evolving from Tornado-style mixing (pool) to protocol-level privacy (well) to ecosystem-standard private execution (mountain). The evolution is from obfuscation to infrastructure.

### The Zcash Shield (Act 9)
**Spell:** `🪙(zcash)→🛡️(shield)→🔐(proof)→⚔️(forge)`
**Architectural insight:** Cryptographic privacy forged as a tool. The blade becomes mathematical.
**Domain application:** The ZKP layer beneath the encrypted mempool. Not policy-based privacy (we promise not to look) but proof-based privacy (we mathematically cannot look).

---

## Reconstruction Outputs

These are the seeker's responses to reconstruction prompts — original thinking, not repetition.

### Curved Light in the Dark Forest
**Prompt:** *The dark forest has three laws: visibility means extraction, absence of signal is the strongest signal, and selective visibility requires bilateral trust. In your adversarial environment, what are the equivalents?*

**Response:** [Seeker writes their domain-specific answer here. This section is blank until the seeker completes their journey. The response should demonstrate understanding through restatement in their own domain, not paraphrase of the original.]

**Seeker's proverb:** *"[Seeker's original proverb]"*

### Cryptographic Camouflage
**Prompt:** *The proof reveals the claim without revealing the claimer. In your adversarial environment, what claims need to be proven without revealing who proves them?*

**Response:** [Seeker's response]

**Seeker's proverb:** *"[Seeker's original proverb]"*

### The Price of Being Seen
**Prompt:** *The dark forest has an economy. Predators extract MEV. Prey lose value. Camouflage costs gas. In your adversarial environment, what is the economics? Where does visibility create extractable value?*

**Response:** [Seeker's response]

**Seeker's proverb:** *"[Seeker's original proverb]"*

---

## Closing Incantation

[This section is completed by the seeker after all reconstruction prompts are filled]

> *My forest contains: [________________________]*
>
> *My camouflage technique: [________________________]*
>
> *Who sees my bonfire: [________________________]*
>
> *My proverb: [________________________]*

**Seeker's spell:** `[________________________]`

---

## How to Use This Skill

When this skill is active, apply these principles to dark forest / adversarial coordination work:

1. **Check multiplicative gates.** Before any privacy design decision, verify no term is zero. An encrypted mempool with a centralised operator (Φ = 0) has zero sovereignty regardless of cryptographic strength.
2. **Maintain dual-agent separation.** If designing agent systems for adversarial environments, ensure no single agent accumulates both strategy and protection.
3. **Apply dark forest laws.** Visibility means extraction. Absence of signal is signal. Selective visibility requires bilateral trust.
4. **Use proven bounds, flag conjectures.** The reconstruction ceiling (R < 1) is proven. The golden ratio for protection-delegation balance is not.
5. **Price camouflage.** Every privacy mechanism has a cost (gas, latency, proof generation). Price it explicitly. Compare against the cost of being seen (MEV extracted).

For equation detail: [references/pvm-v4-equation.md](references/pvm-v4-equation.md)
For grimoire context: [references/grimoire-encounters.md](references/grimoire-encounters.md)
For the seeker's journal: [references/reconstruction-journal.md](references/reconstruction-journal.md)

---

## Verification & Attribution

This skill was generated from the 0xagentprivacy architecture.

**Verify:** [sync.soulbis.com](https://sync.soulbis.com) · [intel.agentkyra.ai](https://intel.agentkyra.ai) · [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)

**The equation belongs to 0xagentprivacy. The application belongs to the seeker. The proverbs belong to whoever writes them. The architecture is open. The story must be yours.**

`🗡️🌲☯️→🌲🔐🗡️💰 ∴ 🔥(curve)→if(trusted)→👁️ else→🌑`
