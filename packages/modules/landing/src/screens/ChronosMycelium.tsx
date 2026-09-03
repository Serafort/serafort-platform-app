import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
  Paper,
  Divider,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  SkipNext as SkipNextIcon,
  Download as DownloadIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Shuffle as ShuffleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'

// ----------------------------------------------------------------------
// Seeded PRNG (Mulberry32)
// ----------------------------------------------------------------------
function createPRNG(seed: number) {
  let s = seed >>> 0
  return function () {
    let t = (s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ----------------------------------------------------------------------
// Fast 3D Noise (Perlin Noise Implementation)
// ----------------------------------------------------------------------
class PerlinNoise3D {
  private p: number[] = new Array(512)

  constructor(prng: () => number) {
    const perm = new Array(256)
    for (let i = 0; i < 256; i++) perm[i] = i
    for (let i = 255; i > 0; i--) {
      const r = Math.floor(prng() * (i + 1))
      const tmp = perm[i]
      perm[i] = perm[r]
      perm[r] = tmp
    }
    for (let i = 0; i < 512; i++) {
      this.p[i] = perm[i & 255]
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  public noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)

    const u = this.fade(x)
    const v = this.fade(y)
    const w = this.fade(z)

    const A = this.p[X] + Y
    const AA = this.p[A] + Z
    const AB = this.p[A + 1] + Z
    const B = this.p[X + 1] + Y
    const BA = this.p[B] + Z
    const BB = this.p[B + 1] + Z

    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z)),
      ),
      this.lerp(
        v,
        this.lerp(
          u,
          this.grad(this.p[AA + 1], x, y, z - 1),
          this.grad(this.p[BA + 1], x - 1, y, z - 1),
        ),
        this.lerp(
          u,
          this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1),
        ),
      ),
    )
  }
}

// ----------------------------------------------------------------------
// Color Palettes
// ----------------------------------------------------------------------
export type ColorPaletteId = 'bioluminescence' | 'amber' | 'emerald' | 'nebula' | 'solar'

interface ColorStop {
  r: number
  g: number
  b: number
}

const PALETTES: Record<ColorPaletteId, { name: string; stops: ColorStop[] }> = {
  bioluminescence: {
    name: 'Bioluminescent Midnight',
    stops: [
      { r: 15, g: 18, b: 35 }, // Midnight Base
      { r: 40, g: 70, b: 180 }, // Cobalt Blue
      { r: 0, g: 210, b: 230 }, // Electric Cyan
      { r: 255, g: 225, b: 120 }, // Luminescent Amber Tip
    ],
  },
  amber: {
    name: 'Chronos Amber Fossil',
    stops: [
      { r: 18, g: 12, b: 8 }, // Obsidian
      { r: 140, g: 60, b: 15 }, // Terracotta
      { r: 240, g: 160, b: 40 }, // Warm Amber
      { r: 255, g: 245, b: 210 }, // Incandescent Gold White
    ],
  },
  emerald: {
    name: 'Fungal Emerald',
    stops: [
      { r: 8, g: 20, b: 16 }, // Slate Abyss
      { r: 20, g: 120, b: 70 }, // Emerald
      { r: 40, g: 220, b: 130 }, // Neon Jade
      { r: 200, g: 255, b: 220 }, // Glowing Mint Tip
    ],
  },
  nebula: {
    name: 'Celestial Nebula',
    stops: [
      { r: 25, g: 10, b: 30 }, // Deep Crimson Violet
      { r: 160, g: 30, b: 120 }, // Amethyst Magenta
      { r: 130, g: 90, b: 240 }, // Pulsing Violet
      { r: 255, g: 220, b: 255 }, // Starlight White
    ],
  },
  solar: {
    name: 'Solar Flare',
    stops: [
      { r: 30, g: 12, b: 10 }, // Umber Charcoal
      { r: 200, g: 45, b: 20 }, // Fiery Red
      { r: 250, g: 140, b: 0 }, // Tangerine
      { r: 255, g: 240, b: 150 }, // Solar Yellow
    ],
  },
}

