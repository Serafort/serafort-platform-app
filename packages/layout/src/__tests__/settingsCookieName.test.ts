import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { themeConfig } from '@cap/theme'
import { SETTINGS_COOKIE_NAME } from '@cap/platform-store'

/**
 * The settings cookie name is necessarily written down in three places:
 *
 *  1. `themeConfig.settingsCookieName` (@cap/theme) - read by the
 *     getMode()/getSkin() helpers in @cap/platform-core;
 *  2. `SETTINGS_COOKIE_NAME` (@cap/platform-store) - the store cannot import
 *     @cap/theme without closing a require cycle, so it inlines the value;
 *  3. the anti-flash inline script in `app/index.html`, which runs before any
 *     module graph exists and so cannot import anything at all.
 *
 * When these drift, nothing throws - the reader just silently sees no cookie.
 * That is exactly what happened before: index.html was still looking for
 * `GLDeveloper-1` while the app had moved on, so the anti-flash script never
 * matched and dark-mode users got a white flash on every load. This test is the
 * tripwire.
 */
describe('settings cookie name', () => {
  it('matches between @cap/theme and @cap/platform-store', () => {
    expect(SETTINGS_COOKIE_NAME).toBe(themeConfig.settingsCookieName)
  })

  it('matches the anti-flash script in app/index.html', () => {
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, '../../../../app/index.html'),
      'utf-8',
    )
    const match = indexHtml.match(/var cookieName = '([^']+)'/)

    expect(match, 'anti-flash script in app/index.html declares a cookieName').not.toBeNull()
    expect(match![1]).toBe(themeConfig.settingsCookieName)
  })
})
