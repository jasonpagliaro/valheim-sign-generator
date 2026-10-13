import { Copy, Star, Clock3, Search, X, SlidersHorizontal, Plus, Trees, Mountain, Waves, Utensils, Axe, Leaf, Sprout, Flame, Layers } from 'lucide-react'
import { CATALOG, CATEGORIES, filterCatalog, type CatalogItem, type Category, type FilterOptions } from '../data/catalog'

const categoryIcons: Record<Category, typeof Leaf> = { Meadows: Leaf, 'Black Forest': Trees, Swamp: Sprout, Mountains: Mountain, Plains: Flame, Mistlands: Trees, Ashlands: Flame, 'Deep North': Mountain, Ocean: Waves, 'Food & Mead': Utensils, 'Equipment & Misc': Axe }
function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase())
  if (!query.trim() || index < 0) return <>{text}</>
  const end = index + query.trim().length
  return <>{text.slice(0, index)}<mark>{text.slice(index, end)}</mark>{text.slice(end)}</>
}
interface Props {
  filters: FilterOptions
  setFilters: (change: Partial<FilterOptions>) => void
  selectedId: string | null
  onSelect: (item: CatalogItem) => void
  onCopy: (item: CatalogItem) => void
  onFavorite: (id: string) => void
  onCustom: (text?: string) => void
  copied: string
}
export default function Catalog({ filters, setFilters, selectedId, onSelect, onCopy, onFavorite, onCustom, copied }: Props) {
  const items = filterCatalog(CATALOG, filters)
  const inScope = filterCatalog(CATALOG, { ...filters, category: 'All', query: '', collection: 'all' })
  return <section className="catalog-panel panel" aria-labelledby="catalog-title" id="catalog">
    <div className="catalog-heading"><div><span className="eyebrow">01 · THE STORES</span><h2 id="catalog-title">Find your resource</h2></div><span className="count-badge">{inScope.length}</span></div>
    <div className="search-field"><Search size={17} aria-hidden="true" /><input aria-label="Search items" placeholder="Search your stores…" value={filters.query} onChange={event => setFilters({ query: event.target.value })} />{filters.query && <button className="icon-button" aria-label="Clear search" onClick={() => setFilters({ query: '' })}><X size={15} /></button>}<kbd>/</kbd></div>
    <div className="collection-tabs" aria-label="Catalog collection">
      <button aria-pressed={filters.collection === 'all'} onClick={() => setFilters({ collection: 'all' })}>All labels</button>
      <button aria-pressed={filters.collection === 'groups'} onClick={() => setFilters({ collection: 'groups', category: 'All' })}><Layers size={13} /> Groups</button>
      <button aria-pressed={filters.collection === 'favorites'} onClick={() => setFilters({ collection: 'favorites' })}><Star size={13} /> Favorites</button>
      <button aria-pressed={filters.collection === 'recent'} onClick={() => setFilters({ collection: 'recent' })}><Clock3 size={13} /> Recent</button>
    </div>
    <div className="category-chips" aria-label="Filter by category">
      <button aria-pressed={filters.category === 'All'} onClick={() => setFilters({ category: 'All' })}>All biomes <span>{inScope.length}</span></button>
      {CATEGORIES.map(category => { const Icon = categoryIcons[category]; return <button key={category} aria-pressed={filters.category === category} onClick={() => setFilters({ category })}><Icon size={13} />{category}<span>{inScope.filter(item => item.category === category).length}</span></button> })}
    </div>
    <details className="catalog-options"><summary><SlidersHorizontal size={13} /> Scope & sorting</summary><div className="options-body">
      <label className="check-label"><input type="checkbox" checked={filters.includeSpecial} onChange={event => setFilters({ includeSpecial: event.target.checked })} /> Show bosses, keys & unlockables</label>
      <label className="check-label"><input type="checkbox" checked={filters.includeExtended} onChange={event => setFilters({ includeExtended: event.target.checked })} /> Show legacy & unverified original labels</label>
      <label className="inline-field">Sort by <select value={filters.sort} onChange={event => setFilters({ sort: event.target.value as FilterOptions['sort'] })}><option value="progression">Progression</option><option value="alphabetical">A–Z</option></select></label>
    </div></details>
    <div className="list-heading"><span>{filters.category === 'All' ? 'YOUR CATALOG' : filters.category.toUpperCase()}</span><span aria-live="polite">{items.length} {items.length === 1 ? 'label' : 'labels'}</span></div>
    <div className="item-list" aria-label="Items">
      {items.map(item => <div className={`item-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id}>
        <button className="item-select" onClick={() => onSelect(item)} aria-label={`Edit ${item.name}`} aria-pressed={selectedId === item.id}>
          <span className="item-symbol" style={{ color: `#${item.color}`, backgroundColor: `#${item.color}0C` }} aria-hidden="true">{item.symbol}</span>
          <span className="item-info"><span className="item-name"><Highlight text={item.name} query={filters.query} />{item.kind ? <span className="item-tag">group</span> : item.status !== 'practical' && <span className="item-tag">{item.status}</span>}</span><span className="item-category">{item.alias ? <><Highlight text={item.alias} query={filters.query} /> · </> : ''}{item.category}</span></span>
        </button>
        <button className={`icon-button favorite ${filters.favorites.includes(item.id) ? 'is-favorite' : ''}`} title={filters.favorites.includes(item.id) ? 'Remove favorite' : 'Add favorite'} aria-label={`${filters.favorites.includes(item.id) ? 'Unfavorite' : 'Favorite'} ${item.name}`} aria-pressed={filters.favorites.includes(item.id)} onClick={() => onFavorite(item.id)}><Star size={15} fill={filters.favorites.includes(item.id) ? 'currentColor' : 'none'} /></button>
        <button className="icon-button row-copy" aria-label={`Copy ${item.name}`} title="Copy default label using current preset" onClick={() => onCopy(item)}>{copied === item.id ? <span className="small-check">✓</span> : <Copy size={15} />}</button>
      </div>)}
      {items.length === 0 && <div className="empty-state"><Search size={26} /><h3>No resources here yet</h3><p>{filters.collection === 'favorites' ? 'Use the star beside any item to save it here.' : filters.collection === 'recent' ? 'Select or copy a resource to begin your recent list.' : 'Try another name, biome, or scope setting.'}</p><button className="text-button" onClick={() => setFilters({ query: '', category: 'All', collection: 'all' })}>Show all resources</button></div>}
    </div>
    <button className="custom-button" onClick={() => onCustom(filters.query.trim())}><Plus size={17} />{filters.query.trim() ? 'Make a sign from this search' : 'Create a custom label'}<span>↗</span></button>
    <p className="catalog-footnote">Meadows to the Deep North. Items and storage groups.<br />Custom text is temporary and never auto-saved.</p>
  </section>
}
