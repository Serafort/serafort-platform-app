import { zone } from './zone'
import type { ZoneRow } from './zone'

interface QueryItem {
  property: string
  value: string
}

interface Member {
  [key: string]: any
}

// interface ZoneRow {
//   DEPARTEMENT: string
//   CODE_DEP: string
//   CODE_POSTAL: string
//   ARRONDISSEMENT: string
//   CODE_ARR: string
//   COMMUNE: string
//   LOCALITE: string
// }

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

export function getDepartements(): Departement[] {
  if (!zone) return []

  const zoneData = zone as unknown as ZoneRow[]

  const departements = zoneData
    .map((el: ZoneRow) => el.DEPARTEMENT)
    .filter(
      (value: string, index: number, self: string[]) =>
        value !== 'NULL' && value != null && self.indexOf(value) === index,
    )
    .map((el: string) => (typeof el === 'string' ? el.trim() : el))
    .map((dept: string) => {
      const row = zoneData.find((value: ZoneRow) => value.DEPARTEMENT === dept)
      if (!row) return null

      const arrondissements: Arrondissement[] = zoneData
        .filter((value: ZoneRow) => value.CODE_DEP === row.CODE_DEP)
        .reduce((acc: Arrondissement[], zoneRow: ZoneRow) => {
          const arr = zoneRow.ARRONDISSEMENT
          if (arr && arr !== 'NULL' && !acc.some((a) => a.arrondissement === arr)) {
            const communes: Commune[] = zoneData
              .filter((r: ZoneRow) => r.CODE_ARR === zoneRow.CODE_ARR)
              .reduce((commAcc: Commune[], commRow: ZoneRow) => {
                const comm = commRow.COMMUNE
                if (comm && comm !== 'NULL' && !commAcc.some((c) => c.commune === comm)) {
                  const localites: Localite[] = zoneData
                    .filter((r: ZoneRow) => r.COMMUNE === comm)
                    .map((r: ZoneRow) => r.LOCALITE)
                    .filter(
                      (l: string, i: number, self: string[]) =>
                        l && l !== 'NULL' && self.indexOf(l) === i,
                    )
                    .map((l: string) => (typeof l === 'string' ? l.trim() : l))

                  commAcc.push({
                    codePostal: commRow.CODE_POSTAL,
                    commune: typeof comm === 'string' ? comm.trim() : comm,
                    localite: localites,
                  })
                }
                return commAcc
              }, [])

            acc.push({
              codeDep: zoneRow.CODE_DEP,
              code: zoneRow.CODE_ARR,
              codePostal: zoneRow.CODE_POSTAL,
              arrondissement: typeof arr === 'string' ? arr.trim() : arr,
              commune: communes,
            })
          }
          return acc
        }, [])

      return {
        code: row.CODE_DEP,
        codePostal: row.CODE_POSTAL,
        departement: typeof dept === 'string' ? dept.trim() : dept,
        arrondissement: arrondissements,
      }
    })
    .filter((dept): dept is Departement => dept !== null)

  return departements
}
