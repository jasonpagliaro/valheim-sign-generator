import type { CatalogItem } from '../data/catalog'

// Installed vanilla build 25730771: Sign.m_characterLimit = 50, enforced by
// TMP_InputField against System.String.Length (UTF-16 code units), before
// TextInput replaces the two characters backslash+n with one line feed.
export const SIGN_LIMIT = 50
export const PRESETS = ['Resource Colors', 'Classic Viking', 'High Contrast', 'Minimal', 'Large Text', 'No Symbols'] as const
export type Preset = typeof PRESETS[number]
export interface SignConfig {
  name: string
  text: string
  color: string
  bold: boolean
  italic: boolean
  size: number
  symbol: string
  symbolEnabled: boolean
  symbolPosition: 'before' | 'after' | 'above'
  alignment: 'left' | 'center' | 'right'
  advanced: boolean
  compact: boolean
  preset: Preset
}
export const DEFAULT_FORMAT: Omit<SignConfig, 'name' | 'text' | 'color' | 'symbol'> = {
  bold: true, italic: false, size: 0, symbolEnabled: true,
  symbolPosition: 'before', alignment: 'center', advanced: false,
  compact: true, preset: 'Resource Colors',
}
export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(hex)) return [...hex].map(c => c + c).join('').toUpperCase()
  return /^[\da-f]{6}$/i.test(hex) ? hex.toUpperCase() : null
}
export function itemSign(item: Pick<CatalogItem, 'name' | 'color' | 'symbol'>, preset: Preset = 'Resource Colors'): SignConfig {
  return applyPreset({ ...DEFAULT_FORMAT, name: item.name, color: item.color, symbol: item.symbol, text: item.name.toUpperCase() }, preset, item.color)
}
export function applyPreset(sign: SignConfig, preset: Preset, resourceColor = sign.color): SignConfig {
  const base = { ...sign, ...DEFAULT_FORMAT, preset, color: resourceColor }
  switch (preset) {
    case 'Classic Viking': return { ...base, color: 'E3BF7B' }
    case 'High Contrast': return { ...base, color: 'FFFFFF', symbolEnabled: false }
    case 'Minimal': return { ...base, color: 'E8E5DA', bold: false, symbolEnabled: false }
    case 'Large Text': return { ...base, size: 8, symbolEnabled: false }
    case 'No Symbols': return { ...base, symbolEnabled: false }
    default: return base
  }
}
export function plainText(sign: SignConfig): string {
  const text = sign.text.replace(/\r\n?/g, '\n')
  if (!sign.symbolEnabled || !sign.symbol) return text
  if (sign.symbolPosition === 'after') return `${text} ${sign.symbol}`
  if (sign.symbolPosition === 'above' && sign.advanced) return `${sign.symbol}\n${text}`
  return `${sign.symbol} ${text}`
}
export function asciiFallback(sign: SignConfig): string {
  return sign.text.replace(/\r\n?/g, '\n').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e\n]/g, '?').replace(/</g, '(').replace(/>/g, ')')
}
export function countLength(text: string) {
  return { utf16: text.length, codePoints: [...text].length, utf8Bytes: new TextEncoder().encode(text).length }
}
export function generateSign(sign: SignConfig) {
  const color = normalizeHex(sign.color)
  const text = plainText(sign)
  const errors: string[] = []
  if (!color) errors.push('Enter a valid 3- or 6-digit hex color.')
  if (/[<>]/.test(text)) errors.push('Angle brackets are reserved for game tags. Remove them from your text or symbol before copying.')
  if ([...text].some(char => { const code = char.charCodeAt(0); return (code < 32 && code !== 10) || code === 127 })) errors.push('Remove control characters from your label before copying.')
  if (/\\[nt]/.test(text)) errors.push('Valheim interprets literal \\n and \\t as line breaks and tabs. Remove them, or enter an actual new line in Advanced mode.')
  if (!sign.advanced && text.includes('\n')) errors.push('Enable Advanced mode to use multiple lines, or remove the line break.')
  if (!text.trim()) errors.push('Add some sign text or a symbol before copying.')
  const open: string[] = [sign.compact ? `<#${color ?? 'FFFFFF'}>` : `<color=#${color ?? 'FFFFFF'}>`]
  const close: string[] = ['</color>']
  if (sign.bold) { open.push('<b>'); close.unshift('</b>') }
  if (sign.italic) { open.push('<i>'); close.unshift('</i>') }
  if (sign.size > 0) { open.push(`<size=${sign.size}>`); close.unshift('</size>') }
  if (sign.advanced && sign.alignment !== 'center') { open.push(`<align=${sign.alignment}>`); close.unshift('</align>') }
  const markup = open.join('') + text.replace(/\n/g, '\\n') + (sign.compact ? '' : close.join(''))
  const length = countLength(markup)
  return { markup, text, errors, length, remaining: SIGN_LIMIT - length.utf16, overLimit: length.utf16 > SIGN_LIMIT, hasUnicode: [...text].some(char => char.charCodeAt(0) > 127) }
}
export function shortLabel(text: string): string {
  return text.replace(/GREYDWARF/g, 'G.').replace(/BERSERKER/g, 'BERS.').replace(/TROPHY/g, 'TROPH.').replace(/SUPPLIES/g, 'SUPP.').replace(/RESIST/g, 'RES.').replace(/FRAGMENTS/g, 'FRAGS.').replace(/ANCIENT/g, 'ANC.')
}
export function exportCategory(items: CatalogItem[], preset: Preset): string {
  return JSON.stringify({ version: 1, purpose: 'One entry per in-game sign; copy each markup separately.', labels: items.map(item => {
    const result = generateSign(itemSign(item, preset))
    return { name: item.name, category: item.category, markup: result.markup, plainText: asciiFallback(itemSign(item, preset)), utf16Length: result.length.utf16, exceedsLimit: result.overLimit }
  }) }, null, 2)
}
