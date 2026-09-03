import { useState, useEffect } from 'react'
import { workerService } from '@cap/platform-core'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // State for Service Worker updates
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    // Initialize WorkerService with callbacks
    workerService.init(
      () => setNeedRefresh(true),
      () => setOfflineReady(true),
    )

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  /**
   * Trigger the install prompt
   */
  const install = async () => {
    if (!deferredPrompt) return

    setIsInstallable(false)
    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    setDeferredPrompt(null)
  }

  /**
   * Update the application (skip waiting)
   */
  const update = async () => {
    await workerService.updateServiceWorker(true)
    setNeedRefresh(false)
  }

  return {
    isInstallable,
    install,
    needRefresh,
    offlineReady,
    update,
  }
}
