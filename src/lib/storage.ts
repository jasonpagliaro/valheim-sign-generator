import { DEFAULT_FORMAT, normalizeHex, PRESETS, type SignConfig } from './sign'
export const STORAGE_KEY = 'valheim-sign-forge:v1'
export interface Preferences { sign: SignConfig; wood: 'dark' | 'light'; favorites: string[]; recent: string[] }
export interface SignFile { version: 1; sign: SignConfig; wood: 'dark' | 'light' }

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
function idList(value: unknown): string[] { return Array.isArray(value) ? [...new Set(value.filter((x): x is string => typeof x === 'string' && x.length < 200))].slice(0, 500) : [] }
export function loadPreferences(storage: Pick<Storage, 'getItem'>): Preferences | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    const file = parseSignFile(value)
    return { sign: file.sign, wood: file.wood, favorites: idList((value as Record<string, unknown>).favorites), recent: idList((value as Record<string, unknown>).recent).slice(0, 12) }
  } catch { return null }
}
export function savePreferences(storage: Pick<Storage, 'setItem'>, preferences: Preferences): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...preferences })); return true } catch { return false }
}
export function addRecent(recent: string[], id: string): string[] { return [id, ...recent.filter(value => value !== id)].slice(0, 12) }
