export type SiteId = "cappawork" | "karibu" | "healthcareaio"

export interface Site {
  id: SiteId
  name: string
  url: string
  /** Homepage sends X-Frame-Options: DENY, so the game shows it through /api/peek. */
  peek: boolean
  line: string
}

export const sites: Record<SiteId, Site> = {
  cappawork: {
    id: "cappawork",
    name: "CappaWork",
    url: "https://www.cappawork.com/",
    peek: true,
    line: "Nate's agent studio. Computers do the Computer Work so people can do the Human Work.",
  },
  karibu: {
    id: "karibu",
    name: "Karibu Health",
    url: "https://www.karibu.health/",
    peek: false,
    line: "Nate's offline-first EHR for rural clinics in Uganda. In pilot.",
  },
  healthcareaio: {
    id: "healthcareaio",
    name: "Healthcare AIO",
    url: "https://www.healthcareaio.com/",
    peek: true,
    line: "Nate's AI-search visibility service for healthcare: why AI won't cite your hospital, and what to fix.",
  },
}

export const siteList: Site[] = [sites.cappawork, sites.karibu, sites.healthcareaio]

/** Exact homepage URL to the host it is allowed to land on after redirects. */
export const peekHosts = new Map<string, string>(
  siteList.filter((site) => site.peek).map((site) => [site.url, new URL(site.url).host]),
)
