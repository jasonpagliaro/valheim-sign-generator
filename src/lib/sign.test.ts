import { describe, expect, it } from 'vitest'
import { CATALOG, DEFAULT_ITEM } from '../data/catalog'
import { applyPreset, asciiFallback, countLength, exportCategory, generateSign, itemSign, normalizeHex, plainText, PRESETS, shortLabel } from './sign'

describe('Valheim markup', () => {
  it('generates the exact compact Copper example', () => { expect(generateSign(itemSign(DEFAULT_ITEM)).markup).toBe('<#E8A575><b>⛏ COPPER') })
  it.each([['Iron', '<#C5D6DE><b>⛏ IRON'], ['Silver', '<#C9EEFF><b>⛏ SILVER'], ['Black metal', '<#B0B9D3><b>⛏ BLACK METAL']])('matches the supplied %s example', (name, markup) => { expect(generateSign(itemSign(CATALOG.find(item => item.name === name)!)).markup).toBe(markup) })
  it('orders and balances explicit tags', () => {
    const config = { ...itemSign(DEFAULT_ITEM), compact: false, italic: true, size: 8, advanced: true, alignment: 'right' as const }
    expect(generateSign(config).markup).toBe('<color=#E8A575><b><i><size=8><align=right>⛏ COPPER</align></size></i></b></color>')
  })
  it.each([['#abc', 'AABBCC'], ['  e8a575 ', 'E8A575'], ['FFF', 'FFFFFF'], ['#123456', '123456'], ['red', null], ['#1234', null], ['1234567', null], ['#<b>', null]])('normalizes hex %s', (input, expected) => { expect(normalizeHex(input)).toBe(expected) })
  it('invalid colors block copy without replacing the editor value', () => {
    const config = { ...itemSign(DEFAULT_ITEM), color: 'wrong' }
    expect(generateSign(config).errors).toContain('Enter a valid 3- or 6-digit hex color.')
    expect(config.color).toBe('wrong')
  })
  it('outputs plain text without markup', () => { expect(plainText(itemSign(DEFAULT_ITEM))).toBe('⛏ COPPER') })
  it('handles symbol disabled, empty, suffix, and above', () => {
    const config = itemSign(DEFAULT_ITEM)
    expect(plainText({ ...config, symbolEnabled: false })).toBe('COPPER')
    expect(plainText({ ...config, symbol: '' })).toBe('COPPER')
    expect(plainText({ ...config, symbolPosition: 'after' })).toBe('COPPER ⛏')
    expect(plainText({ ...config, symbolPosition: 'above', advanced: true })).toBe('⛏\nCOPPER')
  })
  it('serializes multiline text as a literal backslash n before counting', () => {
    const result = generateSign({ ...itemSign(DEFAULT_ITEM), text: 'ORE\r\nBARS', symbolEnabled: false, advanced: true })
    expect(result.markup).toBe('<#E8A575><b>ORE\\nBARS')
    expect(result.length.utf16).toBe(21)
  })
  it('requires opt-in multiline and rejects ambiguous literal escapes', () => {
    expect(generateSign({ ...itemSign(DEFAULT_ITEM), text: 'A\nB' }).errors).not.toHaveLength(0)
    expect(generateSign({ ...itemSign(DEFAULT_ITEM), text: 'A\\nB', advanced: true }).errors).not.toHaveLength(0)
    expect(generateSign({ ...itemSign(DEFAULT_ITEM), text: 'A\\tB', advanced: true }).errors).not.toHaveLength(0)
  })
  it('preserves a long label in full and counts every tag', () => {
    const result = generateSign({ ...itemSign(DEFAULT_ITEM), text: 'A'.repeat(1000), symbolEnabled: false })
    expect(result.markup).toHaveLength(1012)
    expect(result.remaining).toBe(-962)
    expect(result.overLimit).toBe(true)
  })
  it('accepts 50 units and warns at 51', () => {
    const config = { ...itemSign(DEFAULT_ITEM), symbolEnabled: false }
    expect(generateSign({ ...config, text: 'A'.repeat(38) }).overLimit).toBe(false)
    expect(generateSign({ ...config, text: 'A'.repeat(39) }).overLimit).toBe(true)
  })
  it('distinguishes UTF-16, code points, and UTF-8 bytes', () => {
    expect(countLength('🪵')).toEqual({ utf16: 2, codePoints: 1, utf8Bytes: 4 })
    expect(countLength('⛏')).toEqual({ utf16: 1, codePoints: 1, utf8Bytes: 3 })
    expect(countLength('👩‍🚀')).toEqual({ utf16: 5, codePoints: 3, utf8Bytes: 11 })
    expect(countLength('e\u0301').utf16).toBe(2)
    expect(countLength('♥️').utf16).toBe(2)
  })
  it('preserves arbitrary input while blocking reserved tags and control characters', () => {
    for (const text of ['<img src=x onerror=alert(1)>', '</noparse><size=100>', 'A\u0000B']) {
      const config = { ...itemSign(DEFAULT_ITEM), text }
      expect(generateSign(config).errors.length).toBeGreaterThan(0)
      expect(config.text).toBe(text)
    }
  })
  it('supports custom labels and readable ASCII fallback', () => {
    const config = itemSign({ name: 'Café supplies', color: 'ABCDEF', symbol: '🪵' })
    expect(plainText(config)).toBe('🪵 CAFÉ SUPPLIES')
    expect(asciiFallback(config)).toBe('CAFE SUPPLIES')
    expect(asciiFallback({ ...config, text: '<北>' })).toBe('(?)')
  })
  it.each(PRESETS)('applies compatibility preset %s safely', preset => {
    const sign = applyPreset({ ...itemSign(DEFAULT_ITEM), advanced: true, alignment: 'right', compact: false }, preset, 'E8A575')
    const result = generateSign(sign)
    expect(result.errors).toEqual([])
    expect(result.overLimit).toBe(false)
    expect(sign.advanced).toBe(false)
    expect(sign.compact).toBe(true)
    expect(result.markup).not.toContain('<align=')
  })
  it('has predictable preset colors and symbol behavior', () => {
    const sign = itemSign(DEFAULT_ITEM)
    expect(applyPreset(sign, 'No Symbols').symbolEnabled).toBe(false)
    expect(applyPreset(sign, 'High Contrast').color).toBe('FFFFFF')
    expect(applyPreset(sign, 'Minimal').bold).toBe(false)
    expect(applyPreset(sign, 'Large Text').size).toBe(8)
    expect(applyPreset(sign, 'Classic Viking').color).toBe('E3BF7B')
  })
  it('offers a shorter name without mutating the original', () => {
    expect(shortLabel('GREYDWARF SHAMAN TROPHY')).toBe('G. SHAMAN TROPH.')
    expect(shortLabel('COPPER')).toBe('COPPER')
  })
  it('exports structured labels with individual limit status', () => {
    const payload = JSON.parse(exportCategory([DEFAULT_ITEM], 'Resource Colors'))
    expect(payload.labels[0]).toMatchObject({ name: 'Copper', markup: '<#E8A575><b>⛏ COPPER', plainText: 'COPPER', exceedsLimit: false })
  })
})
