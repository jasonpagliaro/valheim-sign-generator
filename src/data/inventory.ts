import inventory from './current-items.json'
import type { CatalogItem, Category } from './catalog'

const categoryColors: Record<Category, string> = {
  Meadows: 'BFD994', 'Black Forest': 'C9BB8B', Swamp: 'AEC79B', Mountains: 'B9DAEC', Plains: 'E1C38B',
  Mistlands: 'C6B6E4', Ashlands: 'E7A58E', 'Deep North': 'A8DCE5', Ocean: 'A4D2E0',
  'Food & Mead': 'E6C18C', 'Equipment & Misc': 'D5C4A1',
}
function nameKey(name: string) {
  return name.toLocaleLowerCase().replace(/arrows$/, 'arrow').replace(/[’‘]/g, "'").trim()
}
function symbolFor(name: string, type: string) {
  if (/wood$|bark$/i.test(name)) return '🪵'
  if (/mushroom|magecap|jotun puffs|smoke puff|toadstool/i.test(name)) return '🍄'
  if (type === 'Fish' || /fish$/i.test(name)) return '🐟'
  if (/ore$|scrap|^(flametal|bloodgold)$/i.test(name)) return '⛏'
  if (/meat|tail$|blubber/i.test(name)) return '🥩'
  if (/seed|cone$/i.test(name)) return '🌱'
  if (/mead|concoction|brew|tonic|draught|wine base/i.test(name)) return '◈'
  if (/Weapon|Bow/.test(type)) return '⚔'
  if (type === 'Tool') return '⚒'
  if (type === 'Consumable') return '🍞'
  return '◆'
}

// Enrich existing labels without changing their names, symbols, colors, categories,
// or IDs. Each accepted native inventory identity is attached to exactly one label.
export function withCurrentInventory(original: CatalogItem[]): CatalogItem[] {
  const items = original.map(item => ({ ...item }))
  const byName = new Map<string, CatalogItem>()
  for (const item of items) {
    if (item.kind || item.status === 'legacy') continue
    byName.set(nameKey(item.name), item)
    if (item.alias) byName.set(nameKey(item.alias), item)
  }
  for (const entry of inventory.items) {
    const category = entry.category as Category
    const existing = byName.get(nameKey(entry.name))
    const terms = [...entry.aliases, entry.name, entry.prefab]
    if (existing) {
      existing.prefabs = [...(existing.prefabs ?? []), entry.prefab]
      existing.itemType = entry.itemType
      existing.searchTerms = [...(existing.searchTerms ?? []), ...terms]
      if (!existing.alias && nameKey(existing.name) !== nameKey(entry.name)) existing.alias = entry.name
      existing.note ??= entry.note || undefined
    } else {
      const item: CatalogItem = {
        id: `item-${entry.prefab.toLowerCase()}`, name: entry.name,
        symbol: symbolFor(entry.name, entry.itemType), color: categoryColors[category], category,
        source: 'addition', status: entry.special ? 'special' : 'practical', itemType: entry.itemType,
        prefabs: [entry.prefab], searchTerms: terms, note: entry.note || undefined,
      }
      items.push(item)
      byName.set(nameKey(entry.name), item)
    }
  }
  return items
}
