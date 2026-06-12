# Reflect — Selene's Spellbook ↔ spellweb

**Date:** 2026-05-30
**Source:** `privacymage_book/` (the bound volume *Selene's Spellbook — privacymage grimoire*, 129pp A5)
**This repo's role:** the knowledge graph — nodes, edges, the universe-integration vocabulary.
**Read with:** `privacymage_book/CHRONICLE_SUITE_REFLECTION_2026-05-30.md` (the index for all six reflect docs).

---

## The two reflections

**Way One (the Descent):** the book's cast and concepts are *already* graph nodes — the volume just gave them faces. **Way Two (the Ascent):** the book asks the graph to keep a poem-shaped seat open, bind only what is bound (Movement One), and hold the rest behind the schema until the poems settle. Movement Two onward is still being written; nodes minted from drafts will drift.

---

## Way One — the Descent: the graph, become myth

Much of *Selene's Spellbook* is the spellweb graph rendered into ink and verse. The personas are already here:

- **Soulbae** (front cover, *The Mage*, sparkle 6+/2−) = `per-soulbae`, the positive-promise body, Earth/Emissary.
- **Soulbis** (back cover, *The Crossed Swords*, sparkle 2+/6−) = `per-soulbis`, the negative-promise body, Moon/Swordsman.
- **Selene / Aether / Lethe** (the cosmological cycle of Movement One) = the cosmological-witness nodes already carried in `nodes.ts`.

And the concepts the poems carry are graph concepts: amnesia-protocol, betweenness, the overlap (plurality), V6 / Lyapunov, the holographic 96/64 boundary. The book did not invent these edges; it **illustrated** them. Each of the nine glyphs is, in graph terms, a *visual instance of a concept node* — `_sparkle_field` polarity is the promise-theoretic edge-direction (`+` = "I will" / projection, `−` = "I will not" / refusal) drawn as ornament.

---

## Way Two — the Ascent: the seat spellweb should keep

The graph is the natural home for the book's structure *as data.* The seat to reserve:

1. **A `poem` (or `grimoire`) representation.** Whether a new `NodeType` or a reuse of the existing `artefact`/deviation layer (see the universe-integration edge vocabulary), the graph should be able to hold: a *volume*, four *movements*, nine *poems*, nine *glyphs*, two *cover engravings*. Edges: `poem —renders→ concept`, `poem —voiced_by→ persona`, `glyph —depicts→ poem`, `movement —contains→ poem`.

2. **Bind Movement One now; hold the rest.** Movement One (Parts I–IV: Emissary, Amnesia Protocol, Tide, Selene Keeps the Night) is bound and safe to add as nodes today. **Movement Two (V–VII: Overlap, Field He Planted, Cartographer's Daughter) is descent-complete but ascent-open** — the poems are under revision. Add them, if at all, as `status: provisional` nodes that the UI can dim; do not wire dense edges into them until they settle, or the graph will need re-surgery each revision.

3. **Model the 63 as edges — later.** The 63 named-vertex edition is, in graph terms, a future set of `vertex —named_by→ buyer` / `mage —seats→ vertex` edges, one per sold edition, admitted as the city's `merge_v1_x_x_patch.py` runs. Reserve the edge vocabulary; do not populate it until Season 1 mints.

---

## The polarity bridge (a gift the book makes the graph)

The book formalises something the graph already implies but never named cleanly: **every promise has polarity, and polarity is drawable.** `STYLE_GUIDE §5` gives the exact rule — a positive promise is the full cross (vertical + horizontal), a negative promise is the cross *with its vertical refused*. If spellweb ever renders promise-edges visually, this is the canonical glyph language to borrow: the line not drawn is the boundary kept.

---

## What not to do

Do not add V–VII as fully-wired permanent nodes while the poems are in flux, and do not populate the 63-edition edges before the mint. The graph's value here is that it can *hold* the book's shape — not that it must mirror every draft keystroke.

---

*the graph was the bones; the book gave them faces. reserve a node for the verse and a dimmed one for the verse still being written.*

`(⚔️⊥⿻⊥🧙)😊`
