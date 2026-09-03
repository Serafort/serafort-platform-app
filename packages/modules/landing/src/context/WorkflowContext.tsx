/**
 * WorkflowContext - Centralized Pipeline State Management
 *
 * Orchestrates data flow through the 7-step job seeker workflow:
 * 1. ProfileManagement → 2. ProfileAnalyzer → 3. Scraper → 4. Jobs →
 * 5. JobAnalysis → 6. Automation → 7. ApplicationTracker
 */

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string
  name: string
  resumeText: string
  skills: string[]
  experienceLevel: string
  isActive: boolean
}

export interface RecommendedRole {
  id: string
  title: string
  category: string
  overallFitScore: number
  skillsScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export interface RawJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  platform: 'linkedin' | 'indeed' | 'glassdoor' | 'other'
  scrapedAt: string
}

export interface NormalizedJob {
  id: string
  title: string
  company: string
  companyId?: string
  location: string
  description: string
  url: string
  jobType: string
  experienceLevel: string
  salary?: string
  postedDate: string
  isActive: boolean
}

export interface RankedJob extends NormalizedJob {
  matchScore: number
  skillsMatchPercentage: number
  experienceMatchScore: number
  matchCategory: 'excellent' | 'good' | 'fair' | 'poor'
  matchingSkills: string[]
  missingSkills: string[]
  recommendation: string
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  status: 'draft' | 'ready' | 'submitted' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  appliedAt?: string
  coverLetter?: string
  resumeVersion?: string
  notes?: string
  followUpDate?: string
}

export type WorkflowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const WORKFLOW_STEPS = {
  1: {
    name: 'Profile Management',
    path: '/profile-management',
    module: 'ProfileManagement',
  },
  2: {
    name: 'Profile Analyzer',
    path: '/profile-analyzer',
    module: 'ProfileAnalyzer',
  },
  3: { name: 'Job Scraper', path: '/scraper', module: 'Scraper' },
  4: { name: 'Jobs', path: '/jobs', module: 'Jobs' },
  5: { name: 'Job Analysis', path: '/job-analysis', module: 'JobAnalysis' },
  6: { name: 'Automation', path: '/automation', module: 'Automation' },
  7: {
    name: 'Application Tracker',
    path: '/application-tracker',
    module: 'ApplicationTracker',
  },
} as const

export interface WorkflowState {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]

  // Data from each step
  userProfile: UserProfile | null
  recommendedRoles: RecommendedRole[]
  scrapedJobs: RawJob[]
  normalizedJobs: NormalizedJob[]
  rankedJobs: RankedJob[]
  applications: Application[]

  // Metadata
  lastUpdated: string | null
  isLoading: boolean
  error: string | null
}

// ============================================================================
// Actions
// ============================================================================

type WorkflowAction =
  | { type: 'SET_STEP'; payload: WorkflowStep }
  | { type: 'COMPLETE_STEP'; payload: WorkflowStep }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'SET_RECOMMENDED_ROLES'; payload: RecommendedRole[] }
  | { type: 'ADD_SCRAPED_JOBS'; payload: RawJob[] }
  | { type: 'SET_NORMALIZED_JOBS'; payload: NormalizedJob[] }
  | { type: 'SET_RANKED_JOBS'; payload: RankedJob[] }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | {
      type: 'UPDATE_APPLICATION'
      payload: { id: string; updates: Partial<Application> }
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_WORKFLOW' }

// ============================================================================
// Initial State
// ============================================================================

const initialState: WorkflowState = {
  currentStep: 1,
  completedSteps: [],
  userProfile: null,
  recommendedRoles: [],
  scrapedJobs: [],
  normalizedJobs: [],
  rankedJobs: [],
  applications: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
}

// ============================================================================
// Reducer
// ============================================================================

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, lastUpdated: now }

    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload].sort((a, b) => a - b),
        lastUpdated: now,
      }

    case 'SET_PROFILE':
      return { ...state, userProfile: action.payload, lastUpdated: now }

    case 'CLEAR_PROFILE':
      return { ...state, userProfile: null, lastUpdated: now }

    case 'SET_RECOMMENDED_ROLES':
      return { ...state, recommendedRoles: action.payload, lastUpdated: now }

    case 'ADD_SCRAPED_JOBS':
      return {
        ...state,
        scrapedJobs: [...state.scrapedJobs, ...action.payload],
        lastUpdated: now,
      }

    case 'SET_NORMALIZED_JOBS':
      return { ...state, normalizedJobs: action.payload, lastUpdated: now }

    case 'SET_RANKED_JOBS':
      return { ...state, rankedJobs: action.payload, lastUpdated: now }

    case 'ADD_APPLICATION':
      return {
        ...state,
        applications: [...state.applications, action.payload],
        lastUpdated: now,
      }

    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id ? { ...app, ...action.payload.updates } : app,
        ),
        lastUpdated: now,
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'RESET_WORKFLOW':
      return { ...initialState, lastUpdated: now }

    default:
      return state
  }
}

