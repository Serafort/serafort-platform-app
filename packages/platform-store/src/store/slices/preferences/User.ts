export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'fr' | 'ar'

  notifications: {
    email: boolean
    push: boolean
    jobMatches: boolean
    applicationUpdates: boolean
    scraperComplete: boolean
  }

  jobPreferences: {
    defaultSearchRadius: number
    preferredLocations: string[]
    preferredJobTypes: string[]
    salaryExpectation: {
      min: number
      max: number
      currency: string
    }
  }

  privacy: {
    profileVisibility: 'public' | 'private'
    shareAnalytics: boolean
  }

  display: {
    jobsPerPage: number
    showSalary: boolean
    showCompanyRatings: boolean
  }
}

export const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    jobMatches: true,
    applicationUpdates: true,
    scraperComplete: true,
  },
  jobPreferences: {
    defaultSearchRadius: 25,
    preferredLocations: [],
    preferredJobTypes: [],
    salaryExpectation: {
      min: 0,
      max: 200000,
      currency: 'USD',
    },
  },
  privacy: {
    profileVisibility: 'private',
    shareAnalytics: false,
  },
  display: {
    jobsPerPage: 20,
    showSalary: true,
    showCompanyRatings: true,
  },
}
