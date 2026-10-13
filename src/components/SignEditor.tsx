import { Bold, Italic, RotateCcw, Sun, Moon, AlignCenter, AlignLeft, AlignRight, Sparkles, ChevronDown } from 'lucide-react'
import type { CatalogItem } from '../data/catalog'
import { normalizeHex, plainText, PRESETS, shortLabel, type SignConfig, type Preset } from '../lib/sign'

const PALETTES = { 'Resources': ['8CD66E', 'E8A575', 'E9AE52', 'C5D6DE', 'C9EEFF', 'B0B9D3', 'F38B6F', 'D9ACF1'], 'Hearth': ['E3BF7B', 'F0DAB4', 'D19569', 'E5AB7A', 'C5CAA0', '9DAF9A', 'FAECDC', 'FFFFFF'] }
interface Props {
  sign: SignConfig
  wood: 'dark' | 'light'
  item?: CatalogItem
  custom: boolean
  patch: (change: Partial<SignConfig>) => void
  setWood: (wood: 'dark' | 'light') => void
  onPreset: (preset: Preset) => void
  onReset: () => void
}
export default function SignEditor({ sign, wood, item, custom, patch, setWood, onPreset, onReset }: Props) {
  const text = plainText(sign)
  return <section className="editor-panel panel" id="workshop" aria-labelledby="editor-title">
    <header className="section-heading"><div><span className="eyebrow">02 · THE WORKBENCH</span><h2 id="editor-title">Make your mark</h2></div><span className="live-badge"><i /> Live preview</span></header>
    <div className={`preview-scene ${wood}`}>
      <div className="scene-grain" aria-hidden="true" />
      <span className="preview-corner tl" aria-hidden="true" /><span className="preview-corner br" aria-hidden="true" />
      <div className="wood-sign" role="img" aria-label={`Sign preview: ${text || 'Empty sign'}`}>
        <i className="nail nail-tl" /><i className="nail nail-tr" /><i className="nail nail-bl" /><i className="nail nail-br" />
        <div className="sign-letters" data-testid="sign-preview" style={{ color: `#${normalizeHex(sign.color) ?? 'FFFFFF'}`, fontWeight: sign.bold ? 700 : 400, fontStyle: sign.italic ? 'italic' : 'normal', fontSize: sign.size ? `${sign.size * 6}px` : '36px', textAlign: sign.advanced ? sign.alignment : 'center' }}>{text || 'YOUR SIGN HERE'}</div>
      </div>
      <div className="preview-bottom"><span>WOODEN SIGN · APPROXIMATION</span><div className="wood-toggle" aria-label="Preview wood"><button aria-label="Dark wood" aria-pressed={wood === 'dark'} onClick={() => setWood('dark')}><Moon size={13} /></button><button aria-label="Light wood" aria-pressed={wood === 'light'} onClick={() => setWood('light')}><Sun size={14} /></button></div></div>
    </div>
    <p className="preview-caption">A little imagination, a little timber. The game auto-fits text; size and glyphs may differ.</p>
    <div className="editor-form">
      <div className="form-section-title"><h3><Sparkles size={14} /> Start with a style</h3><div className="flex gap-3"><button className="text-button" onClick={() => patch({ text: '' })}>Clear</button><button className="text-button" onClick={onReset}><RotateCcw size={12} /> Reset</button></div></div>
      <div className="preset-grid" aria-label="Formatting presets">{PRESETS.map(preset => <button key={preset} aria-pressed={sign.preset === preset} onClick={() => onPreset(preset)}>{preset}</button>)}</div>
      {custom && <p className="draft-notice"><strong>Temporary custom sign</strong>Type anything below. It stays in this tab and is never added to the catalog or saved in your browser.</p>}
      <div className="field-label"><label htmlFor="sign-text">Sign text</label><span>Make it yours</span></div>
      <textarea id="sign-text" className="text-editor" value={sign.text} placeholder="e.g. NORTH GATE or SMELTER SUPPLIES" rows={sign.advanced ? 3 : 2} spellCheck={false} onChange={event => patch({ text: event.target.value })} />
      <p className="item-note">Text edits are temporary. Copy your sign before closing or reloading this page.</p>
      {item?.note && <p className="item-note">{item.note}</p>}
      {shortLabel(sign.text) !== sign.text && <button className="shorten-button" onClick={() => patch({ text: shortLabel(sign.text) })}>Use shorter label: <strong>{shortLabel(sign.text)}</strong></button>}
      <div className="format-grid">
        <div><label className="field-label" htmlFor="hex-color">Text color</label><div className="color-control"><input type="color" aria-label="Choose text color" value={`#${normalizeHex(sign.color) ?? 'FFFFFF'}`} onChange={event => patch({ color: event.target.value.slice(1).toUpperCase() })} /><span>#</span><input id="hex-color" value={sign.color} aria-invalid={!normalizeHex(sign.color)} onChange={event => patch({ color: event.target.value.replace(/^#/, '') })} onBlur={() => { const color = normalizeHex(sign.color); if (color) patch({ color }) }} spellCheck={false} /></div></div>
        <div><span className="field-label">Text style</span><div className="style-buttons"><button aria-label="Bold" aria-pressed={sign.bold} onClick={() => patch({ bold: !sign.bold })}><Bold size={16} /></button><button aria-label="Italic" aria-pressed={sign.italic} onClick={() => patch({ italic: !sign.italic })}><Italic size={16} /></button></div></div>
        <div><label className="field-label" htmlFor="text-size">Size</label><select id="text-size" value={sign.size} onChange={event => patch({ size: Number(event.target.value) })}><option value={0}>Default</option><option value={4}>Small · 4</option><option value={6}>Medium · 6</option><option value={8}>Large · 8</option><option value={12}>Huge · 12</option>{![0, 4, 6, 8, 12].includes(sign.size) && <option value={sign.size}>Custom · {sign.size}</option>}</select></div>
      </div>
      <div className="palette-row"><span>Resource palette</span><div>{PALETTES.Resources.map(color => <button key={color} className="swatch" aria-label={`Use color #${color}`} aria-pressed={normalizeHex(sign.color) === color} style={{ background: `#${color}` }} onClick={() => patch({ color })} />)}</div></div>
      <div className="symbol-grid"><div><label className="field-label" htmlFor="symbol">Symbol <span>Glyph-dependent</span></label><div className="symbol-control"><input id="symbol" value={sign.symbol} disabled={!sign.symbolEnabled} onChange={event => patch({ symbol: event.target.value })} /><label className="check-label"><input type="checkbox" checked={sign.symbolEnabled} onChange={event => patch({ symbolEnabled: event.target.checked })} /> Include</label></div></div><div><label className="field-label" htmlFor="symbol-position">Position</label><select id="symbol-position" value={sign.symbolPosition} disabled={!sign.symbolEnabled} onChange={event => patch({ symbolPosition: event.target.value as SignConfig['symbolPosition'] })}><option value="before">Before text</option><option value="after">After text</option>{sign.advanced && <option value="above">Above text</option>}</select></div></div>
      <details className="advanced-controls"><summary><span><ChevronDown size={14} /> Advanced formatting</span><span className="experimental-badge">Opt-in</span></summary><div className="advanced-body">
        <label className="check-label"><input type="checkbox" checked={sign.advanced} onChange={event => patch({ advanced: event.target.checked, symbolPosition: sign.symbolPosition === 'above' ? 'before' : sign.symbolPosition })} /> Enable alignment & multiple lines</label>
        <p className="muted">These tags are understood by the renderer, but layout can overflow a small sign. Preview alignment is approximate. New lines become <code>\n</code> when copied.</p>
        <div className="inline-field"><span>Alignment</span><div className="style-buttons">{(['left', 'center', 'right'] as const).map((alignment, index) => { const Icon = [AlignLeft, AlignCenter, AlignRight][index]; return <button key={alignment} disabled={!sign.advanced} aria-label={`Align ${alignment}`} aria-pressed={sign.alignment === alignment} onClick={() => patch({ alignment })}><Icon size={16} /></button> })}</div></div>
        <div className="palette-row"><span>Hearth palette</span><div>{PALETTES.Hearth.map(color => <button key={color} className="swatch" aria-label={`Use hearth color #${color}`} aria-pressed={normalizeHex(sign.color) === color} style={{ background: `#${color}` }} onClick={() => patch({ color })} />)}</div></div>
      </div></details>
    </div>
  </section>
}
