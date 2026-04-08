# Persona Import Feature Plan

## Overview

Add an "Import Persona" button to spellweb that allows users to drop a `myspellbook.md` or `agentprivacy-{persona}.skills.md` file exported from the agentprivacy spells page. This loads the persona's alignment, spells, proverbs, and constellation pathway into the current session.

---

## Source File Format

### agentprivacy-skills Export Structure

The `.skills.md` or `_spellbook.md` files contain:

```markdown
# [Agent Name] Spellbook

**Source:** agentprivacy.ai/spells
**Agent:** Swordsman | Mage | Balanced
**Persona:** cipher | chronicler | warden | etc.

## Your Pathway
Acts and tales mapped across spellbooks...

## Spells & Proverbs
| Spell | Title | Proverb |
|-------|-------|---------|
| emoji | label | "quote" |

## Inscribed Proverbs
Per-node proverbs with marker emojis...

## Constellation Web
Node connections and reflection notes...

## Persona Alignment
Matching personas based on selected skills...

## Skills
[Full skill file contents appended]
```

### Key Data to Extract

1. **Persona Identity**
   - Name (e.g., "The Cipher")
   - Emoji (e.g., "🗡️🔐")
   - Alignment: `swordsman` | `mage` | `balanced`

2. **Spells & Proverbs**
   - Spell emoji sequences
   - Spell titles/labels
   - Associated proverbs

3. **Constellation Pathway**
   - Ordered node sequence
   - Marker emojis per node
   - Connection notes

4. **Skills Metadata**
   - Tier (0-3)
   - Category
   - Equation terms
   - Dual agent role

---

## Implementation Plan

### Phase 1: UI Integration

**Location:** Add to Blades modal or create dedicated Persona section

```
[Blades Modal]
├── ZK Blades (forge section)
├── Witness Blades (import .md)
└── [NEW] Persona Import
    ├── Import spellbook.md button
    ├── Persona preview card
    └── Apply to session button
```

**Alternative:** Floating button near mage spells inventory

### Phase 2: Parser Implementation

Create `parsePersonaFile(content: string): PersonaImport`

```typescript
interface PersonaImport {
  personaId: string;
  name: string;
  emoji: string;
  alignment: 'swordsman' | 'mage' | 'balanced';
  spells: Array<{
    emoji: string;
    title: string;
    proverb: string;
  }>;
  constellation: Array<{
    nodeLabel: string;
    markerEmoji: string;
    note?: string;
  }>;
  skills: string[];  // skill IDs
}
```

**Parsing Steps:**
1. Extract agent alignment from header
2. Parse spells table for emoji/title/proverb
3. Extract inscribed proverbs per node
4. Parse constellation web connections
5. Identify persona from alignment section

### Phase 3: Session Integration

**On Import:**
1. Set agent alignment (affects orb styling?)
2. Pre-populate mage spells from parsed spells (up to 8)
3. Create constellation marks from pathway
4. Store persona metadata for export inclusion

**State Updates:**
```typescript
// New state
const [activePersona, setActivePersona] = useState<PersonaImport | null>(null);

// On import
setMageSpells(parsedSpells.slice(0, 8).map((s, i) => ({
  nodeId: `persona-spell-${i}`,
  label: s.title,
  emoji: s.emoji,
  proverb: s.proverb,
  hexagramLine: i,
})));

setConstellation(parsedConstellation.map(c => ({
  nodeId: findNodeByLabel(c.nodeLabel)?.id || `imported-${c.nodeLabel}`,
  nodeLabel: c.nodeLabel,
  emoji: c.markerEmoji,
  note: c.note || '',
})));
```

### Phase 4: Visual Feedback

**Persona Badge:**
- Show active persona emoji + name in UI
- Tint orbs based on alignment
- Include persona in blade exports

**Alignment Effects:**
- Swordsman: Red-tinted effects, ⚔️ emphasis
- Mage: Purple-tinted effects, ✦ emphasis
- Balanced: Gold-tinted effects, ⚖️ emphasis

---

## File Matching

### Supported Filenames
- `myspellbook.md`
- `my_spellbook.md`
- `{agent}_spellbook.md` (e.g., `soulbis_spellbook.md`)
- `agentprivacy-{persona}.skills.md`
- `*.skills.md`

### Content Detection
If filename doesn't match, detect by:
- Presence of `**Source:** agentprivacy.ai/spells`
- Presence of `## Spells & Proverbs` section
- YAML frontmatter with `category:` or `alignment:`

---

## Export Enhancement

When exporting blade.md with active persona:

```markdown
## Persona
**Name:** The Cipher
**Alignment:** Swordsman
**Emoji:** 🗡️🔐

## Inherited Spells
| Line | Emoji | Title | Proverb |
|------|-------|-------|---------|
...
```

---

## Implementation Order

1. **Parser** - Create `parsePersonaFile()` utility
2. **UI Button** - Add import button to Blades modal
3. **State** - Add `activePersona` state
4. **Integration** - Wire up spell/constellation population
5. **Visual** - Add persona badge and alignment tinting
6. **Export** - Include persona in blade.md exports

---

## Open Questions

1. Should importing a persona replace or merge with existing spells?
2. Should constellation be auto-populated or require confirmation?
3. How to handle persona + blade combination in exports?
4. Should alignment affect ceremony/forge visuals?

---

## Dependencies

- Parsing regex for markdown tables
- Node label matching to spellweb NODES
- Mage spells state (already exists)
- Constellation state (already exists)