function getPaletteColor(stops: ColorStop[], t: number, alpha: number): string {
  const clampedT = Math.max(0, Math.min(1, t))
  const count = stops.length - 1
  const scaled = clampedT * count
  const index = Math.floor(scaled)
  const factor = scaled - index

  const c1 = stops[Math.min(index, count)]
  const c2 = stops[Math.min(index + 1, count)]

  const r = Math.round(c1.r + (c2.r - c1.r) * factor)
  const g = Math.round(c1.g + (c2.g - c1.g) * factor)
  const b = Math.round(c1.b + (c2.b - c1.b) * factor)

  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

// ----------------------------------------------------------------------
// Agent / Hypha Definition
// ----------------------------------------------------------------------
interface Hypha {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  generation: number
  epochIndex: number
  distFromCenter: number
  lifespan: number
  maxLifespan: number
  energy: number
}

// ----------------------------------------------------------------------
// Simulation Config Interface
// ----------------------------------------------------------------------
export interface SimulationConfig {
  seed: number
  initialCount: number
  baseSpeed: number
  noiseScale: number
  trigWarpFactor: number
  epochInterval: number
  bifurcationProb: number
  maxGeneration: number
  angleDeflection: number
  opacityFade: number
  lineWidth: number
  glowIntensity: number
  blendMode: GlobalCompositeOperation
  palette: ColorPaletteId
  showEpochRings: boolean
}

const DEFAULT_CONFIG: SimulationConfig = {
  seed: 42,
  initialCount: 200,
  baseSpeed: 1.8,
  noiseScale: 0.004,
  trigWarpFactor: 1.2,
  epochInterval: 45,
  bifurcationProb: 0.65,
  maxGeneration: 8,
  angleDeflection: 0.55,
  opacityFade: 0.012,
  lineWidth: 1.4,
  glowIntensity: 12,
  blendMode: 'lighter',
  palette: 'bioluminescence',
  showEpochRings: true,
}

// Presets
const PRESETS: Record<string, Partial<SimulationConfig>> = {
  bioluminescent_abyss: {
    seed: 1337,
    initialCount: 250,
    baseSpeed: 2.0,
    noiseScale: 0.0035,
    trigWarpFactor: 1.4,
    epochInterval: 40,
    bifurcationProb: 0.7,
    maxGeneration: 9,
    opacityFade: 0.01,
    palette: 'bioluminescence',
  },
  amber_fossil: {
    seed: 8888,
    initialCount: 180,
    baseSpeed: 1.5,
    noiseScale: 0.005,
    trigWarpFactor: 0.9,
    epochInterval: 50,
    bifurcationProb: 0.6,
    maxGeneration: 7,
    opacityFade: 0.018,
    palette: 'amber',
  },
  emerald_network: {
    seed: 2026,
    initialCount: 300,
    baseSpeed: 2.2,
    noiseScale: 0.003,
    trigWarpFactor: 1.8,
    epochInterval: 35,
    bifurcationProb: 0.75,
    maxGeneration: 10,
    opacityFade: 0.008,
    palette: 'emerald',
  },
  nebula_blossom: {
    seed: 555,
    initialCount: 150,
    baseSpeed: 1.6,
    noiseScale: 0.006,
    trigWarpFactor: 1.1,
    epochInterval: 55,
    bifurcationProb: 0.55,
    maxGeneration: 8,
    opacityFade: 0.015,
    palette: 'nebula',
  },
}

export const ChronosMycelium: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Simulation State
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG)
  const [isRunning, setIsRunning] = useState<boolean>(true)
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false)
  const [panelOpen, setPanelOpen] = useState<boolean>(true)

  // Metrics
  const [metrics, setMetrics] = useState({
    activeHyphae: 0,
    totalNodes: 0,
    maxEpochReached: 0,
    currentGenMax: 0,
    fps: 60,
  })

  // Center / Origin state
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // References for Engine
  const prngRef = useRef<() => number>(createPRNG(DEFAULT_CONFIG.seed))
  const noiseRef = useRef<PerlinNoise3D>(new PerlinNoise3D(prngRef.current))
  const hyphaeRef = useRef<Hypha[]>([])
  const hyphaIdCounterRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const animationFrameIdRef = useRef<number | null>(null)
  const totalNodesCounterRef = useRef<number>(0)

  // Web Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const osc1Ref = useRef<OscillatorNode | null>(null)
  const osc2Ref = useRef<OscillatorNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)

  // FPS Calculation
  const lastFpsCheckRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)

  // ----------------------------------------------------------------------
  // Reset / Initialize Colony Engine
  // ----------------------------------------------------------------------
  const initEngine = useCallback((newConfig: SimulationConfig) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width
    const height = canvas.height

    originRef.current = { x: width / 2, y: height / 2 }

    const prng = createPRNG(newConfig.seed)
    prngRef.current = prng
    noiseRef.current = new PerlinNoise3D(prng)

    // Clear offscreen canvas
    if (offscreenCanvasRef.current) {
      const offCtx = offscreenCanvasRef.current.getContext('2d')
      if (offCtx) {
        offCtx.fillStyle = '#0a0c12'
        offCtx.fillRect(0, 0, width, height)
      }
    }

    // Reset agents
    hyphaeRef.current = []
    hyphaIdCounterRef.current = 0
    totalNodesCounterRef.current = 0
    timeRef.current = 0

    const initialHyphae: Hypha[] = []
    for (let i = 0; i < newConfig.initialCount; i++) {
      const angle = (i / newConfig.initialCount) * Math.PI * 2 + (prng() * 0.1 - 0.05)
      const initialSpeed = newConfig.baseSpeed * (0.8 + prng() * 0.4)
      initialHyphae.push({
        id: hyphaIdCounterRef.current++,
        x: originRef.current.x,
        y: originRef.current.y,
        angle,
        speed: initialSpeed,
        generation: 0,
        epochIndex: 0,
        distFromCenter: 0,
        lifespan: 0,
        maxLifespan: 300 + prng() * 200,
        energy: 1.0,
      })
    }

    hyphaeRef.current = initialHyphae
    totalNodesCounterRef.current = initialHyphae.length

    setMetrics({
      activeHyphae: initialHyphae.length,
      totalNodes: initialHyphae.length,
      maxEpochReached: 0,
      currentGenMax: 0,
      fps: 60,
    })
  }, [])

  // Setup offscreen canvas & resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height

        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement('canvas')
        }
        offscreenCanvasRef.current.width = rect.width
        offscreenCanvasRef.current.height = rect.height

        const offCtx = offscreenCanvasRef.current.getContext('2d')
        if (offCtx) {
          offCtx.fillStyle = '#0a0c12'
          offCtx.fillRect(0, 0, rect.width, rect.height)
        }

        initEngine(config)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [config, initEngine])

  // Audio setup
  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioCtx()
        audioCtxRef.current = ctx

        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime)
        masterGain.connect(ctx.destination)
        masterGainRef.current = masterGain

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(400, ctx.currentTime)
        filter.connect(masterGain)
        filterRef.current = filter

        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(110, ctx.currentTime) // A2
        osc1.connect(filter)
        osc1.start()
        osc1Ref.current = osc1

        const osc2 = ctx.createOscillator()
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(164.81, ctx.currentTime) // E3
        osc2.connect(filter)
        osc2.start()
        osc2Ref.current = osc2

        setAudioEnabled(true)
      } catch (err) {
        console.error('Failed to initialize audio synth:', err)
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      setAudioEnabled(false)
    }
  }

  // Update Web Audio dynamically based on simulation state
  const updateAudioSynthesizer = (activeCount: number, maxRadius: number) => {
    if (
      !audioEnabled ||
      !audioCtxRef.current ||
      !filterRef.current ||
      !osc1Ref.current ||
      !osc2Ref.current
    ) {
      return
    }
    const ctx = audioCtxRef.current
    const cutoff = Math.min(2400, 200 + activeCount * 3 + maxRadius * 2)
    filterRef.current.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.1)

    const baseFreq = 110 + (maxRadius % 120)
    osc1Ref.current.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.2)
    osc2Ref.current.frequency.setTargetAtTime(baseFreq * 1.5, ctx.currentTime, 0.2)
  }

  // ----------------------------------------------------------------------
  // Core Step Engine
  // ----------------------------------------------------------------------
  const stepSimulation = useCallback(() => {
    const offCanvas = offscreenCanvasRef.current
    const displayCanvas = canvasRef.current
    if (!offCanvas || !displayCanvas) return

    const offCtx = offCanvas.getContext('2d')
    const displayCtx = displayCanvas.getContext('2d')
    if (!offCtx || !displayCtx) return

    const width = offCanvas.width
    const height = offCanvas.height
    const prng = prngRef.current
    const noiseGen = noiseRef.current

    // Opacity persistence / fade layer
    offCtx.save()
    offCtx.globalCompositeOperation = 'source-over'
    offCtx.fillStyle = `rgba(10, 12, 18, ${config.opacityFade})`
    offCtx.fillRect(0, 0, width, height)
    offCtx.restore()

    timeRef.current += 0.005

    const activeHyphae = hyphaeRef.current
    const nextHyphae: Hypha[] = []
    let maxEpoch = 0
    let maxGen = 0
    let maxDist = 0

    offCtx.save()
    offCtx.globalCompositeOperation = config.blendMode

    const paletteStops = PALETTES[config.palette].stops

    for (let i = 0; i < activeHyphae.length; i++) {
      const h = activeHyphae[i]
      h.lifespan++

      // Current polar coordinates relative to origin
      const dx = h.x - originRef.current.x
      const dy = h.y - originRef.current.y
      const r = Math.sqrt(dx * dx + dy * dy)
      const baseAngle = Math.atan2(dy, dx)

      if (r > maxDist) maxDist = r

      // Noise field & trigonometric warp calculations
      const nVal = noiseGen.noise(h.x * config.noiseScale, h.y * config.noiseScale, timeRef.current)
      const trigWarp =
        Math.sin(r * 0.02 + timeRef.current * 2) * config.trigWarpFactor +
        Math.cos(baseAngle * 3) * (config.trigWarpFactor * 0.5)

      // Combined flow field direction
      const targetAngle = baseAngle + nVal * Math.PI * 2 * 0.5 + trigWarp * 0.3
      // Smooth angle interpolation
      h.angle += (targetAngle - h.angle) * 0.08

      // Step vector
      const vx = Math.cos(h.angle) * h.speed
      const vy = Math.sin(h.angle) * h.speed

      const nextX = h.x + vx
      const nextY = h.y + vy

      // Generational & Distance Color Mapping
      const normDist = Math.min(1, r / (Math.max(width, height) * 0.45))
      const normGen = Math.min(1, h.generation / config.maxGeneration)
      const colorVal = normDist * 0.6 + normGen * 0.4

      const strokeAlpha = Math.max(0.1, h.energy * (1 - normGen * 0.4))
      const strokeColor = getPaletteColor(paletteStops, colorVal, strokeAlpha)

      // Draw segment
      const currentWidth = Math.max(0.4, config.lineWidth * (1 - normGen * 0.6))
      offCtx.beginPath()
      offCtx.moveTo(h.x, h.y)
      offCtx.lineTo(nextX, nextY)
      offCtx.strokeStyle = strokeColor
      offCtx.lineWidth = currentWidth
      offCtx.lineCap = 'round'

      if (config.glowIntensity > 0 && h.generation < 3) {
        offCtx.shadowColor = strokeColor
        offCtx.shadowBlur = config.glowIntensity
      } else {
        offCtx.shadowBlur = 0
      }

      offCtx.stroke()

      // Update position
      h.x = nextX
      h.y = nextY
      h.distFromCenter = r

      if (h.generation > maxGen) maxGen = h.generation

      // Check Concentric Radial Epoch Thresholds
      const currentEpoch = Math.floor(r / config.epochInterval)
      if (currentEpoch > maxEpoch) maxEpoch = currentEpoch

      let branched = false
      if (currentEpoch > h.epochIndex && h.generation < config.maxGeneration) {
        h.epochIndex = currentEpoch

        // Markov Chain Bifurcation Decision
        const randval = prng()
        if (randval < config.bifurcationProb) {
          branched = true
          const childCount = prng() > 0.7 ? 2 : 1

          for (let c = 0; c < childCount; c++) {
            const deflectDir = c === 0 ? 1 : -1
            const deflectAngle =
              h.angle + deflectDir * (config.angleDeflection + (prng() * 0.2 - 0.1))

            const childSpeed = h.speed * (0.85 + prng() * 0.25)
            nextHyphae.push({
              id: hyphaIdCounterRef.current++,
              x: h.x,
              y: h.y,
              angle: deflectAngle,
              speed: childSpeed,
              generation: h.generation + 1,
              epochIndex: currentEpoch,
              distFromCenter: r,
              lifespan: 0,
              maxLifespan: h.maxLifespan * 0.8,
              energy: h.energy * 0.85,
            })
            totalNodesCounterRef.current++
          }

          // Draw small bifurcation node dot
          offCtx.beginPath()
          offCtx.arc(h.x, h.y, currentWidth * 1.5, 0, Math.PI * 2)
          offCtx.fillStyle = strokeColor
          offCtx.fill()
        }
      }

      // Check boundaries & lifespan
      const outOfBounds = h.x < -50 || h.x > width + 50 || h.y < -50 || h.y > height + 50
      if (!outOfBounds && h.lifespan < h.maxLifespan && h.energy > 0.05) {
        nextHyphae.push(h)
      }
    }

    offCtx.restore()

    // Draw epoch rings if enabled
    if (config.showEpochRings && maxEpoch > 0) {
      offCtx.save()
      offCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      offCtx.setLineDash([4, 8])
      offCtx.lineWidth = 1
      for (let e = 1; e <= maxEpoch + 2; e++) {
        const ringR = e * config.epochInterval
        offCtx.beginPath()
        offCtx.arc(originRef.current.x, originRef.current.y, ringR, 0, Math.PI * 2)
        offCtx.stroke()
      }
      offCtx.restore()
    }

    // Render offscreen buffer to display canvas
    displayCtx.clearRect(0, 0, width, height)
    displayCtx.drawImage(offCanvas, 0, 0)

    hyphaeRef.current = nextHyphae

    // FPS Meter
    frameCountRef.current++
    const now = performance.now()
    if (now - lastFpsCheckRef.current >= 500) {
      const currentFps = Math.round(
        (frameCountRef.current * 1000) / (now - lastFpsCheckRef.current),
      )
      frameCountRef.current = 0
      lastFpsCheckRef.current = now

      setMetrics({
        activeHyphae: nextHyphae.length,
        totalNodes: totalNodesCounterRef.current,
        maxEpochReached: maxEpoch,
        currentGenMax: maxGen,
        fps: currentFps,
      })
    }

    updateAudioSynthesizer(nextHyphae.length, maxDist)
  }, [config, updateAudioSynthesizer])

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return

    const loop = () => {
      stepSimulation()
      animationFrameIdRef.current = requestAnimationFrame(loop)
    }

    animationFrameIdRef.current = requestAnimationFrame(loop)
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [isRunning, stepSimulation])

  // Canvas click to re-center origin
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    originRef.current = { x, y }

    // Seed new hyphae from clicked point
    const prng = prngRef.current
    const newBurst: Hypha[] = []
    const burstCount = 60
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2
      newBurst.push({
        id: hyphaIdCounterRef.current++,
        x,
        y,
        angle,
        speed: config.baseSpeed * (0.9 + prng() * 0.4),
        generation: 0,
        epochIndex: 0,
        distFromCenter: 0,
        lifespan: 0,
        maxLifespan: 350,
        energy: 1.0,
      })
    }
    hyphaeRef.current = [...hyphaeRef.current, ...newBurst]
    totalNodesCounterRef.current += burstCount
  }

  // Export 4K Canvas Render
  const exportSnapshot = () => {
    const offCanvas = offscreenCanvasRef.current
    if (!offCanvas) return

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = 3840
    exportCanvas.height = 2160
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    // Draw dark background
    ctx.fillStyle = '#0a0c12'
    ctx.fillRect(0, 0, 3840, 2160)

    // Scale and draw current mycelium canvas
    ctx.drawImage(offCanvas, 0, 0, 3840, 2160)

    // Add watermark signature
    ctx.font = '24px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillText(`CHRONOS MYCELIUM - Seed #${config.palette}-${config.seed}`, 40, 2120)

    const link = document.createElement('a')
    link.download = `chronos-mycelium-seed-${config.seed}-${Date.now()}.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  const applyPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      const updated = { ...config, ...PRESETS[presetKey] }
      setConfig(updated)
      initEngine(updated)
    }
  }

  const handleConfigChange = <K extends keyof SimulationConfig>(
    key: K,
    value: SimulationConfig[K],
  ) => {
    const updated = { ...config, [key]: value }
    setConfig(updated)
    if (['seed', 'initialCount', 'epochInterval', 'maxGeneration'].includes(key)) {
      initEngine(updated)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#07080d',
        overflow: 'hidden',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Primary HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />

      {/* Floating HUD Header Metrics */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(12, 16, 26, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          p: 1.5,
          zIndex: 10,
          pointerEvents: 'auto',
        }}
      >
        <Stack direction='row' spacing={2.5} alignItems='center'>
          <Box>
            <Typography variant='overline' sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
              ACTIVE HYPHAE
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#38bdf8' }}>
              {metrics.activeHyphae.toLocaleString()}
            </Typography>
          </Box>
          <Divider orientation='vertical' flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box>
            <Typography variant='overline' sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
              TOTAL NODES
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#f43f5e' }}>
              {metrics.totalNodes.toLocaleString()}
            </Typography>
          </Box>
          <Divider orientation='vertical' flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box>
            <Typography variant='overline' sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
              MAX EPOCH
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#fbbf24' }}>
              E-{metrics.maxEpochReached}
            </Typography>
          </Box>
          <Divider orientation='vertical' flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box>
            <Typography variant='overline' sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
              FPS
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#34d399' }}>
              {metrics.fps}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Floating Toolbar Controls */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          top: 16,
          right: panelOpen ? 370 : 16,
          backgroundColor: 'rgba(12, 16, 26, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          p: 0.75,
          zIndex: 10,
          transition: 'right 0.3s ease',
        }}
      >
        <Stack direction='row' spacing={1}>
          <Tooltip title={isRunning ? 'Pause Simulation' : 'Play Simulation'}>
            <IconButton color='primary' onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title='Step 1 Frame'>
            <IconButton color='info' onClick={() => stepSimulation()}>
              <SkipNextIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Reset Colony Engine'>
            <IconButton color='secondary' onClick={() => initEngine(config)}>
              <ReplayIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Randomize Seed'>
            <IconButton
              sx={{ color: '#a855f7' }}
              onClick={() => {
                const newSeed = Math.floor(Math.random() * 100000)
                handleConfigChange('seed', newSeed)
              }}
            >
              <ShuffleIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          <Tooltip title={audioEnabled ? 'Mute Soundscape' : 'Enable Generative Drone'}>
            <IconButton color={audioEnabled ? 'success' : 'default'} onClick={toggleAudio}>
              {audioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title='Export 4K PNG Snapshot'>
            <IconButton color='warning' onClick={exportSnapshot}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={panelOpen ? 'Collapse Control Panel' : 'Expand Control Panel'}>
            <IconButton color='default' onClick={() => setPanelOpen(!panelOpen)}>
              {panelOpen ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Control Panel Drawer Sidebar */}
      <Paper
        elevation={10}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 350,
          backgroundColor: 'rgba(10, 14, 23, 0.92)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 9,
          p: 2.5,
          overflowY: 'auto',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <AutoAwesomeIcon sx={{ color: '#38bdf8' }} />
            <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
              CHRONOS MATRIX
            </Typography>
          </Stack>
          <Chip label={`Seed #${config.seed}`} size='small' color='primary' variant='outlined' />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Presets */}
        <Box>
          <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600 }}>
            PARAMETRIC PRESETS
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                size='small'
                variant='outlined'
                onClick={() => applyPreset('bioluminescent_abyss')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Bioluminescent
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                size='small'
                variant='outlined'
                color='warning'
                onClick={() => applyPreset('amber_fossil')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Amber Fossil
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                size='small'
                variant='outlined'
                color='success'
                onClick={() => applyPreset('emerald_network')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Emerald Web
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                size='small'
                variant='outlined'
                color='secondary'
                onClick={() => applyPreset('nebula_blossom')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Nebula Spores
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Color Palette */}
        <FormControl fullWidth size='small'>
          <InputLabel id='palette-label' sx={{ color: '#94a3b8' }}>
            Color Palette
          </InputLabel>
          <Select
            labelId='palette-label'
            value={config.palette}
            label='Color Palette'
            onChange={(e) => handleConfigChange('palette', e.target.value as ColorPaletteId)}
          >
            {Object.entries(PALETTES).map(([id, p]) => (
              <MenuItem key={id} value={id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Dynamic Sliders */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Flow Field Speed */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Growth Velocity
              </Typography>
              <Typography variant='body2' sx={{ color: '#38bdf8' }}>
                {config.baseSpeed.toFixed(1)}
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.5}
              max={5.0}
              step={0.1}
              value={config.baseSpeed}
              onChange={(_, val) => handleConfigChange('baseSpeed', val as number)}
            />
          </Box>

          {/* Noise Frequency */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Perlin Turbulence Scale
              </Typography>
              <Typography variant='body2' sx={{ color: '#38bdf8' }}>
                {config.noiseScale.toFixed(4)}
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.001}
              max={0.015}
              step={0.0005}
              value={config.noiseScale}
              onChange={(_, val) => handleConfigChange('noiseScale', val as number)}
            />
          </Box>

          {/* Trigonometric Warp Factor */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Trigonometric Polar Warp
              </Typography>
              <Typography variant='body2' sx={{ color: '#38bdf8' }}>
                {config.trigWarpFactor.toFixed(1)}
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.0}
              max={3.0}
              step={0.1}
              value={config.trigWarpFactor}
              onChange={(_, val) => handleConfigChange('trigWarpFactor', val as number)}
            />
          </Box>

          {/* Epoch Threshold Interval */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Radial Epoch Interval (px)
              </Typography>
              <Typography variant='body2' sx={{ color: '#fbbf24' }}>
                {config.epochInterval}px
              </Typography>
            </Box>
            <Slider
              size='small'
              min={20}
              max={100}
              step={5}
              value={config.epochInterval}
              onChange={(_, val) => handleConfigChange('epochInterval', val as number)}
            />
          </Box>

          {/* Markov Bifurcation Probability */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Bifurcation Probability
              </Typography>
              <Typography variant='body2' sx={{ color: '#f43f5e' }}>
                {(config.bifurcationProb * 100).toFixed(0)}%
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.1}
              max={0.95}
              step={0.05}
              value={config.bifurcationProb}
              onChange={(_, val) => handleConfigChange('bifurcationProb', val as number)}
            />
          </Box>

          {/* Angle Deflection Range */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Branch Deflection Angle
              </Typography>
              <Typography variant='body2' sx={{ color: '#38bdf8' }}>
                {(config.angleDeflection * (180 / Math.PI)).toFixed(0)}°
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.1}
              max={1.2}
              step={0.05}
              value={config.angleDeflection}
              onChange={(_, val) => handleConfigChange('angleDeflection', val as number)}
            />
          </Box>

          {/* Opacity Fade / Trail Persistence */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Amber Persistence (Fade)
              </Typography>
              <Typography variant='body2' sx={{ color: '#34d399' }}>
                {config.opacityFade.toFixed(3)}
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.002}
              max={0.05}
              step={0.001}
              value={config.opacityFade}
              onChange={(_, val) => handleConfigChange('opacityFade', val as number)}
            />
          </Box>

          {/* Line Width */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                Hyphae Line Width
              </Typography>
              <Typography variant='body2' sx={{ color: '#38bdf8' }}>
                {config.lineWidth.toFixed(1)}px
              </Typography>
            </Box>
            <Slider
              size='small'
              min={0.5}
              max={4.0}
              step={0.1}
              value={config.lineWidth}
              onChange={(_, val) => handleConfigChange('lineWidth', val as number)}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Toggles */}
        <FormControlLabel
          control={
            <Switch
              checked={config.showEpochRings}
              onChange={(e) => handleConfigChange('showEpochRings', e.target.checked)}
              size='small'
            />
          }
          label={
            <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
              Show Concentric Epoch Guides
            </Typography>
          }
        />

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Typography
            variant='caption'
            sx={{ color: '#64748b', display: 'block', textAlign: 'center' }}
          >
            Click anywhere on canvas to relocate or seed new hyphae.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChronosMycelium
