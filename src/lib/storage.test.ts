import { describe, expect, it } from 'vitest'
import { DEFAULT_ITEM } from '../data/catalog'
import { itemSign } from './sign'
import { addRecent, createShareUrl, loadPreferences, parseSignFile, readSharedSign, savePreferences, serializeSign, STORAGE_KEY } from './storage'

const sign = itemSign(DEFAULT_ITEM)
function memoryStorage() { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } } }
describe('Local settings and portable configurations', () => {
  it('roundtrips saved editor, wood, favorites, and recents', () => {
    const storage = memoryStorage()
    const settings = { sign: { ...sign, bold: false }, wood: 'light' as const, favorites: ['one'], recent: ['two'] }
    expect(savePreferences(storage, settings)).toBe(true)
    expect(loadPreferences(storage)).toEqual(settings)
  })
  it('recovers from invalid JSON, invalid schemas, and unavailable storage', () => {
    const storage = memoryStorage()
    for (const raw of ['{', 'null', '{"version":2}', '[]']) { storage.setItem(STORAGE_KEY, raw); expect(loadPreferences(storage)).toBeNull() }
    expect(savePreferences({ setItem: () => { throw new Error('quota') } }, { sign, wood: 'dark', favorites: [], recent: [] })).toBe(false)
    expect(loadPreferences({ getItem: () => { throw new Error('blocked') } })).toBeNull()
  })
  it('exports/imports a custom sign without unrelated data', () => {
    const custom = { ...sign, name: 'My signs', text: 'NORTH GATE', symbol: '', symbolEnabled: false }
    expect(parseSignFile(JSON.parse(serializeSign(custom, 'light')))).toEqual({ version: 1, sign: custom, wood: 'light' })
  })
  it('validates imports strictly and strips unrelated properties', () => {
    const file = JSON.parse(serializeSign(sign, 'dark'))
    for (const change of [{ size: 31 }, { size: 1.2 }, { color: 'red' }, { bold: 'true' }, { alignment: 'justify' }, { preset: 'unknown' }, { text: 'x'.repeat(10001) }]) expect(() => parseSignFile({ ...file, sign: { ...sign, ...change } })).toThrow()
    expect(parseSignFile({ ...file, sign: { ...sign, malicious: true }, favorites: ['secret'] })).toEqual(file)
  })
  it('roundtrips Unicode and punctuation through a share URL independently', () => {
    const custom = { ...sign, text: 'Café + # & ? / 🪵', bold: false }
    const url = createShareUrl(custom, 'light', 'https://example.com/?old=value#fragment')
    expect(new URL(url).hash).toBe('')
    expect(new URL(url).searchParams.has('old')).toBe(false)
    expect(readSharedSign(new URL(url).search)).toEqual({ version: 1, sign: custom, wood: 'light' })
    expect(readSharedSign('')).toBeNull()
    expect(() => readSharedSign('?sign=wrong')).toThrow()
  })
  it('keeps a deduplicated most-recent-first list of twelve', () => {
    const recent = Array.from({ length: 12 }, (_, i) => `item${i}`)
    expect(addRecent(recent, 'item2')).toHaveLength(12)
    expect(addRecent(recent, 'item2')[0]).toBe('item2')
    expect(addRecent(recent, 'new')).not.toContain('item11')
  })
})
