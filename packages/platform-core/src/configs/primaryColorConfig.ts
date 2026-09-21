export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    // Serafort brand blue (default)
    name: 'primary-1',
    light: '#06A0FC',
    main: '#047BFA',
    dark: '#044BC4',
  },
  {
    // Serafort cyan accent
    name: 'primary-cyan',
    light: '#4FDCFD',
    main: '#06CBFD',
    dark: '#06A0FC',
  },
  {
    name: 'primary-2',
    light: '#4EB0B1',
    main: '#0D9394',
    dark: '#096B6C',
  },
  {
    name: 'primary-3',
    light: '#FFC25A',
    main: '#FFAB1D',
    dark: '#BA7D15',
  },
  {
    name: 'primary-4',
    light: '#F0718D',
    main: '#EB3D63',
    dark: '#AC2D48',
  },
  {
    name: 'primary-5',
    light: '#5CAFF1',
    main: '#2092EC',
    dark: '#176BAC',
  },
]

export default primaryColorConfig
