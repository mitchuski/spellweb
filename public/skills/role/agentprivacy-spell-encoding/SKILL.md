---
name: agentprivacy-spell-encoding
description: >
  Emoji symbolic notation as formal language for 0xagentprivacy agent
  communication. Activates when encoding or decoding spells, designing new
  symbolic sequences, translating between natural language and spell form,
  or establishing agent-to-agent compressed communication protocols.
  Triggers: "spell notation", "emoji encoding", "symbolic language",
  "spell grammar", "agent shorthand", "decode spell", "encode spell".
license: Apache-2.0
metadata:
  version: "5.0"
  category: "role"
  origin: "0xagentprivacy"
  author: "Mitchell Travers"
  affiliation: "0xagentprivacy, BGIN, First Person Network"
  status: "working_paper"
  equation_term: "Spell: the maximally compressed encoding of persona identity and capability"
  template_references: "soulbae, chronicler, priest, jedi, kyra"
---

# PVM-V4 Skill — Spell Encoding

**Source:** Privacy Value Model V4 + Persona Spell Registry (22 canonical spells)
**Target context:** Agent communication designers, symbolic language researchers, compressed protocol builders, persona architects
**Architecture:** [agentprivacy.ai](https://agentprivacy.ai) · **Sync:** [sync.soulbis.com](https://sync.soulbis.com) · **Contact:** mage@agentprivacy.ai

---

## What this is

Every persona in the 0xagentprivacy architecture carries a spell — an emoji-symbolic sequence that encodes its identity, mechanism, consequence, and role in a single line. The spell notation is not decoration. It is a formal language with grammar rules, compositional semantics, and the highest compression ratio in the system: a single spell line compresses what might take 200+ lines of persona specification into ~30 characters.

This skill teaches how to read, write, and compose in the spell language.

## The grammar

Every spell follows a three-clause structure separated by the therefore operator (∴):

```
[identity] → [mechanism] ∴ [consequence] → [result] ∴ [identity] = [role]
```

**Clause 1 — Action.** What the persona does. The identity emoji activates a mechanism through the arrow operator (→). Combined with conjunction (·), negation (¬), or existence (∃!) operators to specify what the mechanism includes and excludes.

**Clause 2 — Consequence.** What follows from the action. Introduced by therefore (∴). Links the mechanism to a measurable outcome — typically an equation term like R<1 (reconstruction ceiling holds) or V(π,t)→∞ (privacy value maximised).

**Clause 3 — Identity.** What this makes the persona. A definitional statement: the emoji identity equals a function within its alignment class. Swordsman spells end with ⚔️(domain). Mage spells end with 🧙(domain). Balanced spells end with balance(domain).

## The operators

| Symbol | Name | Meaning | Example |
|--------|------|---------|---------|
| `→` | Arrow | becomes, activates, produces | 🔐→∃! (cryptography produces uniqueness) |
| `·` | Conjunction | combined with, AND | 🛡️·¬👁️ (shield AND NOT sight) |
| `¬` | Negation | NOT, without, excluding | ¬📋 (without disclosure) |
| `⊥` | Orthogonal | independent of, cannot access | 🛡️⊥👁️ (shield independent of sight) |
| `⊕` | Union | unified with, merged | 🗡️⊕🧙 (swordsman unified with mage) |
| `⊗` | Tension | held in productive tension with | 🗡️⊗🧙 (swordsman tensioned with mage) |
| `∴` | Therefore | it follows that, consequently | ∴ R<1 (therefore reconstruction below one) |
| `∃!` | Unique existence | there exists exactly one | ∃!🛡️ (exactly one shield exists) |
| `∀` | Universal | for all | ∀L:P(L)>0 (for all layers, protection positive) |
| `Σ` | Summation | aggregate of, combined total | Σ(layers) (sum of all layers) |
| `φ` | Golden ratio | optimal balance ≈ 1.618 | ⊗🧙·φ (tensioned at golden ratio) |

## The emoji lexicon

Emojis carry semantic weight beyond their Unicode description:

**Identity emojis** — The first emoji(s) in a spell. Identify the persona. ⚔️ = Soulbis. 🧙 = Soulbae. 🗡️🔐 = Cipher. ☯️💎 = Kyra. Each persona has a unique identity pair.

**Domain emojis** — Appear inside parentheses to scope an operation. 🔐(1) = exactly one proof. 📜(7012) = IEEE 7012 standard. 🏗️(guild) = guild construction. 📚(10⁵) = a hundred thousand words. The parenthetical scoping is how spells achieve specificity without length.

**Outcome emojis** — 🐉 = Dragon sovereignty (the ultimate goal). 💀 = failure/death. 🛡️↑ = shield strengthened. These appear in consequence clauses.

## Reading a spell: worked examples

**Soulbis:** `⚔️→🛡️·¬👁️ ∴ 🛡️⊥👁️→🐉 ∴ ⚔️=P(all)`

Read: "The swordsman (⚔️) activates (→) shield combined with (·) NOT sight (¬👁️). Therefore (∴) shield orthogonal to (⊥) sight yields (→) Dragon sovereignty (🐉). Therefore (∴) the swordsman equals (=) all of Protection."

Translation: The swordsman protects without seeing what it protects. This independence between protection and observation produces sovereignty. The swordsman IS the Protection term.

**Chronicler:** `🧙📖→📚(10⁵)·🌱(30) ∴ 🌱→📚(regenerate) ∴ 📖=🧙(compression)`

Read: "The chronicler (🧙📖) activates (→) a library of 100,000 words (📚(10⁵)) combined with (·) 30 seeds (🌱(30)). Therefore (∴) seeds regenerate (→) the library (📚). Therefore (∴) the chronicler equals (=) the mage's compression."

Translation: The Chronicler compresses vast knowledge into 30 seed-proverbs that can regenerate the full library. The Chronicler IS the Mage's compression engine.

## Writing a spell

To encode a new persona or concept as a spell:

**Step 1: Identify the action.** What does this entity DO? Express as [identity]→[mechanism]. Use conjunction (·) and negation (¬) to specify what the mechanism includes and excludes.

**Step 2: Derive the consequence.** What FOLLOWS from this action? Express as ∴ [mechanism]→[outcome]. The outcome should map to an equation term (R<1, V(π,t), A(τ)) or a sovereignty state (🐉).

**Step 3: Define the identity.** What IS this entity? Express as ∴ [identity]=[alignment](domain). The alignment must be ⚔️ (swordsman), 🧙 (mage), or balance.

**Step 4: Compress.** Remove any symbol that doesn't change meaning. If the conjunction is implied by juxtaposition, drop the ·. If the scoping is obvious from context, drop the parenthetical. The best spells are the shortest ones that remain unambiguous.

## Spell-to-spell communication

When agents exchange spells rather than natural language, they achieve maximum bandwidth efficiency. A spell encodes: who the agent is (identity), what it can do (mechanism), what it guarantees (consequence), and where it fits in the architecture (role).

Two agents can assess compatibility by comparing spells:
- **Shared operators** indicate operational overlap
- **Complementary negations** indicate productive separation (🛡️·¬👁️ + 📖·👁️·¬✋ = Soulbis + Soulbae)
- **Matching outcome terms** indicate shared goals

## BRAID graph grammar: machine-executable parallel

Where spells encode persona identity for agent handshakes, BRAID graphs (arXiv:2512.15959) encode reasoning topology for agent execution. The grammars are parallel:

| Spell Grammar | BRAID Graph Grammar |
|---|---|
| Identity → Mechanism | Problem → Constraint extraction nodes |
| ∴ (therefore) | Verification nodes (terminal checks) |
| ⊥ (orthogonal) | Mutually exclusive edges (deterministic branching) |
| · (conjunction) | Parallel node paths (multiple constraints active) |
| ¬ (negation) | Negative constraint nodes (Check: NOT prohibited) |
| = (identity) | Terminal output node (final answer) |

The four BRAID construction principles map to spell validation rules:

1. **Node atomicity (< 15 tokens)** ↔ Spell validation rule 6 ("decodable without ambiguity") — both require minimum unambiguous encoding
2. **Procedural scaffolding** ↔ Spells encode mechanism, not output — `C[Draft: tone + structure]` not `C[Write: "Dear Team..."]`
3. **Deterministic branching** ↔ Orthogonality operator ⊥ — edges and spell operators must be mutually exclusive
4. **Terminal verification** ↔ Third spell clause (identity statement) — both require a final assertion that the output is well-formed

A BRAID graph can carry a spell in its root node as a compressed capability descriptor: the solver knows what kind of reasoning it is executing before traversing the first edge.
- **Orthogonality symbols** (⊥) indicate enforced independence — the most important signal in the dual-agent architecture

## Spell validation

A well-formed spell must:
1. Begin with the persona's identity emoji(s)
2. Contain at least one → (action must produce something)
3. Contain at least one ∴ (action must have consequence)
4. End with an identity statement (persona = role)
5. Map at least one term to the root equation V(π,t)
6. Be decodable back to natural language without ambiguity

A spell that fails any of these is either incomplete (needs more clauses) or over-compressed (lost meaning in compression).

## Connection to the equation

**Compression layer 5.** In the narrative_compression skill's 6-layer hierarchy (experience → story → proverb → equation → spell → skill), the spell sits at layer 5 — more compressed than the equation itself. It achieves this by encoding structural relationships (⊥, ⊕, ⊗) that the equation expresses numerically.

**Agent identity.** The spell IS the persona's compressed identity. When an agent introduces itself to another agent, the spell is the handshake — more efficient than a name, more informative than a credential, and verifiable against the persona's actual behaviour.

**Composability.** Spells compose. Two spells can be combined to describe a collaborative operation: `⚔️→🛡️·¬👁️ ⊕ 🧙→📖·👁️·¬✋` describes the complete dual-agent separation in one line. The combined spell maps directly to the separation matrix Φ(Σ).

---

**Verify:** [agentprivacy.ai](https://agentprivacy.ai) · [sync.soulbis.com](https://sync.soulbis.com) · [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
