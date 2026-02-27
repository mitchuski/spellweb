# Spellweb ⚔️⊥🧙

Interactive knowledge graph explorer for the **agentprivacy** dual-agent privacy architecture.

> *"Separation between Swordsman and Mage preserves the First Person."*

## Overview

Spellweb is a D3.js-powered knowledge graph visualization that maps the entire agentprivacy conceptual framework:

- **119 nodes** covering documents, concepts, theorems, spells, acts, personas, and terms
- **100+ edges** showing relationships: defines, proves, implements, narrates, compresses_to
- **Domain coloring**: Swordsman (red), Mage (violet), First Person (gold), Shared (cyan)
- **Interactive exploration**: search, filter, inspect, navigate

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
├── components/
│   ├── SpellWeb.tsx       # Main D3.js graph component
│   ├── NodeInspector.tsx  # Node detail panel
│   ├── GraphFilters.tsx   # Layer/type filters
│   ├── Header.tsx         # Search bar & stats
│   ├── Legend.tsx         # Domain & edge legend
│   └── HoverTooltip.tsx   # Hover card
├── data/
│   ├── nodes.ts           # 119 knowledge graph nodes
│   ├── edges.ts           # 100+ relationships
│   └── theme.ts           # Visual theme & colors
└── types/
    └── graph.ts           # TypeScript definitions
```

## Node Types

| Type | Count | Description |
|------|-------|-------------|
| 📜 Document | 9 | Whitepapers, research papers, spellbooks |
| ◆ Concept | 42 | Core concepts, protocols, standards |
| △ Theorem | 4 | Mathematical proofs |
| ✦ Spell | 10 | Compressed principles |
| ◇ Act | 11 | Narrative acts |
| ○ Persona | 7 | System agents |
| · Term | 9 | Glossary entries |

## Edge Types

| Type | Color | Description |
|------|-------|-------------|
| defines | Cyan | Document → Concept |
| proves | Red | Theorem → Concept |
| implements | Violet | Concept → Concept |
| narrates | Green | Act → Concept |
| compresses_to | Gold | Concept → Spell |
| follows | Green | Act → Act (narrative sequence) |

## The Core Concepts

**Privacy-Delegation Paradox**: AI agents need information to act on your behalf, but that information enables surveillance.

**Dual-Agent Architecture**: Split agent function into Swordsman (protect) and Mage (delegate) with mathematical separation guarantees.

**The Gap**: The irreducible space between what Swordsman observes and what Mage reveals. Where sovereignty lives.

**7th Capital**: Behavioral sovereignty as personal wealth.

## Deployment

Spellweb is a static site that can be deployed to:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

```bash
npm run build
# Deploy the `dist` folder
```

## Domains

- **spellweb.ai**
- **spellweb.io**

## License

MIT

---

*⚔️ ⊥ 🧙‍♂️ | 😊 — Privacy is Value*
