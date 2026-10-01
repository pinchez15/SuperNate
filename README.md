# SuperNate 64: Hop On A Quick Call

A small 3D game that ends in a real discovery call with Nate. Live at supernate.dev.

**Story:** You type your name, like a cartridge save. Your starfighter comes down in Missed Call, the last town before the woods (pop. 9, all on mute). Your company is drowning in Computer Work, and Nate fixes that, but Nate is a recluse in a cabin past the tree line who has declined 1,400 calls this year. The trail gate wants three things, and each one comes from a townsperson who tells you about something Nate actually built: cold-call nerve pills from the Doctor (Karibu Health), the last 15 minutes on Nate's own booking page from Chad the tech bro (Healthcare AIO), and an agent from the Guide (CappaWork). Those three carry a green "REAL" badge so they stand apart from the jokes. Then you walk up the trail and SuperNate, on his porch, declines you and sends wild turkeys at you. Ten landed pings drain his patience and he says "Fine. Quick call." Three turkey hits refill his patience to 100%, but you stay in the fight. The end card is Nate's real phone number and Calendly link.

The town plays like Mario 64 or Mario Party, with a bright lawn, hedges, and a trailhead gate. The fight plays like Super Smash Bros. on a side-view clearing with fallen-log platforms and the cabin on the right. Everything is Three.js with no asset files.

**Side trips and easter eggs:**

- Gerald, a pigeon who founded FlyFry (fries by carrier pigeon, one fry per bird). He also tells you to keep knocking at Combinator Y Academy.
- Combinator Y Academy: knock six times and you get stilts. Being tall gets you a direct intro, which skips the fight.
- The 10x Engineer in the Waymo lot has 300,000 lines of code running and has shipped nothing.
- Ranger Deb at the ranger station: "Don't feed the turkeys. Nate does. They work for him now." She has a fry in an evidence bag.
- Fries: 20 are scattered around town. Bring all 20 into the fight and the turkeys stop to eat instead of hitting you.
- Ground pound (Shift or down in the air) scatters ground turkeys. Flying turkeys cross at platform height.
- Talking to the crashed starfighter is the hidden way into the 1987 shooter.

- **Controls:** WASD or arrows move. E or Space talks. Q does the quick-call emote. In the fight, Space jumps, Shift or down in the air pounds, and J or a click pings. On phones, an on-screen D-pad and A/B buttons appear.
- **Look tuning:** `/lookbook` shows the stage, a camera switch, the character select screen, and sliders for texture blur, roundness, fog, dither, and resolution.
- **Boss timing test:** `pnpm test:boss` runs the fight headless with four bots. The dodging bot has to win in 8 to 45 seconds, the camper and pounder have to win, and the bot that never dodges has to lose, since three turkey hits refill SuperNate's patience.
- **Framed sites:** CappaWork and Healthcare AIO block iframes, so `/api/peek` serves those two exact homepages same-origin. Karibu embeds directly.
- **Analytics events:** `name_entered`, `level_started`, `invite_received`, `product_card_opened`, `easter_egg_found`, `boss_patience_depleted`, `hopped_on_a_quick_call`, `phone_clicked`, `calendly_clicked`. The player's name is never sent.

Code lives in `components/town/` (renderer, models, stage, game loop, UI) and `lib/town/` (world layout, dialogue, and the boss simulation).

---

# Resume Game Template

An interactive resume game template built with Next.js! Create your own personalized resume game where players help you defeat aliens and recover work experience memories.

## ✨ Features

- 🚀 **Interactive Space Shooter Game** - Engaging gameplay that showcases your professional journey
- 🎯 **Customizable Work Experiences** - Easy to add your own career history
- 📊 **Multiple Analytics Options** - PostHog, Google Analytics, Mixpanel, Plausible, or Vercel Analytics
- 🎨 **Fully Customizable** - Colors, images, story, and branding
- 📱 **Mobile Responsive** - Works great on desktop and mobile
- 🚀 **Easy Deployment** - One-click deploy to Vercel, Netlify, or any platform
- 🎵 **Sound Effects** - Immersive audio experience
- 🎮 **Easter Eggs** - Interactive cockpit dashboard with fun controls

## 🎮 About

This is an open-source resume game template that anyone can customize with their own work experience and information. Players control your character through a space shooter game, unlocking work experiences by defeating alien spaceships. Perfect for developers, designers, or anyone who wants to showcase their career in a unique and memorable way!

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone and install**:
```bash
git clone <your-repo-url>
cd resume-game-template
pnpm install
```

2. **Run the setup script**:
```bash
pnpm setup
```
This will guide you through configuring analytics and basic settings.

3. **Customize your game**:
   - See [SETUP.md](./SETUP.md) for the essential 5 steps
   - Or follow the detailed guide below

4. **Start developing**:
```bash
pnpm dev
```

### Option 2: Manual Setup

1. **Clone and install**:
```bash
git clone <your-repo-url>
cd resume-game-template
pnpm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

3. **Customize your game**:
   - See [SETUP.md](./SETUP.md) for the essential 5 steps
   - Or follow the detailed guide below

4. **Start developing**:
```bash
pnpm dev
```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

### ⚡ Need a Quick Start?

For the fastest setup, see [SETUP.md](./SETUP.md) - it covers the essential 5 steps to get your game personalized in 10 minutes!

## 🎨 Customization

### 🎯 Essential Customization Checklist

**Must Replace (Required):**
- [ ] **Your Resume PDF**: Replace `public/NP-resume-6.3.26.pdf` with your resume
- [ ] **Your Profile Picture**: Replace `public/Nate.png` with your photo
- [ ] **Your Character Image**: Replace `public/SuperNate.png` with your character sprite
- [ ] **Work Experience Data**: Update `lib/work-experiences.ts` with your career history
- [ ] **Company Logos**: Add your company logos to `public/Logos/` folder

**Optional Customizations:**
- [ ] **Run setup script**: `pnpm setup` (for analytics configuration)
- [ ] **Customize story**: Edit the narrative in `components/super-nate-game.tsx`
- [ ] **Update metadata**: Change title and description in `app/layout.tsx`
- [ ] **Professional websites**: Add links in cockpit dashboard
- [ ] **Deploy**: Push to GitHub and deploy to Vercel

### 📋 Step-by-Step Customization

#### 1. Replace Your Resume PDF
```bash
# Replace this file with your resume
public/NP-resume-6.3.26.pdf → public/your-resume.pdf
```

#### 2. Replace Your Images
```bash
# Replace these files with your images
public/Nate.png → your-profile-picture.png
public/SuperNate.png → your-character-sprite.png
public/NateHooray.png → your-celebration-image.png
```

#### 3. Add Your Company Logos
```bash
# Add your company logos to this folder
public/Logos/your-company-logo.png
public/Logos/another-company-logo.png
```

#### 4. Update Work Experience Data

**Option A: Use Cursor AI (Recommended)**
1. Open your resume PDF in Cursor
2. Use this prompt:

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

**Option B: Manual Update**
Edit `lib/work-experiences.ts` with your career history.

#### 5. Update Company Logo Mapping
After adding logos, update the `getCompanyLogo` function in:
- `components/super-nate-game.tsx` (around line 25)
- `app/page.tsx` (around line 20)

#### 6. Add Professional Website Links (Optional)
Update the cockpit dashboard in `components/cockpit-dashboard.tsx` to include links to:
- Your LinkedIn profile
- Your GitHub profile  
- Your personal website
- Your portfolio

### Detailed Customization

For comprehensive customization instructions, see [CUSTOMIZATION.md](./CUSTOMIZATION.md).

### Analytics Options

The template supports multiple analytics providers:

- **PostHog** (Recommended) - Full-featured analytics
- **Google Analytics 4** - Popular choice
- **Mixpanel** - Event tracking focused
- **Plausible** - Privacy-focused
- **Vercel Analytics** - Built-in, no setup needed
- **None** - Disable analytics entirely

The setup script will configure your chosen provider automatically.

## 🎵 Audio Files

The game includes sound effects and background music in `public/audio/`:
- Background music - Background music that loops during gameplay
- `pew.mp3` - Laser firing sound
- `zing.mp3` - Enemy hit sound  
- `Congratulations.m4a` - Game completion sound (this is me saying it, you can keep it!
)

Feel free to replace these with your own audio files (keep the same filenames or update the references in `components/super-nate-game.tsx`).

## 🎯 Game Controls

- **Arrow Keys (← →)**: Rotate your character
- **Spacebar**: Shoot lasers
- **Mobile**: Tap canvas to shoot, use on-screen buttons to aim

## 🎨 Easter Eggs

The game includes interactive easter eggs in the cockpit dashboard:
- Power switch
- Shields switch  
- Thrusters switch (affects game speed!)
- Comms switch
- Speed gauge
- Fuel gauge

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel (recommended)
- **Analytics**: Optional (configurable)

## 📦 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main game page
│   └── globals.css         # Global styles
├── components/
│   ├── super-nate-game.tsx # Main game logic
│   ├── cockpit-dashboard.tsx # Interactive control panel
│   ├── memory-card.tsx     # Work experience cards
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── work-experiences.ts # Your work history data
│   ├── analytics.ts        # Optional analytics wrapper
│   └── utils.ts            # Utility functions
├── public/
│   ├── audio/              # Sound effects
│   ├── Logos/              # Company logos
│   └── *.png               # Character and UI images
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy! (No environment variables required for basic functionality)

3. **Optional: Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings → Environment Variables
   - Add these variables for enhanced functionality:
     - `NEXT_PUBLIC_SITE_URL` - Your deployed URL (e.g., https://yourname.vercel.app)
     - `NEXT_PUBLIC_SITE_NAME` - Your site name
     - `NEXT_PUBLIC_SITE_DESCRIPTION` - Your site description
     - Analytics variables (if using PostHog, GA4, etc.)

### Other Platforms

This is a standard Next.js app and works on:
- **Netlify** - Drag and drop deployment
- **Railway** - Git-based deployment
- **AWS Amplify** - Full-stack deployment
- **Self-hosted** - Any Node.js hosting

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/resume-game-template)

## 🤝 Contributing

This is an open-source template! Contributions are welcome:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 💡 Credits

Original concept created as a creative resume game. Converted to an open-source template for anyone to use and customize!

## 🎮 Examples

Check out these examples of the template in action:
- [Your Example](https://yourname.vercel.app) - Add your deployed version here
- [Another Example](https://another-example.vercel.app) - Add more examples

## 🎮 Have Fun!

Make this game your own and create a memorable way to showcase your resume! If you build something cool with this template, we'd love to see it - share it with us!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Star This Repo

If you found this template helpful, please give it a star! It helps others discover it and motivates us to keep improving it.
