import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BookOpen, Check, Code2, Hammer, Info, X } from 'lucide-react'
import Catalog from './components/Catalog'
import SignEditor from './components/SignEditor'
import SignOutput from './components/SignOutput'
import Guide from './components/Guide'
import { CATALOG, DEFAULT_ITEM, filterCatalog, type CatalogItem, type FilterOptions } from './data/catalog'
import { applyPreset, exportCategory, generateSign, itemSign, type Preset, type SignConfig } from './lib/sign'
import { addRecent, createShareUrl, loadPreferences, parseSignFile, readSharedSign, savePreferences, serializeSign } from './lib/storage'
import { copyText } from './lib/clipboard'

function bootstrap() {
  let saved = null
  let error = ''
  try { saved = loadPreferences(window.localStorage) } catch { error = 'Browser storage is unavailable. You can still create, copy, and export signs.' }
  let shared = null
  try { shared = readSharedSign(window.location.search) } catch { error = 'This shared sign could not be read. Your saved workspace is open instead.' }
  return { sign: shared?.sign ?? saved?.sign ?? itemSign(DEFAULT_ITEM), wood: shared?.wood ?? saved?.wood ?? 'dark' as const, favorites: saved?.favorites ?? [], recent: saved?.recent ?? [], shared: !!shared, saved, error }
}

