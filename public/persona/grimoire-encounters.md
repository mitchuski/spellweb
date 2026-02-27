# Grimoire Encounters — Reference

> *Loaded on demand. This is Level 3 progressive disclosure — full narrative context for the acts encountered on this seeker's pathway.*

This reference contains the complete grimoire encounters from the seeker's spellbook journey. Each entry includes the full spell, proverb, act summary, and the connection to PVM-V4 skill architecture.

**Template:** {{template_name}}
**Acts encountered:** {{grimoire_count}}

---

{{#each grimoire_encounters}}

## {{act_name}}

**Source:** {{grimoire_name}} ({{grimoire_type}})
**Spell:** `{{spell}}`
**Proverb:** *"{{proverb}}"*

### Summary
{{act_summary}}

### Architectural connection
**PVM-V4 term:** {{pvm_term}}
**Skill file:** {{skill_file}}
**Why this act appears on this pathway:** {{pathway_reason}}

### The {{alignment}} reading
{{alignment_reading}}

---

{{/each}}

## Cross-references

| Act | PVM Term | Skill File | Pathway Position |
|-----|----------|-----------|-----------------|
{{#each grimoire_encounters}}
| {{act_name}} | {{pvm_term}} | {{skill_file}} | Phase {{phase}}, Step {{step}} |
{{/each}}

---

**Source architecture:** 0xagentprivacy
**Verification:** sync.soulbis.com
