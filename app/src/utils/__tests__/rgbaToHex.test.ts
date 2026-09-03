import { describe, it, expect } from 'vitest'
import { rgbaToHex } from '../rgbaToHex'

describe('rgbaToHex', () => {
  // ── slash-notation format (e.g. CSS color-mix output) ──────────────────────

  describe('slash-notation input (e.g. "255 0 0 / 1")', () => {
    it('converts opaque red to #ff0000ff', () => {
      expect(rgbaToHex('255 0 0 / 1')).toBe('#ff0000ff')
    })

    it('converts green with 50% alpha', () => {
      // alpha 0.5 → Math.round(0.5 * 255) = 128 → 0x80
      expect(rgbaToHex('0 128 0 / 0.5')).toBe('#0080007f')
    })

    it('strips alpha when forceRemoveAlpha=true', () => {
      expect(rgbaToHex('255 0 0 / 1', true)).toBe('#ff0000')
    })

    it('returns the original string when format does not match regex', () => {
      const bad = 'not a color /'
      expect(rgbaToHex(bad)).toBe(bad)
    })

    it('converts black (0 0 0) with full alpha', () => {
      expect(rgbaToHex('0 0 0 / 1')).toBe('#000000ff')
    })

    it('converts white (255 255 255) with full alpha', () => {
      expect(rgbaToHex('255 255 255 / 1')).toBe('#ffffffff')
    })
  })

  // ── comma-separated rgba() format ─────────────────────────────────────────

  describe('comma-separated rgba() input', () => {
    it('converts rgba(255,0,0,1) to #ff0000ff', () => {
      expect(rgbaToHex('rgba(255,0,0,1)')).toBe('#ff0000ff')
    })

    it('converts rgb(0,128,0) — no alpha — to #008000', () => {
      // no 4th channel → no alpha byte appended
      expect(rgbaToHex('rgb(0,128,0)')).toBe('#008000')
    })

    it('strips alpha channel when forceRemoveAlpha=true', () => {
      expect(rgbaToHex('rgba(255,0,0,0.5)', true)).toBe('#ff0000')
    })

    it('converts rgba with spaces after commas', () => {
      expect(rgbaToHex('rgba(255, 0, 0, 1)')).toBe('#ff0000ff')
    })

    it('pads single-digit hex values with leading zero', () => {
      // r=1 → '01', g=1 → '01', b=1 → '01', a=1 → 'ff'
      expect(rgbaToHex('rgba(1,1,1,1)')).toBe('#010101ff')
    })
  })
})
