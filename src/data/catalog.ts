import baseline from './baseline.json'

export const CATEGORIES = ['Meadows', 'Black Forest', 'Swamp', 'Mountains', 'Plains', 'Ocean', 'Food & Mead', 'Equipment & Misc'] as const
export type Category = typeof CATEGORIES[number]
export type ItemStatus = 'practical' | 'special' | 'legacy' | 'later'
export interface CatalogItem {
  id: string
  name: string
  symbol: string
  color: string
  category: Category
  source: 'baseline' | 'addition'
  status: ItemStatus
  kind?: 'storage'
  alias?: string
  note?: string
}

const annotations: Record<string, Partial<Pick<CatalogItem, 'alias' | 'status' | 'note'>>> = {
  'Raw boar meat': { alias: 'Boar meat', note: 'The in-game item is Boar meat. Original label preserved.' },
  'Raw deer meat': { alias: 'Deer meat', note: 'The in-game item is Deer meat. Original label preserved.' },
  'Oak seeds': { alias: 'Acorns', note: 'Oak trees grow from Acorns.' },
  'Iron scrap': { alias: 'Scrap iron', note: 'The in-game item is Scrap iron.' },
  'Ulve trophy': { alias: 'Ulv trophy', note: 'The in-game spelling is Ulv trophy.' },
  'Bear pelt': { alias: 'Bear hide', note: 'The in-game item is Bear hide. Bears are available in vanilla.' },
  'Bear meat': { note: 'A Black Forest resource, preserved in its supplied Meadows grouping.' },
  'Fine wood': { alias: 'Finewood', note: 'The current in-game name is Finewood.' },
  'Core wood': { alias: 'Corewood', note: 'The current in-game name is Corewood.' },
  'Ooze trophy': { status: 'legacy', note: 'Unverified original label: no distinct Ooze trophy found in current game localization. Preserved for reference.' },
  'Poison resist mead': { alias: 'Poison resistance mead' },
  'Frost resist mead': { alias: 'Frost resistance mead' },
  'Fire resist mead': { alias: 'Fire resistance barley wine', note: 'The current in-game drink is Fire resistance barley wine.' },
  'Ancient seed': { status: 'special', note: 'Offering and progression resource.' },
  'Withered bone': { status: 'special', note: 'Offering and progression resource.' },
  'Yagluth thing': { status: 'legacy', note: 'Obsolete placeholder, replaced by Torn spirit. Preserved from the original catalog.' },
  'Torn spirit': { status: 'later', note: 'Obtained at the end of Plains; used in later progression.' },
  'Eikthyr trophy': { status: 'special', note: 'Boss trophy and progression item.' },
  'Elder trophy': { status: 'special', alias: 'The Elder trophy', note: 'Boss trophy and progression item.' },
  'Bonemass trophy': { status: 'special', note: 'Boss trophy and progression item.' },
  'Moder trophy': { status: 'special', note: 'Boss trophy and progression item.' },
  'Yagluth trophy': { status: 'special', note: 'Boss trophy and progression item.' },
  'Hard antler': { status: 'special', note: 'Boss drop used for a progression tool.' },
  'Swamp key': { status: 'special', note: 'Unique progression key.' },
  'Wishbone': { status: 'special', note: 'Special equippable progression item.' },
  'Dragon egg': { status: 'special', note: 'Summoning item; large and heavy.' },
  'Dragon tear': { status: 'special', note: 'Boss drop used for a progression crafting station.' },
  'Fish': { note: 'General storage label for the different fish species.' },
  'Mead base': { note: 'General storage label for unfermented mead bases.' },
  'Healing mead': { note: 'General storage label spanning multiple healing mead strengths.' },
  'Stamina mead': { note: 'General storage label spanning multiple stamina mead strengths.' },
  'Black metal chest': { note: 'Storage grouping label; the chest itself is a build piece.' },
  'Potions': { note: 'General storage label. Valheim calls its potions mead.' },
}

const storageNames = new Set(['Fish', 'Mead base', 'Healing mead', 'Stamina mead', 'Arrows', 'Weapons', 'Armor', 'Shields', 'Tools', 'Potions', 'Trophies', 'Treasure', 'Seeds', 'Portal supplies', 'Building supplies', 'Dungeon loot', 'Extra gear', 'Repair supplies', 'Black metal chest'])

