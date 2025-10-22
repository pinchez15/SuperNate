# 🚀 Quick Setup Guide

Get your resume game up and running in 10 minutes!

## ⚡ Essential Steps (Required)

### 1. Replace Your Resume PDF
```bash
# Replace this file with your resume
public/N Pinches Resume 10.22.25.docx.pdf → your-resume.pdf
```

### 2. Replace Your Images
```bash
# Replace these files with your images
public/Nate.png → your-profile-picture.png
public/SuperNate.png → your-character-sprite.png
public/NateHooray.png → your-celebration-image.png
```

### 3. Add Your Company Logos
```bash
# Add your company logos to this folder
public/Logos/your-company-logo.png
public/Logos/another-company-logo.png
```

### 4. Update Work Experience (Use Cursor AI)

1. **Open your resume PDF in Cursor**
2. **Open** `lib/work-experiences.ts` in Cursor
3. **Use this prompt**:

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

### 5. Update Company Logo Mapping

After adding logos, update the `getCompanyLogo` function in:
- `components/super-nate-game.tsx` (around line 25)
- `app/page.tsx` (around line 20)

```typescript
const getCompanyLogo = (company: string): string => {
  const logoMap: { [key: string]: string } = {
    "Your Company": "/Logos/your-company-logo.png",
    "Another Company": "/Logos/another-company-logo.png",
  }
  return logoMap[company] || ""
}
```

## 🎯 Optional Steps

### 6. Configure Analytics
```bash
pnpm setup
```

### 7. Add Professional Links
Update `components/cockpit-dashboard.tsx` to include links to:
- Your LinkedIn profile
- Your GitHub profile
- Your personal website

### 8. Deploy
```bash
git add .
git commit -m "Customize resume game"
git push origin main
# Deploy to Vercel, Netlify, etc.
```

## ✅ You're Done!

Your resume game is now personalized and ready to share!

## 🆘 Need Help?

- **Detailed guide**: See [CUSTOMIZATION.md](./CUSTOMIZATION.md)
- **Full documentation**: See [README.md](./README.md)
- **Issues**: Create an issue on GitHub
