import { zone } from './zone'
import type { ZoneRow } from './zone'

interface QueryItem {
  property: string
  value: string
}

interface Member {
  [key: string]: any
}

type Localite = string

interface Commune {
  codePostal: string
  commune: string
  localite: Localite[]
}

interface Arrondissement {
  codeDep: string
  code: string
  codePostal: string
  arrondissement: string
  commune: Commune[]
}

interface Departement {
  code: string
  codePostal: string
  departement: string
  arrondissement: Arrondissement[]
}

interface Timestamp {
  seconds: number
}

export function isMatch(member: Member, query: QueryItem[]): boolean {
  let find = false
  if (member !== undefined && query !== undefined) {
    for (let i = 0; i < query.length; i++) {
      const value = query[i]
      const property = value.property
      const content = value.value
      if (member[property].toLowerCase().match(content.toLowerCase())?.index === 0) find = true
    }
  }
  return find
}

export function isPropertyDefined(object: any, property: string): boolean {
  const properties = Object.getOwnPropertyNames(object)
  for (let i = 0; i < properties.length; i++) if (properties[i] === property) return true
  return false
}

export function converTimestampToDate(date: Timestamp): Date {
  return new Date(date.seconds * 1000)
}

/**
 * Optimized version of getDepartements:
 * Reduces complexity from O(N^2) to O(N) by grouping data using Hash Maps first
 * and then building the nested data structure, preserving the exact original logic.
 */
export function getDepartements(): Departement[] {
  if (!zone) return []

  const zoneData = zone as unknown as ZoneRow[]

  // Build indexes for O(1) lookups instead of O(N) filters
  const byCodeDep = new Map<string, ZoneRow[]>()
  const byCodeArr = new Map<string, ZoneRow[]>()
  const byCommune = new Map<string, ZoneRow[]>()

  for (let i = 0; i < zoneData.length; i++) {
    const row = zoneData[i]
    if (row.CODE_DEP) {
      let arr = byCodeDep.get(row.CODE_DEP)
      if (!arr) {
        arr = []
        byCodeDep.set(row.CODE_DEP, arr)
      }
      arr.push(row)
    }
    if (row.CODE_ARR) {
      let arr = byCodeArr.get(row.CODE_ARR)
      if (!arr) {
        arr = []
        byCodeArr.set(row.CODE_ARR, arr)
      }
      arr.push(row)
    }
    if (row.COMMUNE) {
      let arr = byCommune.get(row.COMMUNE)
      if (!arr) {
        arr = []
        byCommune.set(row.COMMUNE, arr)
      }
      arr.push(row)
    }
  }

  // 1. Departements
  const deptRawNames: string[] = []
  const seenDepts = new Set<string>()

  for (let i = 0; i < zoneData.length; i++) {
    const d = zoneData[i].DEPARTEMENT
    if (d !== 'NULL' && d != null && !seenDepts.has(d)) {
      seenDepts.add(d)
      deptRawNames.push(d)
    }
  }

  const result: Departement[] = []

  for (let i = 0; i < deptRawNames.length; i++) {
    const rawDept = deptRawNames[i]
    const trimmedDept = typeof rawDept === 'string' ? rawDept.trim() : rawDept

    // Original: find first row matching trimmed dept
    let row: ZoneRow | undefined
    for (let j = 0; j < zoneData.length; j++) {
      if (zoneData[j].DEPARTEMENT === trimmedDept) {
        row = zoneData[j]
        break
      }
    }
    if (!row) continue

    // 2. Arrondissements
    const arrondissements: Arrondissement[] = []
    const arrRows = byCodeDep.get(row.CODE_DEP) || []

    for (let j = 0; j < arrRows.length; j++) {
      const zoneRow = arrRows[j]
      const arrName = zoneRow.ARRONDISSEMENT

      // Keep exact duplicate buggy behaviour of original implementation for backward compatibility
      let hasArr = false
      for (let x = 0; x < arrondissements.length; x++) {
        if (arrondissements[x].arrondissement === arrName) {
          hasArr = true
          break
        }
      }

      if (arrName && arrName !== 'NULL' && !hasArr) {
        // 3. Communes
        const communes: Commune[] = []
        const commRows = byCodeArr.get(zoneRow.CODE_ARR) || []

        for (let k = 0; k < commRows.length; k++) {
          const commRow = commRows[k]
          const commName = commRow.COMMUNE

          let hasComm = false
          for (let y = 0; y < communes.length; y++) {
            if (communes[y].commune === commName) {
              hasComm = true
              break
            }
          }

          if (commName && commName !== 'NULL' && !hasComm) {
            // 4. Localites
            const locRows = byCommune.get(commName) || []
            const localiteRawNames: string[] = []
            const seenLocs = new Set<string>()

            for (let l = 0; l < locRows.length; l++) {
              const loc = locRows[l].LOCALITE
              if (loc && loc !== 'NULL' && !seenLocs.has(loc)) {
                seenLocs.add(loc)
                localiteRawNames.push(loc)
              }
            }

            const localites = localiteRawNames.map((l) => (typeof l === 'string' ? l.trim() : l))

            communes.push({
              codePostal: commRow.CODE_POSTAL,
              commune: typeof commName === 'string' ? commName.trim() : commName,
              localite: localites,
            })
          }
        }

        arrondissements.push({
          codeDep: zoneRow.CODE_DEP,
          code: zoneRow.CODE_ARR,
          codePostal: zoneRow.CODE_POSTAL,
          arrondissement: typeof arrName === 'string' ? arrName.trim() : arrName,
          commune: communes,
        })
      }
    }

    result.push({
      code: row.CODE_DEP,
      codePostal: row.CODE_POSTAL,
      departement: trimmedDept,
      arrondissement: arrondissements,
    })
  }

  return result
}
