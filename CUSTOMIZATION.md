# 🎨 Customization Guide

This guide will help you customize the resume game template with your own information, styling, and branding.

## ⚡ Quick Reference

**Must Replace (5 minutes):**
1. `public/N Pinches Resume 10.22.25.docx.pdf` → Your resume PDF
2. `public/Nate.png` → Your profile picture  
3. `public/SuperNate.png` → Your character sprite
4. `lib/work-experiences.ts` → Your work history (use Cursor AI prompt below)
5. `public/Logos/` → Your company logos

**Cursor AI Prompt for Work Experience:**
```
I have a resume game template that needs to be updated with my work experience. 
Please read my resume and update the workExperiences array in lib/work-experiences.ts.

The current structure is:
export const workExperiences = [
  {
    company: "Company Name",
    title: "Job Title", 
    period: "Start Date - End Date",
    description: "Brief description of role and responsibilities",
    achievements: ["Achievement 1", "Achievement 2", "Achievement 3"]
  }
]

Please extract my work experience from my resume and format it to match this structure. 
Include 3-6 most relevant positions, focusing on recent roles and key achievements.
```

## 📝 Quick Start

1. **Run the setup script** (recommended):
   ```bash
   pnpm setup
   ```
   This will guide you through configuring analytics and basic settings.

2. **Manual setup** (if you prefer):
   - Copy `.env.example` to `.env.local`
   - Fill in your configuration
   - Update `lib/analytics.ts` with your chosen analytics provider

## 🎯 Essential Files to Replace

### Must Replace (Required for Personalization)

| File | What to Replace | Purpose |
|------|----------------|---------|
| `public/N Pinches Resume 10.22.25.docx.pdf` | Your resume PDF | Downloadable resume in game |
| `public/Nate.png` | Your profile picture | Avatar shown in game |
| `public/SuperNate.png` | Your character sprite | Main player character |
| `public/NateHooray.png` | Your celebration image | Victory screen image |
| `lib/work-experiences.ts` | Your work history | Game content data |
| `public/Logos/*.png` | Your company logos | Company logos in game |

### Optional Replacements

| File | What to Replace | Purpose |
|------|----------------|---------|
| `public/audio/*.mp3` | Your sound effects | Game audio |
| `components/super-nate-game.tsx` | Story text | Game narrative |
| `app/layout.tsx` | Site metadata | SEO and branding |

## 🎯 Essential Customizations

### 1. Work Experience Data

#### Option A: Use Cursor AI (Recommended) 🤖

This is the easiest way to extract your work experience from your resume:

1. **Open your resume PDF in Cursor**
2. **Open the file** `lib/work-experiences.ts` in Cursor
3. **Use this prompt** in Cursor:

```
I have a resume game template that needs to be updated with my work experience. 
Please read my resume and update the workExperiences array in lib/work-experiences.ts.

The current structure is:
export const workExperiences = [
  {
    company: "Company Name",
    title: "Job Title", 
    period: "Start Date - End Date",
    description: "Brief description of role and responsibilities",
    achievements: ["Achievement 1", "Achievement 2", "Achievement 3"]
  }
]

Please extract my work experience from my resume and format it to match this structure. 
Include 3-6 most relevant positions, focusing on recent roles and key achievements.

For each position, include:
- Company name
- Job title
- Employment period (e.g., "Jan 2020 - Present")
- 2-3 sentence description of your role
- 3-5 key achievements with quantifiable results when possible

Make sure the achievements are specific and impactful (e.g., "Increased sales by 25%" rather than "Improved sales").
```

4. **Review and adjust** the generated content as needed

#### Option B: Manual Update

Edit `lib/work-experiences.ts` with your professional history:

```typescript
export const workExperiences = [
  {
    company: "Your Company Name",
    title: "Your Job Title",
    period: "Jan 2020 - Present",
    description: "Brief description of your role and responsibilities...",
    achievements: [
      "Key achievement 1",
      "Key achievement 2", 
      "Key achievement 3"
    ],
  },
  // Add more experiences...
]
```

**Tips:**
- Keep descriptions concise but impactful
- Highlight quantifiable achievements
- Order by relevance or chronology
- 3-6 experiences work best for gameplay

### 2. Images and Assets

Replace these key images in the `public/` folder:

| File | Purpose | Recommended Size |
|------|---------|------------------|
| `SuperNate.png` | Main character sprite | 64x64px |
| `Nate.png` | Profile/avatar image | 200x200px |
| `NateHooray.png` | Victory celebration image | 300x300px |
| `Starfighter.png` | Player spaceship | 64x64px |
| `spaceship.png` | Alien spaceships | 64x64px |
| `resume-preview.png` | Resume preview thumbnail | 400x500px |

