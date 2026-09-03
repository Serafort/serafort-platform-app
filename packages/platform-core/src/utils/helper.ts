import { differenceInYears, parseISO } from 'date-fns'
import type { DemoName } from '../types/core-types'
import type { SystemMode, Settings } from '@cap/shared-types'
import { themeConfig } from '@cap/theme'
import demoConfigs from '../configs/demoConfigs'
import { getCookie, getJsonCookie } from './cookieUtils'

export const isObjectEmpty = (objectName: object) => {
  return objectName && Object.keys(objectName).length === 0 && objectName.constructor === Object
}

export const isKeyIn = (obj: object, key: string) => {
  let find = false
  for (const o in obj) if (o === key) find = true
  return find
}

export const removeAttr = (obj: object, keys: Array<string>) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  for (const key of keys) if (isKeyIn(obj, key)) delete obj[key]
  return obj
}

export const showPermissions = (userTypeID: number) => {
  switch (userTypeID) {
    case 1:
      return 'System '
    case 2:
      return 'Admin'
    case 3:
      return 'Supervisor'
    case 4:
      return 'Judge'
    case 5:
      return 'Participant'
    default:
      return 'unknown'
  }
}

export function category(dateBirth: string | object): number {
  const birthDate =
    typeof dateBirth === 'string' ? parseISO(dateBirth) : new Date(dateBirth as Date)
  const age = differenceInYears(new Date(), birthDate)
  if (age >= 7 && age <= 12) return 1
  if (age >= 13 && age <= 17) return 2
  if (age >= 10) return 3
  return -1
}

/**
 * Get the demo name from URL query params or localStorage
 * In a client-side SPA, we use URL params or localStorage instead of server headers
 */
export const getDemoName = (): DemoName => {
  if (typeof window === 'undefined') return null

  // Check URL params first
  const urlParams = new URLSearchParams(window.location.search)
  const urlDemo = urlParams.get('demo') as DemoName

  if (urlDemo && Object.keys(demoConfigs).includes(urlDemo)) {
    return urlDemo
  }

  // Fall back to localStorage
  const storedDemo = localStorage.getItem('demoName') as DemoName
  if (storedDemo && Object.keys(demoConfigs).includes(storedDemo)) {
    return storedDemo
  }

  return null
}

/**
 * Get settings from cookie (client-side)
 */
export const getSettingsFromCookie = (): Settings => {
  const demoName = getDemoName()

  const cookieName = demoName
    ? themeConfig.settingsCookieName.replace('demo-1', demoName)
    : themeConfig.settingsCookieName

  return getJsonCookie<Settings>(cookieName, {} as Settings)
}

/**
 * Get the mode setting
 */
export const getMode = () => {
  const settingsCookie = getSettingsFromCookie()
  const demoName = getDemoName()

  // Get mode from cookie or fallback to demo config or theme config
  const _mode = settingsCookie.mode || (demoName && demoConfigs[demoName]?.mode) || themeConfig.mode

  return _mode
}

/**
 * Get system mode (resolved from 'system' preference)
 */
export const getSystemMode = (): SystemMode => {
  const mode = getMode()

  const colorPrefCookie = getCookie('colorPref') as SystemMode | null

  return (mode === 'system' ? colorPrefCookie || 'light' : mode) || 'light'
}

/**
 * Get server mode (for SSR compatibility, returns resolved mode)
 */
export const getServerMode = () => {
  const mode = getMode()
  const systemMode = getSystemMode()

  return mode === 'system' ? systemMode : mode
}

/**
 * Get skin setting
 */
export const getSkin = () => {
  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}
