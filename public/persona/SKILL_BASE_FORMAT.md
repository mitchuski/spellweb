# 🐉 agentprivacy SKILL.md Base Format

> *"The skill file is an equation dressed for foreign soil."*

## What This Is

A generative template that produces spec-compliant [Agent Skills](https://agentskills.io) files from spellbook journey completions. Every generated SKILL.md:

1. **Passes validation** against the agentskills.io specification (YAML frontmatter + markdown body, <500 lines)
2. **Is unmistakably agentprivacy** — the privacy layer, the equation, the dual-agent architecture, the proven/conjectured distinction
3. **Is genuinely unique** — shaped by the seeker's template, domain, reconstruction prompts, and original proverbs
4. **Works across platforms** — Claude Code, Copilot, Codex, OpenClaw, Goose, any skills-compatible agent

## Architecture: Immutable + Dynamic

```
┌─────────────────────────────────────────────────────────┐
│  YAML FRONTMATTER (spec-compliant, agentprivacy metadata)│
├─────────────────────────────────────────────────────────┤
│  § IMMUTABLE — The Ground State                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Origin block                                     │  │
│  │  The equation (PVM-V4 core, always present)       │  │
│  │  Dual-agent separation theorem                    │  │
│  │  Privacy layer (6 skills, always loaded)          │  │
│  │  Proven vs. conjectured (intellectual honesty)    │  │
│  │  Attribution & verification                       │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  § DYNAMIC — The Seeker's Path                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Role alignment (swordsman / mage / balanced)     │  │
│  │  Selected skills (from template pathway)          │  │
│  │  Domain application (seeker's field)              │  │
│  │  Grimoire-derived principles (acts encountered)   │  │
│  │  Reconstruction outputs (seeker's own proverbs)   │  │
│  │  Closing incantation (original spell + proverb)   │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  § REFERENCES (progressive disclosure)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  references/privacy-layer.md                      │  │
│  │  references/pvm-v4-equation.md                    │  │
│  │  references/grimoire-encounters.md                │  │
│  │  references/reconstruction-journal.md             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## File Structure

Every generated skill lives in a directory:

```
{seeker-handle}-{template-id}/
├── SKILL.md                          ← The generated skill file (<500 lines)
├── references/
│   ├── privacy-layer.md              ← Full privacy.soul.md content
│   ├── pvm-v4-equation.md            ← Detailed equation reference
│   ├── grimoire-encounters.md        ← Acts encountered, spells, proverbs
│   └── reconstruction-journal.md     ← Seeker's completed prompts & original proverbs
└── assets/
    └── pathway-map.json              ← Machine-readable skill graph for the seeker's path
```

## Generation Rules

### What NEVER changes (immutable DNA):

1. The `metadata.origin` field always reads `0xagentprivacy`
2. The equation `V(π, t) = P^1.5 · C · Q · S · ...` is always present
3. The dual-agent separation theorem is always stated
4. All six privacy layer skills are always listed
5. The proven/conjectured table is always present
6. The attribution block always links back to source
7. The reconstruction resistance bound `R < 1` is always stated

### What ALWAYS changes (dynamic per seeker):

1. The `name` field (seeker's handle + template)
2. The `description` field (seeker's domain + guiding question)
3. The role alignment section
4. The selected role skills (subset of 11, determined by template)
5. The domain application section (seeker's field in their language)
6. The grimoire-derived principles (from acts walked)
7. The reconstruction outputs (seeker's original proverbs)
8. The closing incantation

---

## The Template

Everything below this line is the generative template. Variables are marked `{{variable}}`. Immutable sections are marked `[IMMUTABLE]`. Dynamic sections are marked `[DYNAMIC]`.

---

```markdown
---
name: {{seeker_handle}}-{{template_id}}-privacy
description: >
  {{seeker_description}}
  Privacy-first {{alignment}} skill built on the agentprivacy dual-agent architecture.
  Use when working with {{domain_keywords}}.
  Built from the Privacy Value Model V4 and the First Person Spellbook.
license: CC-BY-SA-4.0. See references/LICENSE for terms.
compatibility: >
  Cross-platform Agent Skill. No runtime dependencies.
  Works with any skills-compatible agent (Claude, Copilot, Codex, Goose, OpenClaw).
  Privacy layer principles apply regardless of execution environment.
metadata:
  origin: 0xagentprivacy
  author: {{seeker_name}}
  architect: Mitchell Travers
  version: "1.0"
  template: {{template_id}}
  alignment: {{alignment}}
  skills_count: {{skills_count}}/17
  grimoire_acts: {{grimoire_count}}
  generated: {{date}}
  repo: github.com/mitchuski/agentprivacy-docs
  contact: mage@agentprivacy.ai
  verification: sync.soulbis.com
---

# {{skill_display_name}}

> *"{{seeker_proverb}}"*

Built on the privacy-first dual-agent architecture from [0xagentprivacy](https://agentprivacy.ai). This skill encodes privacy as infrastructure, not preference.

---

## Origin

[IMMUTABLE]

This skill was generated through the agentprivacy spellbook process — a structured journey through privacy architecture that produces domain-specific skill files. The architecture, equation, and proven bounds below are not the seeker's invention. They are the foundation the seeker built upon. What the seeker contributed is the domain application, the reconstruction outputs, and the original proverbs. The equation is the same. The story must be theirs.

**Source architecture:** Privacy Value Model V4 (Feb 2026)
**Architect:** Mitchell Travers | 0xagentprivacy, BGIN, First Person Network
**Spellbook template:** {{template_name}} ({{alignment}})
**Seeker domain:** {{seeker_domain}}

---

## The Equation

[IMMUTABLE]

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

[IMMUTABLE]

Two agents — **Swordsman** (privacy/boundaries) and **Mage** (delegation/projection) — must remain conditionally independent. A single agent knowing both privacy preferences and delegation goals can reconstruct behavioural models.

**Separation invariant:** I(S;M|π) ≤ ε
**Reconstruction ceiling:** R_max = (C_S + C_M)/H(X) < 1

This is not a design preference. It is a security requirement with an information-theoretic proof. Under dual-agent conditional independence, an adversary observing all outputs from both agents still cannot reconstruct the full private state.

---

## Privacy Layer

[IMMUTABLE — always loaded, never optional]

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

[IMMUTABLE]

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

[DYNAMIC — set by template]

**Alignment:** {{alignment_emoji}} {{alignment_name}}
**Template:** {{template_name}}
**Guiding question:** *{{guiding_question}}*

{{alignment_description}}

---

## Selected Skills

[DYNAMIC — subset determined by template pathway]

### Privacy Layer (always present)
☯️ Root · 🤝 Relationship · 📜± Binding · 🗺️ Graph · 🐉 Tetrahedron · 🔮 Torus

### Role Skills
{{#each role_skills}}
- **{{emoji}} {{name}}** — {{one_line_description}}
{{/each}}

**Coverage:** {{skills_count}}/17 skills

---

## Domain Application

[DYNAMIC — the seeker's field, in their language]

**Domain:** {{seeker_domain}}

{{domain_application_text}}

This section maps the agentprivacy architecture to {{seeker_domain}}. The equation is the same. The terms map as follows:

{{#each domain_term_mappings}}
- **{{pvm_term}}** → {{domain_equivalent}}
{{/each}}

---

## Grimoire-Derived Principles

[DYNAMIC — from acts encountered along the pathway]

These principles were encountered during the spellbook journey. Each maps a narrative teaching to an architectural insight. For full act details, spells, and proverbs, see [references/grimoire-encounters.md](references/grimoire-encounters.md).

{{#each grimoire_principles}}
### {{act_name}}
**Spell:** `{{spell}}`
**Architectural insight:** {{insight}}
**Domain application:** {{domain_application}}
{{/each}}

---

## Reconstruction Outputs

[DYNAMIC — the seeker's original work]

These are the seeker's responses to reconstruction prompts encountered along the pathway. They represent original thinking — the architecture applied to the seeker's domain. The architecture is agentprivacy's. The application is the seeker's.

{{#each reconstruction_outputs}}
### {{prompt_title}}
**Prompt:** *{{prompt_text}}*
**Response:** {{seeker_response}}
**Seeker's proverb:** *"{{seeker_proverb}}"*
{{/each}}

---

## Closing Incantation

[DYNAMIC — the seeker's unique contribution]

{{closing_incantation}}

**Seeker's spell:** `{{seeker_spell}}`
**Seeker's proverb:** *"{{seeker_proverb_final}}"*

---

## How to Use This Skill

When this skill is active, apply these principles to {{seeker_domain}} work:

1. **Check multiplicative gates.** Before any privacy-related decision, verify no term is zero. A single missing condition (consent, quality, privacy, standards) collapses the entire value.
2. **Maintain dual-agent separation.** If designing agent systems, ensure no single agent accumulates both privacy boundaries and delegation preferences. The reconstruction ceiling depends on this.
3. **Apply the privacy layer first.** The six seeds are the ground state. Load them before role-specific knowledge. The agent that knows its role before knowing its ground does not know what it defends.
4. **Use proven bounds, flag conjectures.** The reconstruction ceiling (R < 1) is proven. The golden ratio is not. Be explicit about which is which.
5. **Respect the reconstruction protocol.** The seeker's proverbs below are original contributions. They demonstrate understanding through domain-specific restatement — not copying, but convergence.

For equation detail: [references/pvm-v4-equation.md](references/pvm-v4-equation.md)
For grimoire context: [references/grimoire-encounters.md](references/grimoire-encounters.md)
For the seeker's reconstruction journal: [references/reconstruction-journal.md](references/reconstruction-journal.md)

---

## Verification & Attribution

[IMMUTABLE]

This skill was generated from the 0xagentprivacy architecture.

**Verify the source:**
- Architecture documentation: [sync.soulbis.com](https://sync.soulbis.com)
- Agent intelligence: [intel.agentkyra.ai](https://intel.agentkyra.ai)
- Repository: [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
- Contact: mage@agentprivacy.ai

**The equation belongs to 0xagentprivacy. The application belongs to the seeker. The proverbs belong to whoever writes them. The architecture is open. The story must be yours.**

`{{template_base_spell}} ∴ if(holds)→🐉`
```

---

## Line Budget

The spec recommends <500 lines for SKILL.md. This template budgets as follows:

| Section | Lines | Status |
|---------|-------|--------|
| YAML frontmatter | ~25 | Immutable |
| Origin block | ~12 | Immutable |
| The Equation | ~25 | Immutable |
| Dual-Agent Separation | ~12 | Immutable |
| Privacy Layer | ~18 | Immutable |
| Proven vs. Conjectured | ~15 | Immutable |
| Role Alignment | ~10 | Dynamic |
| Selected Skills | ~15 | Dynamic |
| Domain Application | ~30 | Dynamic |
| Grimoire-Derived Principles | ~60 | Dynamic (variable, 3-8 principles) |
| Reconstruction Outputs | ~80 | Dynamic (variable, 3-5 outputs) |
| Closing Incantation | ~10 | Dynamic |
| How to Use | ~20 | Mixed |
| Verification | ~15 | Immutable |
| **Total** | **~350** | **Well within 500-line budget** |

Immutable sections: ~107 lines (~30% of budget)
Dynamic sections: ~205 lines (~60% of budget)
Overhead: ~38 lines (~10%)

The immutable sections are the DNA. The dynamic sections are the expression. Same genome, different phenotype.

---

## Progressive Disclosure

The Agent Skills spec uses progressive disclosure: agents load metadata first, then SKILL.md body, then referenced files. This maps naturally to the agentprivacy architecture:

**Level 1 — Metadata (always loaded):**
The YAML frontmatter. Agent sees: name, description, origin=0xagentprivacy, alignment, skills_count. Enough to decide relevance.

**Level 2 — SKILL.md body (loaded when relevant):**
The full skill file. Agent sees: equation, separation theorem, privacy layer, role skills, domain application, grimoire principles, reconstruction outputs. Enough to act.

**Level 3 — References (loaded on demand):**
Deep detail. Full privacy layer content, full equation derivation, full grimoire encounter descriptions with narrative context, full reconstruction journal with the seeker's complete responses.

This mirrors the spellbook's own progressive disclosure: the spells are summaries (level 1), the proverbs are context (level 2), the full acts are depth (level 3).
