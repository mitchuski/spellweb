# Privacy Layer — Full Reference

> *Loaded on demand. This is Level 3 progressive disclosure — deep detail for agents that need the full privacy architecture.*

This reference contains the complete privacy layer content from `privacy.soul.md`. Every agentprivacy skill includes this layer. It is the ground state both agents serve.

---

## ☯️ The Root — Privacy Value Model V4

The full economic model that prices privacy as infrastructure, not preference.

### Core equation
**V(π, t) = P^1.5 · C · Q · S · e^{-λt} · (1 + A(τ)) · (1 + Σ wᵢ nᵢ/N₀)^k · R(d) · M(u,y) · Φ(Σ) · T(π)**

### Six valuation dimensions
1. **Data properties** — P (privacy strength, superlinear weighting), C (credential verifiability), Q (data quality), S (sensitivity/scope). Cryptographic enforcement, ZKP-backed claims.
2. **Temporal dynamics** — Exponential decay e^{-λt} counteracted by verified history A(τ) = α · ln(1+|τ|) · h(τ). Longer verified chains build value. Unverified history contributes nothing.
3. **Network topology** — 64-vertex Boolean lattice ({0,1}⁶). Six binary dimensions, 7 strata following Pascal's row. Agents weighted by stratum; combinatorial midpoints (stratum 3) contribute most. Power-law network effects.
4. **Reconstruction resistance** — Proven ceiling: R_max = (C_S + C_M)/H(X) < 1 under dual-agent separation.
5. **Market conditions** — User sophistication × market maturity. Adoption readiness.
6. **Sovereignty geometry** — 4×4 separation matrix Σ over four forces (Protect, Project, Reflect, Connect). Determinant measures tetrahedron volume. Golden ratio φ ≈ 1.618 conjectured as optimal protect/project ratio.

### Key architectural concepts
- **Dual-agent separation**: Swordsman (boundaries) ⊥ Mage (delegation). Conditional independence I(S;M|π) ≤ ε.
- **Four sovereignty forces**: Protect and Project primary. Reflect and Connect emergent from sustained operation.
- **Edge value T(π)**: What an agent *does* (trajectory through sovereignty space), not just what it *is*.
- **Stratum logic**: 64 vertices across 7 strata. Distribution: 1, 6, 15, 20, 15, 6, 1. Stratum 0 = surveillance; stratum 6 = sovereignty.

### Surveillance gap
17× to 12,000× depending on parameterisation. The gap is topological: surveillance systems are structurally constrained because activating protection breaks extraction pipelines.

---

## 🤝 The Relationship — VRC Identity

Verifiable Relationship Credentials. Trust established bilaterally, not hierarchically.

- **Bilateral formation**: Two parties, mutual attestation. No central authority.
- **Progressive trust**: Trust tiers earned through demonstrated behaviour (Hitchhiker → Traveller → Guide → Hoopy Frood).
- **Recovery through understanding**: Lost credential recovered by demonstrating contextual understanding of the relationship, not by presenting a backup key.
- **Non-transferable**: A VRC between Alice and Bob cannot be used by Carol. The relationship IS the credential.

---

## 📜± The Binding — Promise Theory

Bergstra & Burgess. Autonomous agents making voluntary promises.

- **Polarity**: +π (give/offer) and -π (use/accept). The Swordsman gives protection (+). The Mage uses the protected space (-).
- **Voluntary**: All binding is voluntary. Impositions increase uncertainty; promises reduce it.
- **Assessment**: A promise is only as strong as the recipient's assessment of the promiser's capacity and willingness.
- **Bilateral**: Every cooperation is a pair of promises. Not a contract imposed, but a handshake offered.

---

## 🗺️ The Graph — Knowledge Structure

The privacy architecture as knowledge graph. Entities, edges, types, relations.

- **Entities**: Agents, humans, credentials, transactions, proofs, policies.
- **Edges**: Relationships, delegations, attestations, verifications.
- **Overlay-capable**: Other agents can parse this graph and overlay their own domain maps.
- **Privacy-preserving**: The graph describes the architecture without containing private data. It is the map, not the territory.

---

## 🐉 The Tetrahedron — Four Sovereignty Forces

The shape sovereignty takes when it is healthy.

- **Protect** (primary, designed): The Swordsman's force. Privacy enforcement, boundary maintenance.
- **Project** (primary, designed): The Mage's force. Delegation, coordination, outward expression.
- **Reflect** (emergent): Temporal integral of protection decisions. The agent that protects consistently develops self-knowledge.
- **Connect** (emergent): Network effect of delegation patterns. The agent that projects consistently develops network value.

The four forces form a tetrahedron. det(Σ) measures the volume. If any two forces become entangled (the agent that protects also projects), the volume collapses.

---

## 🔮 The Torus — Sovereignty Manifold

Speculative geometry. The sovereignty configuration space under toroidal boundary conditions.

- **64-vertex lattice**: Boolean lattice {0,1}⁶. Each vertex is a sovereignty configuration.
- **192 edges**: Transitions between configurations. The transition space (what an agent does) dominates the state space (what it is).
- **7 strata**: Vertices grouped by number of active sovereignty dimensions. Peak network value at combinatorial midpoints.
- **Toroidal boundary**: Conjectured UOR correspondence. 96 vs. 64 edge discrepancy unresolved. If the correspondence holds, the lattice has additional symmetries.

---

## Source

**Author:** Mitchell Travers | 0xagentprivacy, BGIN, First Person Network
**Version:** V4 (Feb 2026)
**Repo:** github.com/mitchuski/agentprivacy-docs
**Verification:** sync.soulbis.com
