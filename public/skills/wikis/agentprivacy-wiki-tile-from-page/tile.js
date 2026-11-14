#!/usr/bin/env node
/*
 * tile.js — mechanical half of the `tile-from-page` skill.
 *
 * The SEMANTIC half (which glyph / colour / category fits a page) is done by
 * the agent reading the content. This script only does the deterministic
 * file work: read a page's content, and write a `tileglyph` item into a
 * destination page on disk while keeping the Root Tiles registry in sync.
 *
 * Local farm pages are edited by DIRECT DISK WRITE (not the action API) so
 * emoji glyphs are preserved — the /page/<slug>/action endpoint mojibakes
 * multibyte UTF-8.
 *
 * Usage:
 *   node tile.js read     <host> <slug>
 *   node tile.js registry <host>
 *   node tile.js add      <host> <destSlug> --label L [--glyph G] [--color #hex]
 *                         [--category C] [--anim pulse] [--sparkle "2+ 2-"] [--link L]
 *
 * When --category matches a Root Tiles entry and --glyph/--color are omitted,
 * the registry's canonical glyph+colour are inherited (match-to-root-tiles).
 * When the category is new, the supplied glyph+colour are written back as the
 * new canonical entry (mint + propose).
 */
const fs = require('fs')
const path = require('path')
const os = require('os')

const WIKI = path.join(os.homedir(), '.wiki')
const REGISTRY_SLUG = 'root-tiles'
const REGISTRY_MARKER = '<!--ROOT-TILES-->'

const pagePath = (host, slug) => path.join(WIKI, host, 'pages', slug)

const genId = () => {
  let s = ''
  for (let i = 0; i < 16; i++) s += ((Math.random() * 16) | 0).toString(16)
  return s
}

const readPage = (host, slug) => {
  const p = pagePath(host, slug)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

const writePage = (host, slug, page) => {
  const dir = path.join(WIKI, host, 'pages')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(pagePath(host, slug), JSON.stringify(page, null, 2), 'utf8')
}

const titleCase = slug =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// ---- Root Tiles registry: a JSON map embedded in the registry page ----
const loadRegistry = host => {
  const page = readPage(host, REGISTRY_SLUG)
  if (!page) return {}
  for (const it of page.story || []) {
    if (it.type === 'markdown' && (it.text || '').includes(REGISTRY_MARKER)) {
      const m = (it.text || '').match(/```json\s*([\s\S]*?)```/)
      if (m) {
        try {
          return JSON.parse(m[1])
        } catch (e) {
          return {}
        }
      }
    }
  }
  return {}
}

const saveRegistry = (host, map) => {
  let page = readPage(host, REGISTRY_SLUG)
  const now = Date.now()
  // human legend + machine block
  const rows = Object.keys(map)
    .sort()
    .map(k => `| ${k} | ${map[k].glyph} | \`${map[k].color}\` |`)
    .join('\n')
  const body =
    `# Root Tiles\nCanonical \`category → { glyph, color }\` vocabulary that ` +
    `[[Tile Glyph Plugin]] tiles match against. ${REGISTRY_MARKER}\n\n` +
    `| Category | Glyph | Color |\n|---|---|---|\n${rows}\n\n` +
    '```json\n' +
    JSON.stringify(map, null, 2) +
    '\n```'
  const regItem = { type: 'markdown', id: genId(), text: body }
  if (!page) {
    page = {
      title: 'Root Tiles',
      story: [regItem],
      journal: [
        { type: 'create', item: { title: 'Root Tiles', story: [] }, date: now },
        { type: 'add', id: regItem.id, item: regItem, date: now },
      ],
    }
  } else {
    // replace the existing registry item (keep its id) or prepend a new one
    let replaced = false
    page.story = (page.story || []).map(it => {
      if (it.type === 'markdown' && (it.text || '').includes(REGISTRY_MARKER)) {
        replaced = true
        return { ...it, text: body }
      }
      return it
    })
    if (!replaced) {
      page.story.unshift(regItem)
      page.journal = page.journal || []
      page.journal.push({ type: 'add', id: regItem.id, item: regItem, date: now })
    } else {
      page.journal = page.journal || []
      const target = page.story.find(it => (it.text || '').includes(REGISTRY_MARKER))
      page.journal.push({ type: 'edit', id: target.id, item: target, date: now })
    }
  }
  writePage(host, REGISTRY_SLUG, page)
}

// ---- arg parsing ----
const parseFlags = argv => {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
      out[key] = val
    }
  }
  return out
}

