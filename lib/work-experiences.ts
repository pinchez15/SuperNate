export interface WorkExperience {
  title: string
  company: string
  period: string
  description: string
  achievements?: string[]
}

export const workExperiences: WorkExperience[] = [
  {
    title: "Senior Product Manager",
    company: "TechCorp",
    period: "2022 - Present",
    description:
      "Led cross-functional teams to deliver innovative SaaS products, driving 150% user growth and $2M ARR increase.",
    achievements: [
      "Launched 3 major product features with 95% customer satisfaction",
      "Reduced churn by 30% through data-driven insights",
      "Managed $5M product budget",
    ],
  },
  {
    title: "Product Manager",
    company: "StartupXYZ",
    period: "2020 - 2022",
    description:
      "Owned product roadmap for B2B analytics platform, collaborating with engineering and design to ship customer-centric features.",
    achievements: [
      "Increased user engagement by 200%",
      "Shipped 15+ features in 18 months",
      "Built product analytics framework",
    ],
  },
  {
    title: "Associate Product Manager",
    company: "BigTech Inc",
    period: "2018 - 2020",
    description:
      "Supported product initiatives for enterprise software, conducting user research and defining requirements for development teams.",
    achievements: [
      "Conducted 50+ user interviews",
      "Improved feature adoption by 40%",
      "Created product documentation",
    ],
  },
  {
    title: "Business Analyst",
    company: "Consulting Group",
    period: "2016 - 2018",
    description:
      "Analyzed business processes and delivered data-driven recommendations to Fortune 500 clients across multiple industries.",
    achievements: [
      "Delivered 10+ client projects",
      "Saved clients $3M in operational costs",
      "Built financial models and dashboards",
    ],
  },
  {
    title: "Marketing Coordinator",
    company: "Creative Agency",
    period: "2015 - 2016",
    description:
      "Coordinated digital marketing campaigns and analyzed performance metrics to optimize customer acquisition strategies.",
    achievements: [
      "Managed campaigns with $500K budget",
      "Increased conversion rates by 25%",
      "Developed marketing analytics reports",
    ],
  },
]
