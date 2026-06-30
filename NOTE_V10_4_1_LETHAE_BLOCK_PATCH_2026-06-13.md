# Note — v10.4.1 patch: the Lethae block (fix tomorrow, 2026-06-13)

**Scheduled by the First Person 2026-06-12: "we do that fix tomorrow."**

## What's wrong

The pinned **privacymage Grimoire v10.4.0** carries two errors in
`first_canonical_divergent_attachment` (the Lethae 🌘 block), found by the
lattice-coherence audit after the 2026-06-12 encoding ruling:

| Field | Currently | Must be | Why |
|---|---|---|---|
| `"binary"` | `"100110"` | `"011001"` | the block's own `vertex` is V25; 100110 is 38. Under the ruled MODEL encoding (d₁ Protection = the high bit), V25 = `011001` = Delegation+Memory+Value — Lethe's invariant meaning ✓ |
| `"complement_of_cast"` | `"aletheia (V25)"` | `"aletheia (V38)"` | Aletheia's seat is V38 (the reseat; C54 follows the number). The block's own `vertex_complement_proof` line (V25 ⊕ V38 = V63) is already correct |

Both errors, same two lines, in **all three copies**:

1. `spellweb/privacymage_grimoire_v10_4_0.json` (line ~76 `binary`, ~79 `complement_of_cast`)
2. `agentprivacy_master/src/data/privacymage-grimoire-v10.4.0-canonical.json`
3. `agentprivacy_master/public/models/privacymage-grimoire-v10.4.json`

## Why it isn't already fixed

v10.4.0 is a **pinned edition** (`bafybeicvbong6ejbvtnfcgbfdtely75e3cakauthv3u22r3nh6ljxqstsm`).
Editing the local files would silently diverge from the pin. The honest path
is a **patch edition**: bump to **v10.4.1**, fix the two fields, note the
erratum, repin, and update the pin references.

## Tomorrow's steps

1. In each of the three copies: fix the two fields; bump the grimoire version
   field `10.4.0 → 10.4.1`; add a brief `v10_4_1_note` (suggested: *"Erratum
   patch — Lethae block: binary corrected to 011001 (V25) and
   complement_of_cast to aletheia (V38), per the 2026-06-12 MODEL encoding
   ruling and the Aletheia@38 ⊥ Lethe@25 reseat. No other changes."*).
2. Verify the three copies are field-identical where they should be (the
   master `public/models` copy may be a trimmed variant — match its existing
   shape).
3. Sanity: `node -e` check that every `vertex`/`binary` pair in the JSON
   agrees under MODEL (d₁ = high bit) — catches any sibling of this bug.
4. Pin the new spellweb-root JSON → record the v10.4.1 CID.
5. Update pin references: `agentprivacy_master/src/app/archive/page.tsx`
   (`PIN_PRIVACYMAGE` + the shelf blurb "v10.4.0" mentions),
   `model-downloads.ts` (privacymage grimoire row, version string), and any
   docs that cite the v10.4.0 CID as current (memory says: models/INDEX.md in
   agentprivacy-docs; grep for `bafybeicvbong` to be sure). The v10.4.0 pin
   stays resolvable as lineage.
6. tsc + the lattice-coherence audit re-run (the two Lethae findings should
   disappear; the versioned archives keep their inception seats and will
   still flag — that's correct behaviour).

*The meanings never moved; tomorrow the last two numbers catch up.* (⚔️⊥⿻⊥🧙)😊
