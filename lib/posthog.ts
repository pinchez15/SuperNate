import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn('PostHog key not found')
      return
    }
    
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      // Capture pageviews
      capture_pageview: true,
      // Capture performance metrics
      capture_pageleave: true,
    })
  }
}

export { posthog }