// ============================================================================
// Context
// ============================================================================

interface WorkflowContextValue extends WorkflowState {
  // Navigation
  setStep: (step: WorkflowStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  completeStep: (step: WorkflowStep) => void

  // Profile actions
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void

  // Role recommendations
  setRecommendedRoles: (roles: RecommendedRole[]) => void

  // Jobs
  addScrapedJobs: (jobs: RawJob[]) => void
  setNormalizedJobs: (jobs: NormalizedJob[]) => void
  setRankedJobs: (jobs: RankedJob[]) => void

  // Applications
  addApplication: (app: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void

  // Utilities
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetWorkflow: () => void

  // Computed values
  getStepInfo: (step: WorkflowStep) => (typeof WORKFLOW_STEPS)[WorkflowStep]
  isStepCompleted: (step: WorkflowStep) => boolean
  canAccessStep: (step: WorkflowStep) => boolean
  getProgressPercentage: () => number
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

// ============================================================================
// Provider
// ============================================================================

interface WorkflowProviderProps {
  children: ReactNode
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [state, dispatch] = useReducer(workflowReducer, initialState)

  // Navigation
  const setStep = useCallback((step: WorkflowStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const goToNextStep = useCallback(() => {
    if (state.currentStep < 7) {
      dispatch({
        type: 'SET_STEP',
        payload: (state.currentStep + 1) as WorkflowStep,
      })
    }
  }, [state.currentStep])

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({
        type: 'SET_STEP',
        payload: (state.currentStep - 1) as WorkflowStep,
      })
    }
  }, [state.currentStep])

  const completeStep = useCallback((step: WorkflowStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: step })
  }, [])

  // Profile actions
  const setProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile })
  }, [])

  const clearProfile = useCallback(() => {
    dispatch({ type: 'CLEAR_PROFILE' })
  }, [])

  // Role recommendations
  const setRecommendedRoles = useCallback((roles: RecommendedRole[]) => {
    dispatch({ type: 'SET_RECOMMENDED_ROLES', payload: roles })
  }, [])

  // Jobs
  const addScrapedJobs = useCallback((jobs: RawJob[]) => {
    dispatch({ type: 'ADD_SCRAPED_JOBS', payload: jobs })
  }, [])

  const setNormalizedJobs = useCallback((jobs: NormalizedJob[]) => {
    dispatch({ type: 'SET_NORMALIZED_JOBS', payload: jobs })
  }, [])

  const setRankedJobs = useCallback((jobs: RankedJob[]) => {
    dispatch({ type: 'SET_RANKED_JOBS', payload: jobs })
  }, [])

  // Applications
  const addApplication = useCallback((app: Application) => {
    dispatch({ type: 'ADD_APPLICATION', payload: app })
  }, [])

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    dispatch({ type: 'UPDATE_APPLICATION', payload: { id, updates } })
  }, [])

  // Utilities
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const resetWorkflow = useCallback(() => {
    dispatch({ type: 'RESET_WORKFLOW' })
  }, [])

  // Computed values
  const getStepInfo = useCallback((step: WorkflowStep) => {
    return WORKFLOW_STEPS[step]
  }, [])

  const isStepCompleted = useCallback(
    (step: WorkflowStep) => {
      return state.completedSteps.includes(step)
    },
    [state.completedSteps],
  )

  const canAccessStep = useCallback(
    (step: WorkflowStep) => {
      // Step 1 is always accessible
      if (step === 1) return true
      // Can access if previous step is completed
      return state.completedSteps.includes((step - 1) as WorkflowStep)
    },
    [state.completedSteps],
  )

  const getProgressPercentage = useCallback(() => {
    return Math.round((state.completedSteps.length / 7) * 100)
  }, [state.completedSteps.length])

  const value: WorkflowContextValue = {
    ...state,
    setStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    setProfile,
    clearProfile,
    setRecommendedRoles,
    addScrapedJobs,
    setNormalizedJobs,
    setRankedJobs,
    addApplication,
    updateApplication,
    setLoading,
    setError,
    resetWorkflow,
    getStepInfo,
    isStepCompleted,
    canAccessStep,
    getProgressPercentage,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}

export default WorkflowContext
