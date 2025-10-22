#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🎮 Welcome to the Resume Game Setup!');
  console.log('This script will help you configure your analytics and basic settings.\n');

  const config = {};

  // Site configuration
  console.log('📝 Site Configuration');
  config.siteName = await question('What is your name? (e.g., "John Doe"): ');
  config.siteDescription = await question('Brief description of your resume game: ');
  config.siteUrl = await question('Your site URL (e.g., https://yourname.vercel.app): ');

  // Analytics configuration
  console.log('\n📊 Analytics Configuration');
  console.log('Choose your analytics provider:');
  console.log('1. PostHog (Recommended)');
  console.log('2. Google Analytics 4');
  console.log('3. Mixpanel');
  console.log('4. Plausible');
  console.log('5. Vercel Analytics only');
  console.log('6. No analytics');

  const analyticsChoice = await question('Enter your choice (1-6): ');

  switch (analyticsChoice) {
    case '1':
      config.analytics = 'posthog';
      config.posthogKey = await question('Enter your PostHog project key: ');
      config.posthogHost = await question('Enter your PostHog host (or press Enter for default): ') || 'https://app.posthog.com';
      break;
    case '2':
      config.analytics = 'ga4';
      config.gaMeasurementId = await question('Enter your GA4 Measurement ID (G-XXXXXXXXXX): ');
      break;
    case '3':
      config.analytics = 'mixpanel';
      config.mixpanelToken = await question('Enter your Mixpanel token: ');
      break;
    case '4':
      config.analytics = 'plausible';
      config.plausibleDomain = await question('Enter your domain for Plausible: ');
      break;
    case '5':
      config.analytics = 'vercel';
      break;
    case '6':
      config.analytics = 'none';
      break;
    default:
      console.log('Invalid choice, defaulting to Vercel Analytics only');
      config.analytics = 'vercel';
  }

  // Generate .env.local file
  console.log('\n🔧 Generating configuration files...');
  
  let envContent = `# Site Configuration
NEXT_PUBLIC_SITE_URL=${config.siteUrl}
NEXT_PUBLIC_SITE_NAME="${config.siteName} - Resume Game"
NEXT_PUBLIC_SITE_DESCRIPTION="${config.siteDescription}"

# Analytics Configuration
`;

  switch (config.analytics) {
    case 'posthog':
      envContent += `NEXT_PUBLIC_POSTHOG_KEY=${config.posthogKey}
NEXT_PUBLIC_POSTHOG_HOST=${config.posthogHost}
`;
      break;
    case 'ga4':
      envContent += `NEXT_PUBLIC_GA_MEASUREMENT_ID=${config.gaMeasurementId}
`;
      break;
    case 'mixpanel':
      envContent += `NEXT_PUBLIC_MIXPANEL_TOKEN=${config.mixpanelToken}
`;
      break;
    case 'plausible':
      envContent += `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${config.plausibleDomain}
`;
      break;
    case 'vercel':
      envContent += `# Vercel Analytics (automatically enabled on Vercel)
`;
      break;
    case 'none':
      envContent += `# No analytics configured
`;
      break;
  }

  // Write .env.local
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local file');

  // Update analytics.ts based on choice
  updateAnalyticsFile(config.analytics);

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Edit lib/work-experiences.ts with your work history');
  console.log('2. Replace images in public/ folder with your own');
  console.log('3. Update the story text in components/super-nate-game.tsx');
  console.log('4. Run "pnpm dev" to start developing');
  console.log('5. Deploy to Vercel when ready!');

  rl.close();
}

