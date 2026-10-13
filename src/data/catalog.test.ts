import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import baseline from './baseline.json'
import { BASELINE_ITEMS, ADDED_ITEMS, CATALOG, CATEGORIES, filterCatalog, type FilterOptions } from './catalog'

const filters: FilterOptions = { query: '', category: 'All', collection: 'all', favorites: [], recent: [], includeSpecial: false, includeExtended: false, sort: 'progression' }
describe('Catalog integrity and discovery', () => {
  it('preserves all 184 original name/symbol/color tuples byte-for-byte after JSON normalization', () => {
    expect(BASELINE_ITEMS).toHaveLength(184)
    expect(CATEGORIES.map(category => baseline[category].length)).toEqual([26, 29, 23, 21, 20, 7, 34, 24])
    expect(createHash('sha256').update(JSON.stringify(baseline)).digest('hex')).toBe('dae042445707aab515f2f34d4f15efc9e92feddec0c1f2f738838cea12705abd')
    for (const item of BASELINE_ITEMS) expect(baseline[item.category]).toContainEqual([item.name, item.symbol, item.color])
  })
  it('has valid colors, unique IDs, and distinct provenance', () => {
    expect(CATALOG).toHaveLength(221)
    expect(ADDED_ITEMS).toHaveLength(37)
    expect(new Set(CATALOG.map(item => item.id)).size).toBe(CATALOG.length)
    for (const item of CATALOG) { expect(item.color).toMatch(/^[A-F0-9]{6}$/); expect(item.name).not.toBe(''); expect(CATEGORIES).toContain(item.category) }
    expect(ADDED_ITEMS.every(item => item.source === 'addition')).toBe(true)
  })
  it('separates similar item names and searches aliases', () => {
    expect(filterCatalog(CATALOG, { ...filters, query: 'copper' }).map(item => item.name)).toEqual(['Copper ore', 'Copper'])
    expect(filterCatalog(CATALOG, { ...filters, query: 'ACORNS' }).map(item => item.name)).toEqual(['Oak seeds'])
    expect(filterCatalog(CATALOG, { ...filters, query: 'finewood' })[0].name).toBe('Fine wood')
  })
  it('combines search and category', () => {
    expect(filterCatalog(CATALOG, { ...filters, category: 'Mountains', query: 'wolf' }).map(item => item.name)).toEqual(['Wolf pelt', 'Wolf fang', 'Wolf meat', 'Wolf trophy'])
    expect(filterCatalog(CATALOG, { ...filters, category: 'Meadows', query: 'silver' })).toEqual([])
  })
  it('hides special, later, and legacy entries by default', () => {
    expect(filterCatalog(CATALOG, filters).every(item => item.status === 'practical')).toBe(true)
    expect(filterCatalog(CATALOG, { ...filters, includeSpecial: true, includeExtended: true })).toHaveLength(221)
    expect(filterCatalog(CATALOG, { ...filters, query: 'Yagluth' })).toEqual([])
  })
  it('filters favorites, orders recent items, and sorts alphabetically', () => {
    const [a, b] = CATALOG
    expect(filterCatalog(CATALOG, { ...filters, collection: 'favorites', favorites: [b.id] })).toEqual([b])
    expect(filterCatalog(CATALOG, { ...filters, collection: 'recent', recent: [b.id, a.id] })).toEqual([b, a])
    const sorted = filterCatalog(CATALOG, { ...filters, sort: 'alphabetical' })
    expect(sorted.map(item => item.name)).toEqual([...sorted].map(item => item.name).sort((x, y) => x.localeCompare(y)))
  })
})
