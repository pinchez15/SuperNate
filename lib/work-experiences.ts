export interface WorkExperience {
  title: string
  company: string
  period: string
  description: string
  achievements?: string[]
}

export const workExperiences: WorkExperience[] = [
  {
    title: "Solopreneur",
    company: "CappaWork",
    period: "2021 - Present",
    description:
      "Started as a D2C brand, pivoted to web development and consulting.",
    achievements: [
      "Designed, printed, sold a 90-day business planner for Christians. Sold 500 units.",
      "Created Shopify store and fulfillment, marketing and funnels.",
      "Pivoted to web dev agency. Projects include Workportfolio.io, cappawork.com, and more.",
    ],
  },
  {
    title: "Director, Private Equity Partnerships",
    company: "Entromy",
    period: "2021 - 2021",
    description:
      "Led sales into Private Equity portfolio companies. PE firm was our sales partner.",
    achievements: [
      "Sold $150k in B2B SaaS in 4 months ",
      "Led 10+ sprint consulting engagements with CEOs of portcos.",
      "Trained Talent partners and HRBPs on how to use the platform.",
    ],
  },
  {
    title: "Consultant",
    company: "Eagle Hill Consulting",
    period: "2016 - 2018",
    description:
      "Federal Consultant on business process and strategy engagements.",
    achievements: [
      "Pitched and launched new office in Boston, expanding from DC.",
      "Led data analytics for 1,200 person workforce capacity assessment.",
      "Made an insane amount of process maps and ppts. ",
    ],
  },
  {
    title: "Senior Product Developer",
    company: "CVS Health; Omnicare",
    period: "2019 - 2020",
    description:
      "Part of a corporate strategy turnaround team. Acted as internal consultant and product developer to launch new products internally.",
    achievements: [
      "Owned product roadmap for MultiDose, a pharmacy automation and packaging product - served ~5,000 customers.",
      "Designed and built a data analytics tool in Tableau to size new markets - used 2M data points.",
      "Routinely presented to Omincare President and C-suite on roadmap and profitability analysis.",
    ],
  },
  {
    title: "Clinical Research Coordinator",
    company: "Dana-Farber Harvard Cancer Center",
    period: "2011 - 2014",
    description:
      "Ran the daily operations of Phase I, II, and III clinical trials in pediatric brain tumor center.",
    achievements: [
      "Co-authored a paper on personalized medicine.",
      "Managed NDA with the FDA for new drug.",
      "Spent a lot of time with sick kids and their families.",
    ],
  },
]