export default function App() {
  const [initial] = useState(bootstrap)
  const [sign, setSign] = useState(initial.sign)
  const [wood, setWood] = useState<'dark' | 'light'>(initial.wood)
  const [selectedId, setSelectedId] = useState<string | null>(CATALOG.find(item => item.name === initial.sign.name)?.id ?? null)
  const [favorites, setFavorites] = useState(initial.favorites)
  const [recent, setRecent] = useState(initial.recent)
  const [filters, setFilters] = useState<Omit<FilterOptions, 'favorites' | 'recent'>>({ query: '', category: 'All', collection: 'all', includeSpecial: false, includeExtended: false, sort: 'progression' })
  const [copied, setCopied] = useState('')
  const [notice, setNotice] = useState(initial.error)
  const [manualCopy, setManualCopy] = useState<string | null>(null)
  const guideRef = useRef<HTMLDialogElement>(null)
  const manualRef = useRef<HTMLDialogElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const storageWarningRef = useRef<HTMLParagraphElement>(null)
  const selectedItem = CATALOG.find(item => item.id === selectedId)

  useEffect(() => {
    let saved = false
    try {
      saved = savePreferences(window.localStorage, {
        sign: initial.shared ? initial.saved?.sign ?? itemSign(DEFAULT_ITEM) : sign,
        wood: initial.shared ? initial.saved?.wood ?? 'dark' : wood, favorites, recent,
      })
    } catch { /* Access to localStorage itself can be restricted. */ }
    if (storageWarningRef.current) storageWarningRef.current.hidden = saved
  }, [sign, wood, favorites, recent, initial])
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(''), 2500)
    return () => window.clearTimeout(timer)
  }, [copied])
  useEffect(() => { if (manualCopy !== null && !manualRef.current?.open) manualRef.current?.showModal() }, [manualCopy])

  const copy = useCallback(async (text: string, key: string, success = 'Copied to clipboard.') => {
    if (await copyText(text)) { setCopied(key); setNotice(success) }
    else { setManualCopy(text); setNotice('Clipboard access was blocked. Select and copy the text in the open dialog.') }
  }, [])
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key === '/' && !target.matches('input, textarea, select, [contenteditable="true"]')) {
        event.preventDefault(); document.querySelector<HTMLInputElement>('input[aria-label="Search items"]')?.focus()
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        const result = generateSign(sign)
        if (!result.overLimit && !result.errors.length) void copy(result.markup, 'markup', 'Sign code copied. Your stores await.')
        else setNotice('This sign needs a shorter label or valid text before it can be copied.')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [sign, copy])

  function selectItem(item: CatalogItem) {
    setSign(itemSign(item, sign.preset)); setSelectedId(item.id); setRecent(current => addRecent(current, item.id))
  }
  function patch(change: Partial<SignConfig>) { setSign(current => ({ ...current, ...change })) }
  function choosePreset(preset: Preset) { setSign(current => applyPreset(current, preset, selectedItem?.color ?? current.color)) }
  function favorite(id: string) { setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]) }
  async function copyItem(item: CatalogItem) {
    const result = generateSign(itemSign(item, sign.preset))
    setRecent(current => addRecent(current, item.id))
    if (result.overLimit) { selectItem(item); setNotice(`${item.name} needs a shorter label with this preset. It is open in the editor.`); return }
    await copy(result.markup, item.id, `${item.name} label copied.`)
  }
  function createCustom() {
    setSelectedId(null); setSign(itemSign({ name: 'Custom label', symbol: '◆', color: 'E3BF7B' }));
    document.getElementById('workshop')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => document.getElementById('sign-text')?.focus({ preventScroll: true }), 150)
  }
  function exportFile() {
    const file = new Blob([serializeSign(sign, wood)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url; link.download = `${sign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 70) || 'custom'}-sign.json`
    link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Sign configuration exported as JSON.')
  }
  async function importFile(file: File) {
    try {
      if (file.size > 100000) throw new Error('Choose a sign configuration smaller than 100 KB.')
      const parsed = parseSignFile(JSON.parse(await file.text()))
      setSign(parsed.sign); setWood(parsed.wood); setSelectedId(CATALOG.find(item => item.name === parsed.sign.name)?.id ?? null)
      setNotice('Sign imported. Review it in the editor before copying.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'That file could not be imported.') }
  }
  const batchItems = filterCatalog(CATALOG, { ...filters, query: '', collection: 'all', favorites, recent })
  const result = generateSign(sign)
  return <>
    <a href="#workshop" className="skip-link">Skip to sign editor</a>
    <header className="app-header"><a href={window.location.pathname} className="brand" aria-label="Valheim Sign Generator home"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 42 42"><path d="M9 7h24L15 21l18 14H9l18-14z" /></svg></span><span>VALHEIM<span className="brand-subtitle">SIGN GENERATOR</span></span></a><nav aria-label="Main navigation"><a href="#workshop" className="active-nav"><Hammer size={15} /> Workshop</a><button onClick={() => guideRef.current?.showModal()}><BookOpen size={15} /> Field guide</button><a href="https://github.com/jasonpagliaro/valheim-sign-generator" target="_blank" rel="noreferrer" aria-label="View source on GitHub"><Code2 size={18} /><span className="github-label">GitHub</span><ArrowUpRight size={13} /></a></nav></header>
    <main className="app-main">
      <section className="intro"><div><div className="eyebrow intro-eyebrow"><span className="tiny-diamond" /> A PLACE FOR EVERY TREASURE</div><h1>Less searching. <em>More adventuring.</em></h1><p>Turn a chest full of chaos into a well-kept hall. Craft a sign, copy the code, make it home.</p></div><div className="intro-note"><span className="intro-rune" aria-hidden="true">ᛟ</span><span>MADE FOR YOUR WORLD<small>No mods. Just a little order.</small></span></div></section>
      {initial.shared && <div className="shared-banner"><LinkNotice />You’re editing a shared sign. Your saved editor preferences stay unchanged.</div>}
      <p ref={storageWarningRef} hidden className="warning-box">Local saving is unavailable in this browser. Use Export JSON to keep your work.</p>
      <div className="workspace"><Catalog filters={{ ...filters, favorites, recent }} setFilters={change => setFilters(current => ({ ...current, ...change }))} selectedId={selectedId} onSelect={selectItem} onCopy={item => void copyItem(item)} onFavorite={favorite} onCustom={createCustom} copied={copied} /><div className="crafting-area"><SignEditor sign={sign} wood={wood} item={selectedItem} custom={!selectedItem} patch={patch} setWood={setWood} onPreset={choosePreset} onReset={() => setSign(itemSign(selectedItem ?? { name: 'Custom label', symbol: '◆', color: 'E3BF7B' }))} /><SignOutput sign={sign} copied={copied} onCopy={(...args) => void copy(...args)} patch={patch} onShare={() => void copy(createShareUrl(sign, wood, window.location.href), 'share', 'Share link copied. It includes this sign, not your local preferences.')} onExport={exportFile} onImport={() => importRef.current?.click()} onGuide={() => guideRef.current?.showModal()} onBatch={() => void copy(exportCategory(batchItems, sign.preset), 'batch', `${batchItems.length} labels copied as JSON.`)} batchCount={batchItems.length} batchName={filters.category === 'All' ? 'catalog' : filters.category} /></div></div>
      <footer className="app-footer"><span className="footer-mark">ᛟ</span><p>Built for the quiet satisfaction of an organized chest.<small>Independent fan-made tool. Not affiliated with Iron Gate Studio.</small></p><span className="local-badge"><i /> All crafting happens in your browser</span></footer>
    </main>
    <div className="mobile-dock"><a href="#catalog">Catalog</a><a href="#workshop">Editor</a><button disabled={result.overLimit || !!result.errors.length} onClick={() => void copy(result.markup, 'markup', 'Sign code copied. Your stores await.')}><CopyDock copied={copied === 'markup'} /></button></div>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Info size={17} /><span>{notice}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></>}</div>
    <input ref={importRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import sign configuration" onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = '' }} />
    <Guide dialogRef={guideRef} />
    <dialog ref={manualRef} className="manual-dialog" aria-labelledby="manual-title" onClose={() => setManualCopy(null)}><h2 id="manual-title">Copy by hand</h2><p>Your browser could not write to the clipboard. Select this text and press Ctrl+C (⌘C on Mac), or long-press and copy on mobile.</p><textarea aria-label="Text for manual copy" value={manualCopy ?? ''} readOnly rows={6} onFocus={event => event.currentTarget.select()} autoFocus /><button className="primary-button" onClick={() => manualRef.current?.close()}>Done</button></dialog>
  </>
}
function LinkNotice() { return <Info size={16} aria-hidden="true" /> }
function CopyDock({ copied }: { copied: boolean }) { return <>{copied ? <Check size={15} /> : <Hammer size={15} />}{copied ? 'Copied' : 'Copy sign'}</> }