export const BASELINE_ITEMS: CatalogItem[] = CATEGORIES.flatMap(category =>
  baseline[category].map(([name, symbol, color]) => ({
    id: `${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name, symbol, color, category, source: 'baseline' as const,
    status: 'practical' as ItemStatus, kind: storageNames.has(name) ? 'storage' as const : undefined, ...annotations[name],
  })),
)

// Verified additions are kept separate from the untouched supplied tuples.
// Provenance and scope are recorded in docs/catalog-audit.md.
function addition(category: Category, name: string, symbol: string, color: string, extra: Partial<Pick<CatalogItem, 'status' | 'kind' | 'note'>> = {}): CatalogItem {
  return { id: `added-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, symbol, color, category, source: 'addition', status: 'practical', ...extra }
}
export const ADDED_ITEMS: CatalogItem[] = [
  addition('Meadows', 'Feathers', '✧', 'E5DEC5'),
  addition('Black Forest', 'Fir cone', '◆', 'B9C28A'),
  addition('Black Forest', 'Pine cone', '◆', 'CBB17D'),
  addition('Black Forest', 'Ectoplasm', '●', 'A4DEC9'),
  addition('Black Forest', 'Ghost trophy', '♜', 'B0E4D9'),
  addition('Black Forest', 'Bear paw', '♜', 'C9A27F'),
  addition('Black Forest', 'Bear trophy', '♜', 'D5AE80'),
  addition('Plains', 'Vile ribcage', '☠', 'DCD5A6'),
  addition('Plains', 'Vile trophy', '♜', 'C9D2A1'),
  addition('Plains', 'Rotten meat', '🥩', 'A5B780'),
  addition('Plains', 'Fuling totem', '♜', 'E5C077', { status: 'special', note: 'Offering and progression item.' }),
  addition('Black Forest', 'Ymir flesh', '◈', 'D8B3B2', { status: 'special', note: 'Trader ingredient; availability depends on progression.' }),
  addition('Black Forest', 'Thunder stone', '◆', 'B8CEED', { status: 'special', note: 'Trader resource used to unlock a crafting build piece.' }),
  addition('Food & Mead', 'Bread dough', '🍞', 'EDD49B'),
  addition('Food & Mead', 'Unbaked lox pie', '🥧', 'DBB98D'),
  addition('Food & Mead', 'Minor healing mead', '♥', 'FAADB0'),
  addition('Food & Mead', 'Medium healing mead', '♥', 'FA8F90'),
  addition('Food & Mead', 'Minor stamina mead', '⚡', 'F8DB8A'),
  addition('Food & Mead', 'Medium stamina mead', '⚡', 'FFD56A'),
  addition('Ocean', 'Perch', '🐟', 'A9D59B'),
  addition('Ocean', 'Pike', '🐟', 'B2CAA2'),
  addition('Ocean', 'Tuna', '🐟', 'A7CDE8'),
  addition('Ocean', 'Trollfish', '🐟', '92BDEA'),
  addition('Ocean', 'Giant herring', '🐟', 'A3C9BD'),
  addition('Ocean', 'Tetra', '🐟', 'CABDEB'),
  addition('Ocean', 'Grouper', '🐟', 'DEBE89'),
  addition('Ocean', 'Coral cod', '🐟', 'E7AC9F'),
  addition('Ocean', 'Mossy fishing bait', '◈', 'A5C18B'),
  addition('Ocean', 'Sticky fishing bait', '◈', 'BBC886'),
  addition('Ocean', 'Cold fishing bait', '◈', 'A5CDEF'),
  addition('Ocean', 'Stingy fishing bait', '◈', 'D8C985'),
  addition('Ocean', 'Heavy fishing bait', '◈', '9CCBCB'),
  addition('Equipment & Misc', 'Fishing supplies', '◈', 'A6D4D7', { kind: 'storage', note: 'An authored grouping for rods, bait, and fishing supplies.' }),
  addition('Equipment & Misc', 'Cooking ingredients', '✿', 'E7C98D', { kind: 'storage', note: 'An authored grouping for shared kitchen supplies.' }),
  addition('Equipment & Misc', 'Trinkets', '◆', 'CEB1E4', { kind: 'storage', status: 'special', note: 'An authored grouping for unlockable equipment.' }),
  addition('Equipment & Misc', 'Battle idols', '◆', 'DCAC89', { kind: 'storage', status: 'special', note: 'An authored grouping. Individual tiers are intentionally omitted.' }),
  addition('Equipment & Misc', 'Protection idols', '◆', 'A9C2DE', { kind: 'storage', status: 'special', note: 'An authored grouping. Individual tiers are intentionally omitted.' }),
]
export const CATALOG = [...BASELINE_ITEMS, ...ADDED_ITEMS]
export const DEFAULT_ITEM = CATALOG.find(item => item.name === 'Copper')!

export interface FilterOptions {
  query: string
  category: Category | 'All'
  collection: 'all' | 'favorites' | 'recent'
  favorites: string[]
  recent: string[]
  includeSpecial: boolean
  includeExtended: boolean
  sort: 'progression' | 'alphabetical'
}

export function filterCatalog(items: CatalogItem[], options: FilterOptions): CatalogItem[] {
  const query = options.query.trim().toLocaleLowerCase()
  const result = items.filter(item => {
    if (item.status === 'special' && !options.includeSpecial) return false
    if (['legacy', 'later'].includes(item.status) && !options.includeExtended) return false
    if (options.category !== 'All' && item.category !== options.category) return false
    if (options.collection === 'favorites' && !options.favorites.includes(item.id)) return false
    if (options.collection === 'recent' && !options.recent.includes(item.id)) return false
    return !query || `${item.name} ${item.alias ?? ''}`.toLocaleLowerCase().includes(query)
  })
  if (options.collection === 'recent') return result.sort((a, b) => options.recent.indexOf(a.id) - options.recent.indexOf(b.id))
  if (options.sort === 'alphabetical') return result.sort((a, b) => a.name.localeCompare(b.name))
  return result.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category))
}
