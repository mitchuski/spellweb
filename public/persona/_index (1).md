# 🎭 Spellbook Templates — Master Index

> *"Twelve doors into the same room. The privacy layer is the floor. The role is the window you look through. The spells are what you see."*

## How Templates Work

Every template is a pre-configured pathway through the talent tree. Each one includes:

1. **The Privacy Layer** — `privacy.soul.md` — always loaded first, always complete, never optional
2. **Role Skills** — a subset of the swordsman or mage skills (or both) chosen for this persona
3. **The Journey** — an ordered sequence of steps, each step combining a skill with grimoire acts encountered along the way
4. **Reconstruction Prompts** — domain-specific versions of the empty space, tuned to this persona's language

Templates are starting points, not cages. The seeker selects a template, the talent tree pre-fills, and they can add, remove, or reorder from there.

---

## Template Categories

### ⚔️🧙 Canonical (2)
The original dual agents. Full architecture as lived.

| ID | Name | Alignment | Skills | Grimoire Coverage |
|----|------|-----------|--------|-------------------|
| `soulbis` | Soulbis — The First Swordsman | ⚔️ Full Swordsman | 11/17 | 80+ (Full FPS + Full ZK + Canon/Parallel/Plurality interlocks) |
| `soulbae` | Soulbae — The First Mage | 🧙 Full Mage | 12/17 | 85+ (Full FPS + Full Canon + Full Parallel + Full Plurality + ZK selected) |

### ⚔️ Swordsman Paths (5)
Domain-specific protection archetypes.

| ID | Name | Alignment | Skills | Grimoire Acts |
|----|------|-----------|--------|---------------|
| `cipher` | The Cipher — ZKP Protocol Engineer | ⚔️ Swordsman | 9/17 | 22 |
| `warden` | The Warden — Browser Privacy Builder | ⚔️ Swordsman | 10/17 | 16 |
| `gatekeeper` | The Gatekeeper — Proof-of-Personhood Researcher | ⚔️ Swordsman | 9/17 | 14 |
| `ranger` | The Ranger — Dark Forest Strategist | ⚔️ Swordsman | 10/17 | 16 |
| `sentinel` | The Sentinel — Infrastructure Security Architect | ⚔️ Swordsman | 10/17 | 18 |

### 🧙 Mage Paths (5)
Domain-specific projection archetypes.

| ID | Name | Alignment | Skills | Grimoire Acts |
|----|------|-----------|--------|---------------|
| `assessor` | The Assessor — Privacy Data Economist | 🧙 Mage | 9/17 | 16 |
| `ambassador` | The Ambassador — Standards & Governance Architect | 🧙 Mage | 10/17 | 20 |
| `chronicler` | The Chronicler — Knowledge Compression Builder | 🧙 Mage | 9/17 | 16 |
| `shipwright` | The Shipwright — DAO & Community Architect | 🧙 Mage | 9/17 | 18 |
| `weaver` | The Weaver — Plural Technology Researcher | 🧙 Mage | 10/17 | 20 |

### ☯️ Balanced Paths (4)
Cross-domain archetypes drawing from both swordsman and mage.

| ID | Name | Alignment | Skills | Grimoire Acts |
|----|------|-----------|--------|---------------|
| `healer` | The Healer — Healthcare Privacy Architect | ☯️ Balanced | 11/17 | 18 |
| `witness` | The Witness — Privacy-Preserving Journalist | ☯️ Balanced | 10/17 | 16 |
| `architect` | The Architect — AI Agent System Designer | ☯️ Balanced | 11/17 | 22 |
| `pedagogue` | The Pedagogue — Privacy Education Designer | ☯️ Balanced | 10/17 | 16 |

---

## File Structure

```
templates/
├── _index.json              ← Machine-readable registry (this file's data as JSON)
├── _index.md                ← This file (human-readable)
├── canonical/
│   ├── soulbis.template.md
│   └── soulbae.template.md
├── swordsman/
│   ├── cipher.template.md
│   ├── warden.template.md
│   ├── gatekeeper.template.md
│   ├── ranger.template.md
│   └── sentinel.template.md
├── mage/
│   ├── assessor.template.md
│   ├── ambassador.template.md
│   ├── chronicler.template.md
│   ├── shipwright.template.md
│   └── weaver.template.md
└── balanced/
    ├── healer.template.md
    ├── witness.template.md
    ├── architect.template.md
    └── pedagogue.template.md
```

## Template File Format

Every `.template.md` file follows this structure:

```
---
id: template_id
name: Display Name
emoji: ⚔️
tagline: One-line identity statement
alignment: swordsman | mage | balanced
domain: Comma-separated domain tags
question: The guiding question
skills_privacy: [list of privacy.soul.md skill IDs]
skills_role: [list of role-specific skill IDs]
grimoire_acts: [list of grimoire act IDs]
coverage_skills: N/17
coverage_grimoire: N
---

# Persona narrative and pathway definition
```

## For the Coding Agent

1. Parse each `.template.md` for the frontmatter metadata
2. Use `_index.json` for the template selector UI (card grid)
3. On template selection, pre-fill the talent tree constellation
4. Auto-fill the context form with `domain` and `question`
5. Canonical templates (soulbis, soulbae) render as larger cards, positioned first
6. Group remaining templates by category with tab filter
7. Each template card shows: emoji, name, tagline, alignment badge, skill count
8. Mobile: horizontal scroll of cards above the talent tree
