import { DEFAULT_FORMAT, normalizeHex, PRESETS, type SignConfig } from './sign'
import { CATALOG, DEFAULT_ITEM } from '../data/catalog'
// Keep the original key so old saved draft text can be removed during migration.
export const STORAGE_KEY = 'valheim-sign-forge:v1'
export type SignFormat = Omit<SignConfig, 'name' | 'text' | 'symbol'>
export interface Preferences { format: SignFormat; selectedId: string | null; wood: 'dark' | 'light'; favorites: string[]; recent: string[] }
export interface SignFile { version: 1; sign: SignConfig; wood: 'dark' | 'light' }
const catalogIds = new Set(CATALOG.map(item => item.id))

function isObject(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
export function parseSignFile(value: unknown): SignFile {
  if (!isObject(value) || value.version !== 1 || !isObject(value.sign)) throw new Error('Use a version 1 sign configuration exported by this app.')
  const sign = value.sign
  for (const key of ['name', 'text', 'color', 'symbol']) {
    if (typeof sign[key] !== 'string' || sign[key].length > 10000) throw new Error(`Invalid ${key} in sign configuration.`)
  }
  if (!normalizeHex(sign.color as string)) throw new Error('The imported sign has an invalid color.')
  for (const key of ['bold', 'italic', 'symbolEnabled', 'advanced', 'compact']) {
    if (typeof sign[key] !== 'boolean') throw new Error(`Invalid ${key} in sign configuration.`)
  }
  if (typeof sign.size !== 'number' || !Number.isInteger(sign.size) || sign.size < 0 || sign.size > 30) throw new Error('Text size must be an integer from 0 to 30.')
  if (!['before', 'after', 'above'].includes(sign.symbolPosition as string) || !['left', 'center', 'right'].includes(sign.alignment as string) || !PRESETS.includes(sign.preset as SignConfig['preset'])) throw new Error('The sign contains an unknown formatting option.')
  if (value.wood !== 'dark' && value.wood !== 'light') throw new Error('Unknown wood preview.')
  const clean = Object.fromEntries([...Object.keys(DEFAULT_FORMAT), 'name', 'text', 'color', 'symbol'].map(key => [key, sign[key]])) as unknown as SignConfig
  return { version: 1, sign: { ...clean, color: normalizeHex(clean.color)! }, wood: value.wood }
}
export function serializeSign(sign: SignConfig, wood: Preferences['wood']): string { return JSON.stringify({ version: 1, sign, wood } satisfies SignFile, null, 2) }
export function createShareUrl(sign: SignConfig, wood: Preferences['wood'], base: string): string {
  const url = new URL(base)
  url.search = ''
  url.hash = ''
  url.searchParams.set('sign', JSON.stringify({ version: 1, sign, wood }))
  return url.toString()
}
export function readSharedSign(search: string): SignFile | null {
  const raw = new URLSearchParams(search).get('sign')
  if (!raw) return null
  if (raw.length > 25000) throw new Error('The shared sign is too large to open.')
  return parseSignFile(JSON.parse(raw))
}
export function signFormat(sign: SignConfig): SignFormat {
  return { ...Object.fromEntries(Object.keys(DEFAULT_FORMAT).map(key => [key, sign[key as keyof SignConfig]])), color: normalizeHex(sign.color) ?? DEFAULT_ITEM.color } as SignFormat
}
function parseFormat(value: unknown): SignFormat {
  if (!isObject(value)) throw new Error('Invalid formatting preferences.')
  return signFormat(parseSignFile({ version: 1, sign: { ...value, name: '', text: '', symbol: '' }, wood: 'dark' }).sign)
}
function idList(value: unknown): string[] { return Array.isArray(value) ? [...new Set(value.filter((x): x is string => typeof x === 'string' && catalogIds.has(x)))] : [] }
export function loadPreferences(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): Preferences | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!isObject(value)) return null
    if (value.version === 1) {
      // Delete the old payload before restoring only safe presentation settings.
      // In particular, never restore or re-save its custom text, name, or symbol.
      storage.removeItem(STORAGE_KEY)
      const file = parseSignFile(value)
      const migrated = { format: signFormat(file.sign), selectedId: CATALOG.find(item => item.name === file.sign.name)?.id ?? null, wood: file.wood, favorites: idList(value.favorites), recent: idList(value.recent).slice(0, 12) }
      savePreferences(storage, migrated)
      return migrated
    }
    if (value.version !== 2 || !['dark', 'light'].includes(value.wood as string)) return null
    return { format: parseFormat(value.format), selectedId: typeof value.selectedId === 'string' && catalogIds.has(value.selectedId) ? value.selectedId : null, wood: value.wood as Preferences['wood'], favorites: idList(value.favorites), recent: idList(value.recent).slice(0, 12) }
  } catch { return null }
}
export function savePreferences(storage: Pick<Storage, 'setItem'>, preferences: Preferences): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, format: parseFormat(preferences.format), selectedId: preferences.selectedId && catalogIds.has(preferences.selectedId) ? preferences.selectedId : null, wood: preferences.wood, favorites: idList(preferences.favorites), recent: idList(preferences.recent).slice(0, 12) }))
    return true
  } catch { return false }
}
export function addRecent(recent: string[], id: string): string[] { return [id, ...recent.filter(value => value !== id)].slice(0, 12) }