**Company Logos:**
- Add your company logos to `public/Logos/`
- Update the `getCompanyLogo` function in:
  - `components/super-nate-game.tsx` (line ~25)
  - `app/page.tsx` (line ~20)

### 3. Professional Website Links (Optional)

Add links to your professional profiles in the cockpit dashboard:

1. **Open** `components/cockpit-dashboard.tsx`
2. **Find the cockpit controls section** (around line 200)
3. **Add your links** to the appropriate controls:

```typescript
// Example: Add LinkedIn link to the comms switch
<button
  onClick={() => {
    setCommsSwitch(!commsSwitch)
    analytics.capture('easter_egg_clicked', { type: 'comms_switch' })
    // Add your LinkedIn link
    window.open('https://linkedin.com/in/yourprofile', '_blank')
  }}
  // ... rest of button props
>
```

**Suggested Links:**
- **LinkedIn**: Professional networking
- **GitHub**: Code repositories
- **Portfolio**: Personal website
- **Twitter/X**: Social media presence
- **Email**: Contact information

### 4. Story and Narrative

Customize the game story in `components/super-nate-game.tsx`:

```typescript
const STORY_PARTS = [
  "Welcome to your professional journey!",
  "You've been chosen to recover your work memories...",
  "Each alien ship contains a piece of your career history...",
  "Defeat them all to unlock your complete professional story!"
]
```

### 4. Site Metadata

Update `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Name - Interactive Resume",
  description: "An interactive game showcasing my professional journey",
  // Add more metadata as needed
}
```

## 🎨 Visual Customization

### Colors and Theme

The game uses a space theme with these key colors:
- Primary: `#F54E00` (orange)
- Secondary: `#DC9300` (yellow)
- Background: `#151515` (dark)
- Text: `#FFFFFF` (white)

To change colors, update the Tailwind classes throughout the components.

### Typography

The game uses the Geist font family. To change fonts:

1. Update `app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// Use in className
```

2. Update `tailwind.config.js` if needed.

### Audio

Replace audio files in `public/audio/`:
- `SuperNate.mp3` - Background music
- `pew.mp3` - Laser sound
- `zing.mp3` - Hit sound
- `Congratulations.m4a` - Victory sound

## 📊 Analytics Configuration

### PostHog (Recommended)

1. Sign up at [PostHog](https://posthog.com)
2. Create a new project
3. Get your project key
4. Set environment variables:
```bash
NEXT_PUBLIC_POSTHOG_KEY=your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Google Analytics 4

1. Create a GA4 property
2. Get your Measurement ID
3. Set environment variable:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Mixpanel

1. Sign up at [Mixpanel](https://mixpanel.com)
2. Create a project
3. Get your project token
4. Set environment variable:
```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

### Plausible

1. Sign up at [Plausible](https://plausible.io)
2. Add your domain
3. Set environment variable:
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Vercel Analytics

Automatically enabled when deployed to Vercel. No configuration needed.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This is a standard Next.js app and works on:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## 🎮 Game Mechanics Customization

### Difficulty

Adjust game difficulty in `components/super-nate-game.tsx`:

```typescript
// Enemy spawn rate (lower = more enemies)
const ENEMY_SPAWN_RATE = 0.02

// Enemy speed
const ENEMY_SPEED = 2

// Laser speed
const LASER_SPEED = 8
```

### Controls

The game supports:
- **Desktop**: Arrow keys + Spacebar
- **Mobile**: Touch controls

To modify controls, update the event handlers in the game component.

### Easter Eggs

Customize the cockpit dashboard in `components/cockpit-dashboard.tsx`:
- Power switch
- Shields switch
- Thrusters switch (affects game speed)
- Comms switch
- Speed gauge
- Fuel gauge

## 🔧 Advanced Customization

### Adding New Features

1. **New Game Elements**: Add new sprites, sounds, or mechanics
2. **Additional Memory Types**: Extend the work experience system
3. **Multiplayer**: Add real-time multiplayer features
4. **Leaderboards**: Track high scores and achievements

### Performance Optimization

- Optimize images with Next.js Image component
- Use dynamic imports for heavy components
- Implement proper loading states
- Consider code splitting for large games

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**: Check file paths and ensure images are in `public/`
2. **Analytics not working**: Verify environment variables and network connectivity
3. **Build errors**: Check TypeScript types and import statements
4. **Styling issues**: Verify Tailwind classes and CSS imports

### Getting Help

- Check the [Issues](https://github.com/yourusername/resume-game-template/issues) page
- Create a new issue with details about your problem
- Include error messages and steps to reproduce

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [PostHog Documentation](https://posthog.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🎉 Have Fun!

This template is designed to be flexible and fun to customize. Don't be afraid to experiment and make it your own! If you create something cool, we'd love to see it - share it with the community!
