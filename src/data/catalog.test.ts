import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import baseline from './baseline.json'
import inventory from './current-items.json'
import census from '../../docs/inventory-census.json'
import { BASELINE_ITEMS, BASELINE_CATEGORIES, ADDED_ITEMS, CATALOG, CATEGORIES, filterCatalog, type FilterOptions } from './catalog'

const filters: FilterOptions = { query: '', category: 'All', collection: 'all', favorites: [], recent: [], includeSpecial: true, includeExtended: false, sort: 'progression' }
describe('Catalog integrity and discovery', () => {
  it('preserves all 184 original name/symbol/color tuples byte-for-byte after JSON normalization', () => {
    expect(BASELINE_ITEMS).toHaveLength(184)
    expect(BASELINE_CATEGORIES.map(category => baseline[category].length)).toEqual([26, 29, 23, 21, 20, 7, 34, 24])
    expect(createHash('sha256').update(JSON.stringify(baseline)).digest('hex')).toBe('dae042445707aab515f2f34d4f15efc9e92feddec0c1f2f738838cea12705abd')
    for (const item of BASELINE_ITEMS) expect(baseline[item.category as keyof typeof baseline]).toContainEqual([item.name, item.symbol, item.color])
  })
  it('has valid colors, unique IDs, and distinct provenance', () => {
    expect(CATALOG).toHaveLength(943)
    expect(ADDED_ITEMS).toHaveLength(759)
    expect(new Set(CATALOG.map(item => item.id)).size).toBe(CATALOG.length)
    for (const item of CATALOG) { expect(item.color).toMatch(/^[A-F0-9]{6}$/); expect(item.name).not.toBe(''); expect(CATEGORIES).toContain(item.category) }
    expect(ADDED_ITEMS.every(item => item.source === 'addition')).toBe(true)
  })
  it('covers every accepted inventory identity exactly once and accounts for the native census', () => {
    const accepted = census.available.map(item => item.prefab).sort()
    const represented = CATALOG.flatMap(item => item.prefabs ?? []).sort()
    expect(inventory.items).toHaveLength(893)
    expect(inventory.items.map(item => item.prefab).sort()).toEqual(accepted)
    expect(represented).toEqual(accepted)
    expect(CATALOG.filter(item => !item.prefabs?.length && !item.kind && item.status !== 'legacy')).toEqual([])
    const allIds = [...accepted, ...census.excluded.map(item => item.prefab), ...census.unresolved.map(item => item.prefab)]
    expect(allIds).toHaveLength(1519)
    expect(new Set(allIds).size).toBe(1519)
    expect(CATALOG.some(item => item.prefabs?.includes('MushroomBlue'))).toBe(false)
  })
  it('includes complete equipment, crafting, fishing, and conditional families', () => {
    expect(inventory.items.filter(item => item.name.startsWith('Mould:'))).toHaveLength(29)
    expect(inventory.items.filter(item => item.name.startsWith('Cast:'))).toHaveLength(29)
    expect(inventory.items.filter(item => /Upgrader/.test(item.prefab))).toHaveLength(16)
    expect(inventory.items.filter(item => item.itemType === 'Trinket')).toHaveLength(15)
    expect(inventory.items.filter(item => item.itemType === 'Fish')).toHaveLength(12)
    expect(inventory.items.filter(item => /^Feast.*_Material$/.test(item.prefab))).toHaveLength(9)
    const conditional = census.available.filter(item => item.conditions.length)
    expect(conditional).toHaveLength(5)
    for (const item of conditional) expect(CATALOG.find(label => label.prefabs?.includes(item.prefab))).toMatchObject({ status: 'special', note: expect.stringMatching(/Seasonal|entitlement/) })
    for (const [name, category] of [['Yggdrasil Wood', 'Mistlands'], ['Ashwood', 'Ashlands'], ['Timberwood', 'Deep North']]) expect(CATALOG.find(item => item.name === name)?.category).toBe(category)
    expect(filterCatalog(CATALOG, { ...filters, query: 'Fader Relic' }).map(item => item.name)).toContain('Kindled Ribs')
  })
  it('separates similar item names and searches aliases', () => {
    expect(filterCatalog(CATALOG, { ...filters, query: 'copper' }).map(item => item.name)).toEqual(expect.arrayContaining(['Copper ore', 'Copper']))
    expect(filterCatalog(CATALOG, { ...filters, query: 'ACORNS' }).map(item => item.name)).toContain('Oak seeds')
    expect(filterCatalog(CATALOG, { ...filters, query: 'finewood' })[0].name).toBe('Fine wood')
  })
  it('combines search and category', () => {
    expect(filterCatalog(CATALOG, { ...filters, category: 'Mountains', query: 'wolf' }).map(item => item.name)).toEqual(expect.arrayContaining(['Wolf pelt', 'Wolf fang', 'Wolf meat', 'Wolf trophy']))
    expect(filterCatalog(CATALOG, { ...filters, category: 'Meadows', query: 'silver' })).toEqual([])
  })
  it('shows current progression items by default while keeping legacy originals opt-in', () => {
    expect(filterCatalog(CATALOG, filters).every(item => item.status !== 'legacy')).toBe(true)
    expect(filterCatalog(CATALOG, { ...filters, includeExtended: true })).toHaveLength(CATALOG.length)
    expect(filterCatalog(CATALOG, { ...filters, query: 'Yagluth' }).map(item => item.name)).toEqual(expect.arrayContaining(['Yagluth trophy']))
    expect(filterCatalog(CATALOG, { ...filters, query: 'Yagluth' }).map(item => item.name)).not.toContain('Yagluth thing')
    expect(filterCatalog(CATALOG, { ...filters, includeSpecial: false }).every(item => item.status !== 'special')).toBe(true)
  })
  it('offers useful storage groups and finds them by member names', () => {
    const groups = filterCatalog(CATALOG, { ...filters, collection: 'groups' })
    expect(groups.every(item => item.kind === 'storage')).toBe(true)
    expect(groups.map(item => item.name)).toEqual(expect.arrayContaining(['Hides & leather', 'Wood & bark', 'Mushrooms', 'Berries', 'Fish']))
    for (const [query, name] of [['troll hide', 'Hides & leather'], ['blueberries', 'Berries'], ['corewood', 'Wood & bark'], ['perch', 'Fish']]) expect(filterCatalog(CATALOG, { ...filters, collection: 'groups', query }).map(item => item.name)).toContain(name)
    expect(groups.find(item => item.name === 'Fish')?.searchTerms).not.toContain('Raw fish')
    for (const [name, members] of [
      ['Wood & bark', ['Wood', 'Finewood', 'Corewood', 'Ancient bark', 'Yggdrasil Wood', 'Ashwood', 'Timberwood']],
      ['Hides & leather', ['Bear hide', 'Troll hide', 'Scale Hide', 'Asksvin Hide', 'Moose Hide', 'Seal Pelt', 'Leather Straps']],
      ['Mushrooms', ['Mushroom', 'Yellow mushroom', 'Jotun Puffs', 'Magecap', 'Smoke Puff', 'Toadstool']],
      ['Berries', ['Raspberries', 'Blueberries', 'Cloudberries', 'Vineberry Cluster', 'Lingonberries']],
      ['Fish', ['Perch', 'Anglerfish', 'Northern Salmon', 'Magmafish', 'Pufferfish']],
    ] as const) expect(groups.find(item => item.name === name)?.searchTerms).toEqual(expect.arrayContaining([...members]))
    expect(groups.find(item => item.name === 'Hides & leather')?.searchTerms).not.toContain('Troll Leather Cape')
    expect(groups.find(item => item.name === 'Mushrooms')?.searchTerms).not.toContain('Blue Mushroom')
  })
  it('filters favorites, orders recent items, and sorts alphabetically', () => {
    const [a, b] = CATALOG
    expect(filterCatalog(CATALOG, { ...filters, collection: 'favorites', favorites: [b.id] })).toEqual([b])
    expect(filterCatalog(CATALOG, { ...filters, collection: 'recent', recent: [b.id, a.id] })).toEqual([b, a])
    const sorted = filterCatalog(CATALOG, { ...filters, sort: 'alphabetical' })
    expect(sorted.map(item => item.name)).toEqual([...sorted].map(item => item.name).sort((x, y) => x.localeCompare(y)))
  })
})