function updateAnalyticsFile(analyticsType) {
  const analyticsPath = path.join(__dirname, '..', 'lib', 'analytics.ts');
  
  let analyticsContent = '';
  
  switch (analyticsType) {
    case 'posthog':
      analyticsContent = `// PostHog analytics integration
import posthog from 'posthog-js'

let analyticsEnabled = false

// PostHog analytics wrapper
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled) {
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
        capture_pageview: false,
        capture_pageleave: true,
      })
      analyticsEnabled = true
      console.log('PostHog analytics initialized')
    } catch (error) {
      console.warn('Failed to initialize PostHog:', error)
      analyticsEnabled = false
    }
  } else {
    console.log('PostHog key not found, analytics disabled')
    analyticsEnabled = false
  }
}`;
      break;
      
    case 'ga4':
      analyticsContent = `// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

let analyticsEnabled = false

// Google Analytics 4 wrapper
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled || typeof window === 'undefined') {
      return
    }
    
    try {
      window.gtag('event', eventName, properties)
    } catch (error) {
      console.warn('GA4 analytics error:', error)
    }
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  if (measurementId) {
    try {
      // Load GA4 script
      const script = document.createElement('script')
      script.async = true
      script.src = \`https://www.googletagmanager.com/gtag/js?id=\${measurementId}\`
      document.head.appendChild(script)
      
      window.dataLayer = window.dataLayer || []
      window.gtag = function() { window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', measurementId)
      
      analyticsEnabled = true
      console.log('Google Analytics 4 initialized')
    } catch (error) {
      console.warn('Failed to initialize GA4:', error)
      analyticsEnabled = false
    }
  } else {
    console.log('GA4 measurement ID not found, analytics disabled')
    analyticsEnabled = false
  }
}`;
      break;
      
    case 'mixpanel':
      analyticsContent = `// Mixpanel analytics integration
let analyticsEnabled = false

// Mixpanel analytics wrapper
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled || typeof window === 'undefined') {
      return
    }
    
    try {
      // @ts-ignore
      window.mixpanel.track(eventName, properties)
    } catch (error) {
      console.warn('Mixpanel analytics error:', error)
    }
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  
  if (token) {
    try {
      // Load Mixpanel script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js'
      script.onload = () => {
        // @ts-ignore
        window.mixpanel.init(token)
        analyticsEnabled = true
        console.log('Mixpanel analytics initialized')
      }
      document.head.appendChild(script)
    } catch (error) {
      console.warn('Failed to initialize Mixpanel:', error)
      analyticsEnabled = false
    }
  } else {
    console.log('Mixpanel token not found, analytics disabled')
    analyticsEnabled = false
  }
}`;
      break;
      
    case 'plausible':
      analyticsContent = `// Plausible analytics integration
let analyticsEnabled = false

// Plausible analytics wrapper
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled || typeof window === 'undefined') {
      return
    }
    
    try {
      // @ts-ignore
      window.plausible(eventName, { props: properties })
    } catch (error) {
      console.warn('Plausible analytics error:', error)
    }
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  
  if (domain) {
    try {
      // Load Plausible script
      const script = document.createElement('script')
      script.async = true
      script.defer = true
      script.setAttribute('data-domain', domain)
      script.src = 'https://plausible.io/js/script.js'
      document.head.appendChild(script)
      
      // @ts-ignore
      window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
      
      analyticsEnabled = true
      console.log('Plausible analytics initialized')
    } catch (error) {
      console.warn('Failed to initialize Plausible:', error)
      analyticsEnabled = false
    }
  } else {
    console.log('Plausible domain not found, analytics disabled')
    analyticsEnabled = false
  }
}`;
      break;
      
    case 'vercel':
    case 'none':
    default:
      analyticsContent = `// Optional analytics support
// This allows the game to work without requiring analytics to be configured

let analyticsEnabled = false

// Simple analytics wrapper that safely handles missing analytics configuration
export const analytics = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsEnabled) {
      // Silently ignore if analytics not configured
      return
    }
    
    // If you want to add analytics (like Mixpanel, Google Analytics, etc.):
    // 1. Install your analytics library: pnpm add your-analytics-lib
    // 2. Initialize it here
    // 3. Call the appropriate tracking method
    console.log('Analytics event:', eventName, properties)
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  // Example: To add analytics:
  // if (process.env.NEXT_PUBLIC_ANALYTICS_KEY) {
  //   // Initialize your analytics library here
  //   analyticsEnabled = true
  // }
  
  // For now, analytics is disabled by default
  analyticsEnabled = false
}`;
      break;
  }
  
  fs.writeFileSync(analyticsPath, analyticsContent);
  console.log('✅ Updated analytics configuration');
}

// Run setup
setup().catch(console.error);