const tileText = cfg => {
  const lines = [cfg.label]
  if (cfg.glyph) lines.push(`glyph: ${cfg.glyph}`)
  if (cfg.color) lines.push(`color: ${cfg.color}`)
  if (cfg.category) lines.push(`category: ${cfg.category}`)
  if (cfg.anim) lines.push(`anim: ${cfg.anim}`)
  if (cfg.sparkle) lines.push(`sparkle: ${cfg.sparkle}`)
  if (cfg.link && cfg.link !== cfg.label) lines.push(`link: ${cfg.link}`)
  return lines.join('\n')
}

// ---- commands ----
const cmd = process.argv[2]
const host = process.argv[3]

if (cmd === 'read') {
  const slug = process.argv[4]
  const page = readPage(host, slug)
  if (!page) {
    console.error(`no page ${host}/${slug}`)
    process.exit(1)
  }
  const synopsis = (page.story || [])
    .filter(it => it.text)
    .map(it => it.text)
    .join('\n\n')
    .slice(0, 1200)
  console.log(JSON.stringify({ title: page.title, slug, synopsis }, null, 2))
} else if (cmd === 'registry') {
  console.log(JSON.stringify(loadRegistry(host), null, 2))
} else if (cmd === 'add') {
  const destSlug = process.argv[4]
  const f = parseFlags(process.argv.slice(5))
  if (!f.label) {
    console.error('--label is required')
    process.exit(2)
  }
  const reg = loadRegistry(host)
  const cat = f.category || ''
  // match-to-root-tiles: inherit canonical glyph/color when omitted
  if (cat && reg[cat]) {
    if (!f.glyph) f.glyph = reg[cat].glyph
    if (!f.color) f.color = reg[cat].color
  }
  const cfg = {
    label: f.label,
    glyph: f.glyph || '◆',
    color: f.color || '#1a1a1a',
    category: cat,
    anim: f.anim || 'pulse',
    sparkle: f.sparkle || '2+ 2-',
    link: f.link || f.label,
  }
  // write/refresh the registry entry (mint when new)
  if (cat) {
    const before = reg[cat]
    reg[cat] = { glyph: cfg.glyph, color: cfg.color }
    if (!before || before.glyph !== cfg.glyph || before.color !== cfg.color) {
      saveRegistry(host, reg)
    }
  }
  // append the tile to the destination page
  const now = Date.now()
  let page = readPage(host, destSlug)
  const item = { type: 'tileglyph', id: genId(), text: tileText(cfg) }
  if (!page) {
    const title = titleCase(destSlug)
    page = {
      title,
      story: [item],
      journal: [
        { type: 'create', item: { title, story: [] }, date: now },
        { type: 'add', id: item.id, item, date: now },
      ],
    }
  } else {
    page.story = page.story || []
    page.story.push(item)
    page.journal = page.journal || []
    page.journal.push({ type: 'add', id: item.id, item, date: now })
  }
  writePage(host, destSlug, page)
  console.log(
    JSON.stringify(
      {
        wrote: `${host}/${destSlug}`,
        tile: cfg,
        matchedRegistry: !!(cat && reg[cat]),
      },
      null,
      2,
    ),
  )
} else {
  console.error('usage: node tile.js read|registry|add <host> ...')
  process.exit(2)
}
