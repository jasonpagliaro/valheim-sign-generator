import { Copy, Check, ArrowRight, Code2, Info, AlertTriangle, Link2, Download, Upload, BookOpen, Layers } from 'lucide-react'
import { asciiFallback, generateSign, SIGN_LIMIT, type SignConfig } from '../lib/sign'
interface Props {
  sign: SignConfig
  copied: string
  onCopy: (text: string, key: string, success?: string) => void
  patch: (change: Partial<SignConfig>) => void
  onShare: () => void
  onExport: () => void
  onImport: () => void
  onGuide: () => void
  onBatch: () => void
  batchCount: number
  batchName: string
}
export default function SignOutput({ sign, copied, onCopy, patch, onShare, onExport, onImport, onGuide, onBatch, batchCount, batchName }: Props) {
  const result = generateSign(sign)
  const ascii = asciiFallback(sign).replace(/\n/g, '\\n')
  const plain = result.text.replace(/\n/g, '\\n')
  const invalid = result.errors.length > 0
  const missingGlyph = [...result.text].some(char => '♛♜⚿✦✧➤⬡'.includes(char))
  const asciiHasLiteralEscape = /\\[nt]/.test(asciiFallback(sign))
  return <aside className="output-column" aria-label="Copy and export">
    <section className="output-panel panel">
      <header className="section-heading"><div><span className="eyebrow">03 · READY FOR YOUR HALL</span><h2>Your sign code</h2></div><Code2 className="gold" size={21} /></header>
      <div className="mode-control"><button aria-pressed={sign.compact} onClick={() => patch({ compact: true })}>Compact</button><button aria-pressed={!sign.compact} onClick={() => patch({ compact: false })}>Closed tags</button></div>
      <p className="mode-caption">{sign.compact ? 'Same sign. Fewer characters.' : 'Explicit closing tags use more space.'}</p>
      <textarea aria-label="Generated markup" className="code-output" value={result.markup} readOnly spellCheck={false} onFocus={event => event.currentTarget.select()} />
      <div className={`length-display ${result.overLimit ? 'over-limit' : ''}`} aria-live="polite"><span><strong>{result.length.utf16}</strong> / {SIGN_LIMIT} units</span><span>{result.overLimit ? `${-result.remaining} over limit` : `${result.remaining} remaining`}</span></div>
      <div className={`capacity-bar ${result.overLimit ? 'over-limit' : ''}`} aria-hidden="true"><span style={{ width: `${Math.min(100, result.length.utf16 / SIGN_LIMIT * 100)}%` }} /></div>
      <details className="length-details"><summary>What counts toward the limit?</summary><p>Every tag and symbol counts. This output uses {result.length.utf16} UTF-16 units, {result.length.codePoints} Unicode code points, and {result.length.utf8Bytes} UTF-8 bytes. Valheim checks the first number.</p></details>
      {result.overLimit && <div className="warning-box" role="alert"><AlertTriangle size={16} /><span>This code is too long for a vanilla sign. Shorten the label, remove a symbol, or use fewer formatting tags. Your text has been kept in full.</span></div>}
      {result.errors.map(error => <p className="error-message" role="alert" key={error}>{error}</p>)}
      <button className="primary-button copy-sign" disabled={invalid || result.overLimit} onClick={() => onCopy(result.markup, 'markup', 'Sign code copied. Your stores await.')}><span>{copied === 'markup' ? <Check size={17} /> : <Copy size={17} />}{copied === 'markup' ? 'Copied to clipboard' : 'Copy sign code'}</span><ArrowRight size={17} /></button>
      <button className="secondary-button" disabled={invalid || plain.length > SIGN_LIMIT} onClick={() => onCopy(plain, 'plain', 'Plain text copied.')}><Copy size={14} />{copied === 'plain' ? 'Plain text copied' : 'Copy plain text'}</button>
      <span className="shortcut-hint"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> to copy · ⌘ on Mac</span>
      <div className="glyph-note"><Info size={16} /><div><strong>{missingGlyph ? 'This label may have a missing glyph' : 'A note on symbols'}</strong><p>{missingGlyph ? 'A symbol in this label was absent from the inspected vanilla sign fonts. Its original is preserved; the fallback below avoids it.' : 'Browser emoji can look different in Valheim. If a symbol becomes a square in-game, use a simple label.'}</p><button className="text-button" disabled={!ascii.trim() || ascii.length > SIGN_LIMIT || asciiHasLiteralEscape} onClick={() => onCopy(ascii, 'ascii', 'ASCII fallback copied, without symbols or formatting.')}><Copy size={12} />{copied === 'ascii' ? 'Fallback copied' : 'Copy ASCII fallback'}</button><code className="fallback-preview">{ascii || 'Add sign text first'}</code>{ascii.includes('?') && <p>Non-ASCII letters without a Latin equivalent become “?”. Review before use.</p>}</div></div>
      <div className="utility-buttons"><button onClick={onShare}><Link2 size={15} /> Share sign</button><button onClick={onExport}><Download size={15} /> Export JSON</button><button onClick={onImport}><Upload size={15} /> Import JSON</button></div>
    </section>
    <section className="batch-panel panel"><div className="mini-icon"><Layers size={19} /></div><h3>Organize the whole chest room</h3><p>Copy {batchCount} {batchName} labels as a structured JSON list, ready to save or use one by one.</p><button className="secondary-button" onClick={onBatch} disabled={batchCount === 0}><Copy size={14} />{copied === 'batch' ? 'Labels copied' : `Copy ${batchName}`}</button></section>
    <button className="guide-link" onClick={onGuide}><BookOpen size={17} /><span>New to sign formatting?<small>A quick guide to tags & compatibility</small></span><ArrowRight size={15} /></button>
  </aside>
}
