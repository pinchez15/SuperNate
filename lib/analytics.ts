// PostHog analytics integration
import posthog from 'posthog-js'

let analyticsEnabled = false

// PostHog analytics wrapper
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled) {
      // Silently ignore if analytics not configured
      return
    }
    
    try {
      posthog.capture(eventName, properties)
    } catch (error) {
      console.warn('PostHog analytics error:', error)
    }
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  if (posthogKey) {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // We handle this manually in analytics-provider.tsx
        capture_pageleave: true,
      })
      analyticsEnabled = true
      console.log('PostHog analytics initialized')
    } catch (error) {
      console.warn('Failed to initialize PostHog:', error)
      analyticsEnabled = false
    }
  } else {
    // Analytics disabled by default - no console log to avoid noise
    analyticsEnabled = false
  }
}

