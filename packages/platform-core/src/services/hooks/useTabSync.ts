/**
 * useTabSync Hook
 *
 * Synchronizes state across multiple browser tabs/windows.
 * Uses BroadcastChannel API for modern browsers and storage events as fallback.
 *
 * @example
 * const { sendMessage, lastMessage } = useTabSync('job-search', (message) => {
 *   console.log('Received from another tab:', message)
 * })
 *
 * sendMessage({ type: 'JOB_SAVED', jobId: '123' })
 */

import React from 'react'

interface TabSyncMessage<T = any> {
  type: string
  payload: T
  timestamp: number
  tabId: string
}

interface UseTabSyncOptions<T> {
  onMessage?: (message: TabSyncMessage<T>) => void
  useBroadcastChannel?: boolean // Use BroadcastChannel API (modern browsers)
  useStorageEvent?: boolean // Use localStorage events (fallback for older browsers)
}

interface UseTabSyncReturn<T> {
  sendMessage: (type: string, payload: T) => void
  lastMessage: TabSyncMessage<T> | null
  connectedTabs: number
  isLeaderTab: boolean
}

/**
 * Generate unique tab ID
 */
const generateTabId = (): string => {
  return `tab_${crypto.randomUUID()}`
}

export function useTabSync<T = any>(
  channelName: string,
  onMessage?: (message: TabSyncMessage<T>) => void,
  options: UseTabSyncOptions<T> = {},
): UseTabSyncReturn<T> {
  const { useBroadcastChannel = true, useStorageEvent = true } = options

  const [lastMessage, setLastMessage] = React.useState<TabSyncMessage<T> | null>(null)
  const [connectedTabs, setConnectedTabs] = React.useState(1)
  const [isLeaderTab, setIsLeaderTab] = React.useState(false)

  const tabIdRef = React.useRef(generateTabId())
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null)
  const heartbeatIntervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const tabCheckIntervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  /**
   * Update connected tabs count
   */
  const updateConnectedTabs = React.useCallback(() => {
    try {
      const tabsData = localStorage.getItem(`${channelName}_tabs`)
      if (tabsData) {
        const tabs = JSON.parse(tabsData)
        const now = Date.now()

        // Filter out stale tabs (no heartbeat in last 10 seconds)
        const activeTabs = Object.entries(tabs).filter(
          ([_, timestamp]) => now - (timestamp as number) < 10000,
        )

        setConnectedTabs(activeTabs.length + 1) // +1 for current tab

        // Check if this is the leader tab (oldest active tab)
        const sortedTabs = activeTabs.sort((a, b) => (a[1] as number) - (b[1] as number))
        setIsLeaderTab(sortedTabs.length === 0 || sortedTabs[0][0] === tabIdRef.current)
      }
    } catch (error) {
      console.error('Error updating connected tabs:', error)
    }
  }, [channelName])

  /**
   * Initialize BroadcastChannel
   */
  React.useEffect(() => {
    if (useBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannelRef.current = new BroadcastChannel(channelName)

        broadcastChannelRef.current.onmessage = (event) => {
          const message = event.data as TabSyncMessage<T>

          // Ignore messages from self
          if (message.tabId === tabIdRef.current) return

          setLastMessage(message)

          if (onMessage) {
            onMessage(message)
          }

          // Handle heartbeat messages to count tabs
          if (message.type === '__HEARTBEAT__') {
            updateConnectedTabs()
          }
        }
      } catch (error) {
        console.error('Error initializing BroadcastChannel:', error)
      }
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close()
      }
    }
  }, [channelName, useBroadcastChannel, onMessage])

  /**
   * Setup storage event listener (fallback)
   */
  React.useEffect(() => {
    if (useStorageEvent) {
      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === `tab_sync_${channelName}` && e.newValue) {
          try {
            const message = JSON.parse(e.newValue) as TabSyncMessage<T>

            // Ignore messages from self
            if (message.tabId === tabIdRef.current) return

            setLastMessage(message)

            if (onMessage) {
              onMessage(message)
            }
          } catch (error) {
            console.error('Error parsing storage event message:', error)
          }
        }
      }

      window.addEventListener('storage', handleStorageEvent)
      return () => window.removeEventListener('storage', handleStorageEvent)
    }
  }, [channelName, useStorageEvent, onMessage])

  /**
   * Update connected tabs count
   */

  /**
   * Send heartbeat to track active tabs
   */
  const sendHeartbeat = React.useCallback(() => {
    try {
      const tabsData = localStorage.getItem(`${channelName}_tabs`)
      const tabs = tabsData ? JSON.parse(tabsData) : {}
      tabs[tabIdRef.current] = Date.now()
      localStorage.setItem(`${channelName}_tabs`, JSON.stringify(tabs))
      updateConnectedTabs()
    } catch (error) {
      console.error('Error sending heartbeat:', error)
    }
  }, [channelName, updateConnectedTabs])

  /**
   * Setup heartbeat interval
   */
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    sendHeartbeat() // Initial heartbeat

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat()
    }, 5173) // Send heartbeat every 3 seconds

    tabCheckIntervalRef.current = setInterval(() => {
      updateConnectedTabs()
    }, 5000) // Check tabs every 5 seconds

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (tabCheckIntervalRef.current) {
        clearInterval(tabCheckIntervalRef.current)
      }

      // Remove this tab from active tabs
      try {
        const tabsData = localStorage.getItem(`${channelName}_tabs`)
        if (tabsData) {
          const tabs = JSON.parse(tabsData)
          delete tabs[tabIdRef.current]
          localStorage.setItem(`${channelName}_tabs`, JSON.stringify(tabs))
        }
      } catch (error) {
        console.error('Error cleaning up tab data:', error)
      }
    }
  }, [channelName, sendHeartbeat, updateConnectedTabs])

  /**
   * Send message to other tabs
   */
  const sendMessage = React.useCallback(
    (type: string, payload: T) => {
      const message: TabSyncMessage<T> = {
        type,
        payload,
        timestamp: Date.now(),
        tabId: tabIdRef.current,
      }

      // Send via BroadcastChannel
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(message)
        } catch (error) {
          console.error('Error sending message via BroadcastChannel:', error)
        }
      }

      // Send via localStorage (fallback)
      if (useStorageEvent) {
        try {
          localStorage.setItem(`tab_sync_${channelName}`, JSON.stringify(message))
          // Clear after a short delay to allow other tabs to read
          setTimeout(() => {
            localStorage.removeItem(`tab_sync_${channelName}`)
          }, 100)
        } catch (error) {
          console.error('Error sending message via localStorage:', error)
        }
      }
    },
    [channelName, useStorageEvent],
  )

  return {
    sendMessage,
    lastMessage,
    connectedTabs,
    isLeaderTab,
  }
}

export default useTabSync
