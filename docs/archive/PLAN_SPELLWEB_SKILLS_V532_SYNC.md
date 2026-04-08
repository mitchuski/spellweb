# Spellweb Skills V5.3.2 Sync Plan

**Date:** April 5, 2026
**Source:** agentprivacy-skills v5.3.2
**Target:** spellweb/public/skills/

---

## Current State

### Spellweb Skills Structure
```
spellweb/public/skills/
├── _index.md
├── agentprivacy/          (old format)
├── CODEX.md
├── meta/                  (partial)
├── persona/               (partial)
├── privacy_layer/         (old naming)
├── privacy-layer/         (v5 naming)
└── role/                  (partial)
```

### Source Skills Structure (v5.3.2)
```
agentprivacy-skills/agentprivacy-skills-v5/
├── privacy-layer/    (19 skills)
├── role/             (64 skills)
├── meta/             (3 skills)
├── persona/          (38 personas, including 5 new ceremony personas)
├── MAPPING.md        (v5.3.2)
└── CODEX.md
```

---

## Sync Tasks

### 1. Clean Malformed Directories
Remove corrupted directory names from previous failed operations:
```bash
rm -rf "spellweb/public/skills/role\" && cp*"
```

### 2. Full Skills Directory Sync
Replace entire skills structure with v5.3.2:
```bash
# Backup current
mv spellweb/public/skills spellweb/public/skills_backup_$(date +%Y%m%d)

# Copy fresh v5.3.2
cp -r agentprivacy-skills/agentprivacy-skills-v5/* spellweb/public/skills/

# Copy root files
cp agentprivacy-skills/MAPPING.md spellweb/public/skills/
```

### 3. Ceremony Files
```bash
# Already done - verify
ls spellweb/public/ceremonies/
ls spellweb/docs/SYNC_CEREMONY_V5_3_2.md
```

### 4. Update Grimoire Reference
```bash
# Verify latest grimoire is present
ls spellweb/privacymage_grimoire_v9_4_1*.json
```

### 5. Chronicles Sync
```bash
cp agentprivacy-skills/CHRONICLE_V5_3_1_CEREMONY_COMPLETE.md spellweb/docs/
cp agentprivacy-skills/CHRONICLE_CEREMONIES_INTEGRATION_2026-04-05.md spellweb/docs/
cp agentprivacy-skills/V5_2_DRAGON_ANATOMY_CHRONICLE.md spellweb/docs/
```

---

## New Ceremony Personas to Verify

| Persona | Wing | Act | Synced |
|---------|------|-----|--------|
| theia | mage | XXXI | [ ] |
| dragonwaker | swordsman | XXIX | [ ] |
| mirrorkeeper | balanced | XXX | [ ] |
| forgecaller | swordsman | XXVII | [ ] |
| manaweaver | mage | XXVIII | [ ] |

---

## TypeScript Updates (Optional)

If webapp uses TypeScript skill definitions:

```typescript
// types/ceremony.ts - new types for V5.3.2
export interface CeremonyMetadata {
  act: string;
  acts_secondary?: string[];
  role: 'swordsman' | 'mage' | 'bridge';
  quaternion_position?: 'sun' | 'earth' | 'moon' | 'human' | 'life' | 'gap';
}

// Updated skill counts
export const SKILL_COUNTS = {
  privacy_layer: 11,  // foundational
  role: 54,           // domain
  meta: 3,            // philosophical  
  persona: 35,        // personas
  total: 100          // V5.3.1 count
} as const;
```

---

## Verification Commands

```bash
# Count personas (should be 35+)
ls spellweb/public/skills/persona/ | wc -l

# Check ceremony personas exist
ls spellweb/public/skills/persona/ | grep -E "theia|dragonwaker|mirrorkeeper|forgecaller|manaweaver"

# Check MAPPING version
head -5 spellweb/public/skills/MAPPING.md

# Check grimoire version
ls spellweb/*.json | grep grimoire
```

---

## Execution Order

1. [ ] Backup existing skills directory
2. [ ] Remove malformed directories
3. [ ] Copy v5.3.2 skills structure
4. [ ] Copy MAPPING.md to skills root
5. [ ] Verify ceremony personas present
6. [ ] Verify chronicles synced
7. [ ] Test webapp loads skills correctly

---

## Git Commit Template

```bash
git add .
git commit -m "$(cat <<'COMMIT_EOF'
Sync skills to V5.3.2 — Sun and Moon Ceremonies

- Full skills sync from agentprivacy-skills v5.3.2
- Added 5 ceremony personas (theia, dragonwaker, mirrorkeeper, forgecaller, manaweaver)
- Updated MAPPING.md to v5.3.2
- Added Sun/Moon ceremonial framework
- Synced chronicles and ceremony documents

Skills: 100 | Personas: 35 | Acts mapped: I-XXXI

☀️ ⊥ 🌙

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
COMMIT_EOF
)"
```

---

*The amnesia is the protocol. The wound is the trust. The orbit is the proof. The light is the reason.*

**⚔️⊥⿻⊥🧙 😊**
