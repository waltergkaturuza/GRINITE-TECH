'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  CodeBracketIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

type PortfolioProject = {
  id: string
  title: string
  description: string
  technologies: string[]
  status?: string
  github?: string
  demo?: string
  previewImage?: string
  detailsOverride?: Omit<ProjectDetails, 'title'>
  type?: 'web' | 'mobile' | 'backend' | 'data' | 'system'
  lastUpdatedAt?: string
}

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  homepage: string | null
  language: string | null
  fork: boolean
  archived: boolean
  disabled: boolean
  pushed_at: string | null
  updated_at: string
}

type ProjectDetails = {
  title: string
  summary: string
  technologies: string[]
  features: string[]
}

const FEATURED_WORK: PortfolioProject[] = [
  {
    id: 'tnf-main',
    title: 'Tripartite Negotiating Forum (TNF)',
    description: 'Official institutional website for Zimbabwe’s tripartite social dialogue platform with resources, news, and engagement.',
    technologies: ['Next.js', 'TypeScript', 'React', 'CMS', 'SEO'],
    status: 'Live',
    demo: 'https://www.tnfzim.com/',
    type: 'web',
    detailsOverride: {
      summary:
        'Official digital platform for Zimbabwe’s Tripartite Negotiating Forum (TNF), supporting structured social dialogue between government, labour, and business through CMS-managed news, publications, resources, and SEO-optimized public engagement.',
      technologies: [
        'Next.js',
        'TypeScript',
        'React',
        'Tailwind CSS',
        'CMS',
        'SEO',
        'Content Management',
        'Responsive UI',
      ],
      features: [
        '**Institutional Homepage** – presents TNF mandate, tripartite membership, and social dialogue priorities.',
        '**CMS-driven Content** – staff can publish and update news, documents, and pages without developer support.',
        '**SEO Optimization** – search-friendly structure, metadata, and discoverability for institutional audiences.',
        '**News & Announcements** – publishes forum updates, communiqués, and stakeholder communications.',
        '**Resource Library** – organized access to reports, documents, and institutional reference material.',
        '**Accessible Delivery** – mobile-ready experience for audiences across Zimbabwe and partner institutions.',
      ],
    },
  },
  {
    id: 'tnf-summit',
    title: 'TNF Global Summit 2026',
    description: 'Global summit platform with CMS, SEO, registrations, integrated payments, programme, and Victoria Falls 2026 operations.',
    technologies: ['Next.js', 'TypeScript', 'CMS', 'SEO', 'Payment Gateway'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/tnf_summit',
    demo: 'https://summit.tnfzim.com/',
    type: 'web',
    detailsOverride: {
      summary:
        'Global summit platform for TNF Global Summit 2026 (Victoria Falls), combining CMS-managed event content, SEO visibility, delegate registrations, and integrated payment gateway processing for tickets and conference services.',
      technologies: [
        'Next.js',
        'TypeScript',
        'React',
        'Tailwind CSS',
        'CMS',
        'SEO',
        'Payment Gateway Integration',
        'Event Platform',
        'Vercel',
      ],
      features: [
        '**Summit Homepage & Branding** – conference positioning, programme highlights, and delegate conversion flows.',
        '**CMS Content Management** – update speakers, agenda, sponsors, and pages in real time.',
        '**SEO & Discoverability** – optimized landing pages for regional and international summit visibility.',
        '**Registration Workflows** – structured signup journeys for delegates, partners, and exhibitors.',
        '**Integrated Payment Gateway** – secure online payments for registrations, packages, and summit services.',
        '**Programme & Sponsors** – showcase sessions, partners, and operational summit information.',
      ],
    },
  },
  {
    id: 'sarsyc-vi',
    title: 'SARSYC VI Conference Platform',
    description: 'Regional youth conference platform with CMS, SEO, registrations, and integrated payment gateway (Windhoek 2026).',
    technologies: ['Next.js', 'TypeScript', 'CMS', 'SEO', 'Payment Gateway'],
    status: 'Live',
    demo: 'https://www.sarsyc.org/',
    type: 'web',
    detailsOverride: {
      summary:
        'Public conference website for SARSYC VI (Windhoek 2026), built with CMS-managed content and SEO best practices, plus delegate registrations and integrated payment gateway support for conference fees and related services.',
      technologies: [
        'Next.js',
        'TypeScript',
        'React',
        'Tailwind CSS',
        'CMS',
        'SEO',
        'Payment Gateway Integration',
        'Conference Platform',
        'Vercel',
      ],
      features: [
        '**Conference Homepage** – event branding, key messaging, and delegate call-to-action sections.',
        '**CMS-driven Updates** – programme, resources, partners, and announcements managed by the team.',
        '**SEO Optimization** – search-ready content structure for regional youth conference visibility.',
        '**Registration Experience** – structured flows for participants, partners, and stakeholders.',
        '**Integrated Payment Gateway** – secure online payments for registrations and conference packages.',
        '**Resources & Partnerships** – highlight sponsors, documents, and engagement opportunities.',
      ],
    },
  },
  {
    id: 'chilmund',
    title: 'Chilmund Chemicals',
    description: 'Corporate website for Zimbabwe’s aluminium sulphate manufacturer with products, logistics, SHEQ, and quote workflows.',
    technologies: ['Next.js', 'TypeScript', 'React', 'CMS', 'SEO'],
    status: 'Live',
    demo: 'https://www.chilmund.co.zw/',
    type: 'web',
    detailsOverride: {
      summary:
        'Corporate website for Chilmund Chemicals, Zimbabwe’s aluminium sulphate manufacturer, with CMS-managed content and SEO optimization across products, logistics, SHEQ standards, and customer quote workflows.',
      technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'CMS', 'SEO', 'Corporate Web', 'Responsive UI'],
      features: [
        '**Company Profile** – manufacturing story, capabilities, and market positioning.',
        '**CMS Content Management** – update products, pages, and company information without code changes.',
        '**SEO Optimization** – search-friendly product and corporate content for industrial buyers.',
        '**Products & Applications** – aluminium sulphate ranges and industrial use cases.',
        '**SHEQ Commitment** – safety, health, environment, and quality assurance messaging.',
        '**Quote & Contact Flows** – lead capture for procurement and customer enquiries.',
      ],
    },
  },
  {
    id: 'poz-fuel',
    title: 'POZ Fuel Coupon System',
    description: 'Fuel coupon issuance and tracking platform for Parliament of Zimbabwe with approvals, audit trails, and institutional reporting.',
    technologies: ['Python', 'Django', 'Django REST', 'PostgreSQL', 'RBAC', 'Audit Logging'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/Parliament-Zimbabwe',
    demo: 'https://parliament-zimbabwe-fuel-system.vercel.app/',
    type: 'system',
    detailsOverride: {
      summary:
        'Enterprise fuel coupon management platform for the Parliament of Zimbabwe (POZ), centralizing allocation, multi-level approvals, redemption tracking, and accountability reporting across departments and constituencies.',
      technologies: [
        'Python',
        'Django',
        'Django REST Framework',
        'PostgreSQL',
        'RBAC',
        'Workflow Engine',
        'Audit Logs',
        'Reporting Dashboards',
      ],
      features: [
        '**Allocation & Policy Controls** – configurable coupon distribution rules by role, department, and threshold.',
        '**Multi-step Approvals** – structured authorization workflows for officers and administrators.',
        '**Issuance & Redemption Tracking** – end-to-end traceability across the fuel coupon lifecycle.',
        '**Parliament-specific Data Model** – MPs, constituencies, sessions, and institutional structures.',
        '**Operational Dashboards** – reconciliation views, anomaly monitoring, and executive oversight.',
        '**Governance & Security** – role-based access, segregation of duties, and immutable audit records.',
      ],
    },
  },
  {
    id: 'quantis-portfolio',
    title: 'Quantis Technologies',
    description: 'Company website and portfolio with CMS, SEO, and enterprise systems engineering showcase.',
    technologies: ['Next.js', 'React', 'TypeScript', 'CMS', 'SEO'],
    status: 'Live',
    demo: 'https://www.quantistechnologies.co.zw/',
    github: 'https://github.com/waltergkaturuza/GRINITE-TECH',
    type: 'web',
    detailsOverride: {
      summary:
        'Company website and portfolio for Quantis Technologies, combining CMS-managed service content, SEO-optimized landing pages, and a showcase of enterprise platforms, automation, and digital infrastructure delivery.',
      technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'CMS', 'SEO', 'JSON-LD', 'Responsive UI'],
      features: [
        '**Brand & Services Presence** – clear positioning for enterprise systems engineering and digital delivery.',
        '**CMS-managed Content** – update services, case studies, and company information without redeploying code.',
        '**SEO Architecture** – metadata, structured data, sitemap, and search-ready page structure.',
        '**Portfolio Showcase** – featured projects with live previews and detailed capability summaries.',
        '**Conversion Paths** – contact, consultation, and service discovery flows for prospective clients.',
      ],
    },
  },
  {
    id: 'saywhat-sirtis',
    title: 'SAYWHAT SIRTIS',
    description: 'Multi-tenant enterprise information system for NGOs with secure portals, workflows, and real-time reporting.',
    technologies: ['Next.js', 'TypeScript', 'React', 'PostgreSQL', 'RBAC', 'Real-time APIs', 'AI Integration'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/SaywhatSirtis',
    demo: 'https://saywhat-sirtis.vercel.app/',
    type: 'system',
  },
  {
    id: 'munda-market-admin',
    title: 'Munda Market (Admin Console)',
    description: 'Admin console for catalog, orders, users and operational workflows.',
    technologies: ['Next.js', 'TypeScript', 'RBAC', 'Analytics'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/Munda-Market',
    demo: 'https://munda-market-k4ht.vercel.app/',
    type: 'system',
    detailsOverride: {
      summary:
        'Admin console for Munda Market, supporting catalog management, order operations, user governance, and analytics dashboards for day-to-day marketplace administration.',
      technologies: ['Next.js', 'TypeScript', 'React', 'RBAC', 'Admin Dashboard', 'Analytics', 'Vercel'],
      features: [
        '**Catalog Management** – create, update, and organize products and inventory records.',
        '**Order Operations** – monitor order flow, fulfillment status, and operational exceptions.',
        '**User & Role Governance** – role-based access for admins, staff, and operational teams.',
        '**Analytics Dashboards** – visibility into sales activity, user behavior, and platform performance.',
        '**Secure Admin Access** – authenticated console workflows for internal business users.',
      ],
    },
  },
  {
    id: 'retailcloud',
    title: 'RetailCloud',
    description: 'Retail management platform (auth, onboarding, and operational modules).',
    technologies: ['TypeScript', 'Next.js', 'Render'],
    status: 'Paused',
    demo: 'https://retailcloud.onrender.com/signup',
    github: 'https://github.com/waltergkaturuza/RetailCloud',
    type: 'system',
  },
  {
    id: 'srhr-trust',
    title: 'SRHR Africa Trust',
    description: 'Web system for SRHR Africa Trust (deployment currently suspended).',
    technologies: ['Web App', 'Render'],
    status: 'Suspended',
    demo: 'https://srhr-africa-trust.onrender.com/',
    github: 'https://github.com/waltergkaturuza/SRHR-Dashboard',
    type: 'web',
  },
]

const EXTRA_FEATURED_FROM_GITHUB = 6

const POZ_FUEL_DETAILS: Omit<ProjectDetails, 'title'> = {
  summary:
    'Enterprise fuel coupon management platform for the Parliament of Zimbabwe (POZ), centralizing allocation, multi-level approvals, redemption tracking, and accountability reporting across departments and constituencies.',
  technologies: [
    'Python',
    'Django',
    'Django REST Framework',
    'PostgreSQL',
    'RBAC',
    'Workflow Engine',
    'Audit Logs',
    'Reporting Dashboards',
  ],
  features: [
    '**Allocation & Policy Controls** – configurable coupon distribution rules by role, department, and threshold.',
    '**Multi-step Approvals** – structured authorization workflows for officers and administrators.',
    '**Issuance & Redemption Tracking** – end-to-end traceability across the fuel coupon lifecycle.',
    '**Parliament-specific Data Model** – MPs, constituencies, sessions, and institutional structures.',
    '**Operational Dashboards** – reconciliation views, anomaly monitoring, and executive oversight.',
    '**Governance & Security** – role-based access, segregation of duties, and immutable audit records.',
  ],
}

const GEOSPATIAL_HUB_DETAILS: Omit<ProjectDetails, 'title'> = {
  summary:
    'Integrated geospatial monitoring platform for multi-scale risk monitoring, environmental assessment, food security analysis, and disaster resilience planning, powered by Google Earth Engine with interactive mapping and analytics APIs.',
  technologies: [
    'TypeScript',
    'Next.js',
    'Google Earth Engine',
    'Django',
    'PostGIS',
    'Leaflet',
    'REST APIs',
    'GeoJSON',
  ],
  features: [
    '**GEE-driven Indicators** – rainfall (CHIRPS), NDVI (MODIS/Sentinel), soil moisture, and land surface temperature layers.',
    '**Zonal Statistics** – country-level and administrative boundary analysis (ADM0, ADM1, ADM2).',
    '**Interactive Leaflet Maps** – dynamic Earth Engine raster tiles and vector overlays.',
    '**Temporal Analysis** – date-range filtering and trend exploration for environmental indicators.',
    '**Operational Overlays** – boundaries, rivers, roads, health facilities, schools, markets, and livelihood zones.',
    '**API Services** – GeoJSON endpoints and tile URLs for dashboard integrations.',
  ],
}

function githubRepoSlug(githubUrl?: string) {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i)
  return match?.[1]?.replace(/\.git$/i, '') ?? null
}

function applyGithubRepoOverrides(project: PortfolioProject): PortfolioProject {
  const slug = githubRepoSlug(project.github)
  if (slug === 'Parliament-Zimbabwe') {
    return {
      ...project,
      title: 'POZ Fuel Coupon System',
      description:
        'Fuel coupon issuance and tracking platform for Parliament of Zimbabwe with approvals, audit trails, and institutional reporting.',
      technologies: ['Python', 'Django', 'Django REST', 'PostgreSQL', 'RBAC', 'Audit Logging'],
      type: 'system',
      detailsOverride: POZ_FUEL_DETAILS,
    }
  }
  if (slug === 'enhanced-geospatial-repo') {
    return {
      ...project,
      title: 'Global Resilience Hub',
      description:
        'Geospatial monitoring platform for environmental assessment, food security analysis, and disaster resilience planning.',
      technologies: ['TypeScript', 'Next.js', 'Google Earth Engine', 'Django', 'PostGIS', 'Leaflet'],
      demo: project.demo || 'https://zim-geo.vercel.app/',
      type: 'system',
      detailsOverride: GEOSPATIAL_HUB_DETAILS,
    }
  }
  return project
}

function svgThumbDataUri(title: string, subtitle?: string) {
  const safeTitle = (title || '').slice(0, 38)
  const safeSub = (subtitle || '').slice(0, 52)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="0.55" stop-color="#7F1D1D"/>
      <stop offset="1" stop-color="#0F766E"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1200" height="630" rx="44" fill="url(#g)"/>
  <g filter="url(#s)">
    <rect x="76" y="86" width="1048" height="458" rx="32" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)"/>
    <text x="120" y="220" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="54" font-weight="800" fill="#fff">
      ${escapeXml(safeTitle)}
    </text>
    <text x="120" y="288" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="26" font-weight="500" fill="rgba(255,255,255,0.92)">
      ${escapeXml(safeSub)}
    </text>
    <text x="120" y="500" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="20" font-weight="600" fill="rgba(255,255,255,0.85)">
      Greenford Walter Katuruza • Full-stack Developer
    </text>
  </g>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sitePreviewSources(url: string) {
  const encoded = encodeURIComponent(url.trim())
  return [
    `https://api.microlink.io/?url=${encoded}&screenshot=true&meta=false&viewport.width=1200&viewport.height=630`,
    `/api/site-screenshot?url=${encoded}`,
  ]
}

async function fetchMicrolinkPreviewUrl(demo: string) {
  const encoded = encodeURIComponent(demo)
  const endpoint = `https://api.microlink.io/?url=${encoded}&screenshot=true&viewport.width=1200&viewport.height=630`

  const clientResponse = await fetch(endpoint)
  if (clientResponse.ok) {
    const payload = (await clientResponse.json()) as {
      data?: { screenshot?: { url?: string; width?: number } }
    }
    const url = payload.data?.screenshot?.url
    const width = payload.data?.screenshot?.width ?? 0
    if (url && width >= 700) return url
  }

  const serverResponse = await fetch(`/api/site-preview-url?url=${encoded}`)
  if (serverResponse.ok) {
    const payload = (await serverResponse.json()) as { url?: string }
    if (payload.url) return payload.url
  }

  return null
}

function isLikelyPlaceholderImage(width: number, height: number) {
  return width > 0 && width < 700
}

function ProjectThumbnail({
  title,
  subtitle,
  demo,
  previewImage,
  containerClassName = 'h-64 bg-gray-100',
}: {
  title: string
  subtitle: string
  demo?: string
  previewImage?: string
  containerClassName?: string
}) {
  const fallbackThumb = svgThumbDataUri(title, subtitle)
  const [remotePreview, setRemotePreview] = useState<string | null>(null)
  const [previewResolved, setPreviewResolved] = useState(false)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (previewImage) {
      setPreviewResolved(true)
      return
    }
    if (!demo) {
      setPreviewResolved(true)
      return
    }

    let cancelled = false
    setPreviewResolved(false)
    setRemotePreview(null)
    setSourceIndex(0)
    setLoaded(false)

    fetchMicrolinkPreviewUrl(demo)
      .then((url) => {
        if (!cancelled && url) {
          setRemotePreview(url)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewResolved(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [demo, previewImage])

  const sources = [
    ...(previewImage ? [previewImage] : []),
    ...(remotePreview ? [remotePreview] : []),
    ...(previewResolved && demo ? sitePreviewSources(demo) : []),
    ...(previewResolved ? [fallbackThumb] : []),
  ]
  const currentSrc = sources[Math.min(sourceIndex, sources.length - 1)]
  const showImage = previewResolved && currentSrc

  return (
    <div className={`${containerClassName} relative overflow-hidden`}>
      {(!loaded || !previewResolved) && demo && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
      )}
      {showImage && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${title} site preview`}
          className={`h-full w-full object-cover object-top transition-all duration-300 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={(event) => {
            const img = event.currentTarget
            if (
              demo &&
              isLikelyPlaceholderImage(img.naturalWidth, img.naturalHeight) &&
              sourceIndex < sources.length - 1
            ) {
              setLoaded(false)
              setSourceIndex((prev) => prev + 1)
              return
            }
            setLoaded(true)
          }}
          onError={() => {
            setLoaded(false)
            setSourceIndex((prev) => (prev < sources.length - 1 ? prev + 1 : prev))
          }}
        />
      )}
    </div>
  )
}

function detailsLabel(projectType?: PortfolioProject['type']) {
  return projectType === 'system' ? 'View app details' : 'View site details'
}

function parseGitHubRepo(githubUrl?: string) {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/i)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/i, '') }
}

function baseProjectDetails(project: PortfolioProject): ProjectDetails {
  return {
    title: project.title,
    summary: project.description,
    technologies: project.technologies,
    features: [],
  }
}

const SKIP_HEADINGS = [
  'installation',
  'setup',
  'getting started',
  'deploy',
  'contributing',
  'license',
  'author',
  'credits',
  'acknowledgment',
  'faq',
  'roadmap',
  'support',
  'contact',
  'prerequisites',
  'requirements',
  'quick start',
  'demo credentials',
  'test accounts',
  'credentials',
  'access urls',
  'endpoints',
  'api documentation',
  'urls',
]

const TECH_HEADINGS = [
  'tech stack',
  'technology',
  'technologies',
  'built with',
  'stack',
  'tools',
  'skills',
]

const SKIP_LINE_PATTERNS = [
  /^\d+\.\s/,
  /clone/i,
  /install dependencies/i,
  /environment setup/i,
  /npm (run|install)/i,
  /\byarn\b/i,
  /\bdocker\b/i,
  /create .*\.env/i,
  /git clone/i,
  /127\.0\.0\.1/i,
  /localhost/i,
  /swagger/i,
  /\/admin\b/i,
  /api\/schema/i,
  /admin123|main123|mp123/i,
  /\bUsers:\s*\d+/i,
  /\b(admin|main_officer|mp_[\w-]+)\s*\/\s*\S+/i,
]

function cleanMarkdownText(line: string) {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim()
}

function normalizeRichText(line: string) {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`/g, '')
    .trim()
}

function stripInlineSetupSteps(text: string) {
  return text
    .replace(/\s*\d+\.\s*\*\*[^*]+\*\*/g, '')
    .replace(/\s*\d+\.\s*(Clone and Install Dependencies|Environment Setup)/gi, '')
    .replace(/https?:\/\/127\.0\.0\.1[^\s)]+/gi, '')
    .replace(/https?:\/\/localhost[^\s)]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function renderFormattedText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function isSkippedLine(line: string) {
  return SKIP_LINE_PATTERNS.some((pattern) => pattern.test(line))
}

function mergeTechnologies(base: string[], extra: string[]) {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const item of [...base, ...extra]) {
    const clean = cleanMarkdownText(item)
    if (!clean || clean.length > 40) continue
    const key = clean.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(clean)
  }
  return merged.slice(0, 14)
}

function summarizeReadme(markdown: string, fallback: PortfolioProject): ProjectDetails {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ')
  const withoutHtml = withoutCode.replace(/<[^>]+>/g, ' ')
  const lines = withoutHtml
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const usefulLines: string[] = []
  const bulletCandidates: string[] = []
  const readmeTechnologies: string[] = []
  let skipSection = false
  let inTechSection = false

  for (const line of lines) {
    if (line.startsWith('#')) {
      const heading = line.replace(/^#+\s*/, '').toLowerCase()
      skipSection = SKIP_HEADINGS.some((word) => heading.includes(word))
      inTechSection = !skipSection && TECH_HEADINGS.some((word) => heading.includes(word))
      continue
    }
    if (skipSection) {
      inTechSection = false
      continue
    }
    if (/^!\[[^\]]*]\([^)]*\)$/.test(line)) continue
    if (line.includes('shields.io')) continue
    if (isSkippedLine(line)) continue

    if (inTechSection) {
      if (/^[-*]\s+/.test(line)) {
        readmeTechnologies.push(cleanMarkdownText(line))
      } else if (line.includes(',')) {
        readmeTechnologies.push(...line.split(',').map((part) => cleanMarkdownText(part)))
      } else if (line.length <= 40) {
        readmeTechnologies.push(cleanMarkdownText(line))
      }
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const bullet = normalizeRichText(line)
      if (bullet.length >= 12 && bullet.length <= 220 && !isSkippedLine(bullet)) {
        bulletCandidates.push(bullet)
      }
      continue
    }

    const cleanLine = normalizeRichText(line)
    if (cleanLine.length >= 24 && cleanLine.length <= 320 && !isSkippedLine(cleanLine)) {
      usefulLines.push(cleanLine)
    }
  }

  const summary = stripInlineSetupSteps(usefulLines.slice(0, 2).join(' '))
  const features = bulletCandidates.slice(0, 8)

  return {
    title: fallback.title,
    summary: summary || fallback.description,
    technologies: mergeTechnologies(fallback.technologies, readmeTechnologies),
    features,
  }
}

export default function Portfolio() {
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMoreGithub, setShowMoreGithub] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [selectedDetails, setSelectedDetails] = useState<ProjectDetails | null>(null)
  const [detailsCache, setDetailsCache] = useState<Record<string, ProjectDetails>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch('https://api.github.com/users/waltergkaturuza/repos?per_page=100&sort=updated')
        if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`)
        const repos = (await res.json()) as GitHubRepo[]
        const cleaned = repos
          .filter((r) => !r.fork && !r.archived && !r.disabled)
          .sort((a, b) => new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime())
        setGithubRepos(cleaned)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load portfolio data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sample skills data
  const skills = [
    {
      category: "Frontend",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5", "CSS3"]
    },
    {
      category: "Backend", 
      technologies: ["Node.js", "NestJS", "Express", "Python", "Java", "C#", ".NET"]
    },
    {
      category: "Database",
      technologies: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "TypeORM", "Prisma"]
    },
    {
      category: "Mobile",
      technologies: ["React Native", "Flutter", "iOS", "Android", "Expo"]
    },
    {
      category: "Cloud & DevOps",
      technologies: ["AWS", "Docker", "Kubernetes", "CI/CD", "Vercel", "Render"]
    },
    {
      category: "Tools",
      technologies: ["Git", "GitHub", "VS Code", "Figma", "Jira", "Postman"]
    }
  ]

  const githubProjects: PortfolioProject[] = githubRepos
    .filter((r) => Boolean(r.homepage) || Boolean(r.description))
    .slice(0, 18)
    .map((r) =>
      applyGithubRepoOverrides({
        id: `gh-${r.id}`,
        title: r.name.replace(/[-_]/g, ' '),
        description: r.description || 'Open-source project.',
        technologies: [r.language || 'Software'].filter(Boolean) as string[],
        status: r.homepage ? 'Live' : 'Open Source',
        github: r.html_url,
        demo: r.homepage || undefined,
        type: 'web',
        lastUpdatedAt: r.pushed_at || r.updated_at,
      }),
    )

  const featuredIds = new Set(FEATURED_WORK.map((project) => project.id))
  const featuredGithubUrls = new Set(
    FEATURED_WORK.flatMap((project) => [project.github, project.demo]).filter(Boolean).map((url) => url!.toLowerCase()),
  )

  const githubFeaturedCandidates = githubProjects
    .filter((project) => {
      const githubUrl = project.github?.toLowerCase()
      const demoUrl = project.demo?.toLowerCase()
      return (
        Boolean(project.demo) &&
        project.status === 'Live' &&
        !featuredIds.has(project.id) &&
        !githubUrl?.includes('/grinite-tech-system') &&
        !(githubUrl && featuredGithubUrls.has(githubUrl)) &&
        !(demoUrl && featuredGithubUrls.has(demoUrl))
      )
    })
    .sort(
      (a, b) =>
        new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime(),
    )
    .slice(0, EXTRA_FEATURED_FROM_GITHUB)

  const featured = [...FEATURED_WORK, ...githubFeaturedCandidates]
  const githubFeaturedIds = new Set(githubFeaturedCandidates.map((project) => project.id))
  const moreGithubProjects = githubProjects.filter((project) => !githubFeaturedIds.has(project.id))

  async function openProjectDetails(project: PortfolioProject) {
    setDetailsOpen(true)
    setDetailsError(null)

    if (detailsCache[project.id]) {
      setSelectedDetails(detailsCache[project.id])
      return
    }

    if (project.detailsOverride) {
      const customDetails: ProjectDetails = {
        title: project.title,
        summary: project.detailsOverride.summary,
        technologies: project.detailsOverride.technologies,
        features: project.detailsOverride.features,
      }
      setDetailsCache((prev) => ({ ...prev, [project.id]: customDetails }))
      setSelectedDetails(customDetails)
      return
    }

    setSelectedDetails(baseProjectDetails(project))

    const parsed = parseGitHubRepo(project.github)
    if (!parsed) return

    setDetailsLoading(true)
    try {
      const response = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.raw+json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Readme fetch failed: ${response.status}`)
      }

      const markdown = await response.text()
      const summarized = summarizeReadme(markdown, project)
      setDetailsCache((prev) => ({ ...prev, [project.id]: summarized }))
      setSelectedDetails(summarized)
    } catch (readmeError) {
      console.error('Unable to fetch README details', readmeError)
      const fallback = baseProjectDetails(project)
      if (project.description === 'Open-source project.' || fallback.features.length === 0) {
        setDetailsError('Could not load README summary. Showing project overview.')
      }
      setDetailsCache((prev) => ({ ...prev, [project.id]: fallback }))
      setSelectedDetails(fallback)
    } finally {
      setDetailsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-900 mx-auto mb-4"></div>
          <p className="text-gray-200">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-crimson-900 text-white px-4 py-2 rounded-lg hover:bg-crimson-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900">
      {/* Header */}
      <div className="bg-emerald-950 shadow-lg border-b border-emerald-900/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-emerald-50/90 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Greenford Walter Katuruza — Portfolio
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Full-stack software developer specializing in modern web technologies, 
            mobile applications, and scalable backend systems. Passionate about creating 
            innovative solutions that drive business growth.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/waltergkaturuza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/15 backdrop-blur-sm border border-white/25 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              View GitHub
            </a>
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="bg-crimson-900 text-white px-6 py-3 rounded-lg hover:bg-crimson-800 transition-colors font-medium"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/15 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-white/10 text-gray-100 text-sm px-3 py-1 rounded-full border border-white/15"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-100 text-center mb-12 tracking-tight">
            Featured Work
          </h2>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {featured.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => openProjectDetails(project)}
                    className="group block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`View details for ${project.title}`}
                  >
                    <ProjectThumbnail
                      title={project.title}
                      subtitle={project.description}
                      demo={project.demo}
                      previewImage={project.previewImage}
                    />
                  </button>
                  <div className="border-y border-gray-200 px-4 py-2 text-center bg-gray-50">
                    <p className="text-sm text-gray-600">
                      {project.type === 'system'
                        ? 'Click image to view app details'
                        : 'Click image to view site details'}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
                        {project.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Live' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : project.status === 'Suspended'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {project.status || 'Project'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[1.05rem] mb-4 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(project.technologies ?? []).slice(0, 3).map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.technologies?.length ?? 0) > 3 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-200">
                          +{(project.technologies?.length ?? 0) - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openProjectDetails(project)}
                        className="flex-1 text-center bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        {detailsLabel(project.type)}
                      </button>
                      {project.demo && (
                        <a 
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {project.type === 'system' ? 'Launch App' : 'Visit Site'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-200 mb-2">No projects available yet.</p>
              <p className="text-gray-300">Add projects or connect GitHub to show work here.</p>
            </div>
          )}
        </div>

        {/* More from GitHub */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={() => setShowMoreGithub((prev) => !prev)}
              className="bg-white/15 backdrop-blur-sm border border-white/25 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              {showMoreGithub ? 'Hide More from GitHub' : 'View More from GitHub'}
            </button>
          </div>

          {showMoreGithub && (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-12">More from GitHub</h2>
              {moreGithubProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {moreGithubProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      <button
                        type="button"
                        onClick={() => openProjectDetails(project)}
                        className="group block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        aria-label={`View details for ${project.title}`}
                      >
                        <ProjectThumbnail
                          title={project.title}
                          subtitle={project.technologies.join(' • ')}
                          demo={project.demo}
                          previewImage={project.previewImage}
                        />
                      </button>
                      <div className="border-y border-gray-200 px-4 py-2 text-center bg-gray-50">
                        <p className="text-sm text-gray-600">Click image to view project details</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-semibold text-gray-900 leading-tight">{project.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'Live'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-[1.05rem] mb-4 line-clamp-3">{project.description}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openProjectDetails(project)}
                            className="flex-1 text-center bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            {detailsLabel(project.type)}
                          </button>
                          {project.demo && (
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {project.type === 'system' ? 'Launch App' : 'Visit Site'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-200">
                  No public repos found yet.
                </div>
              )}
            </>
          )}
        </div>

        {/* Experience Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Experience & Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CodeBracketIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clean Code</h3>
              <p className="text-black text-sm">
                Writing maintainable, scalable, and well-documented code following industry best practices.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full-Stack</h3>
              <p className="text-black text-sm">
                End-to-end development from database design to user interface implementation.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-black text-sm">
                Responsive design and mobile application development for all platforms.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-black text-sm">
                Optimized applications with focus on speed, scalability, and user experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white rounded-lg shadow-sm border p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Work Together</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to bring your project to life? Let's discuss how I can help you build 
            something amazing with cutting-edge technology and best practices.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start a Project
            </a>
            <Link 
              href="/services"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>

      {detailsOpen && selectedDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-md p-4 sm:p-6 md:p-8"
          onClick={() => setDetailsOpen(false)}
          role="presentation"
        >
          <div
            className="relative mx-auto w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl ring-1 ring-white/40 animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-details-title"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/45 to-emerald-100/35" />
            <div className="relative flex items-center justify-between border-b border-white/40 bg-white/35 px-6 py-5 backdrop-blur-xl">
              <h3 id="project-details-title" className="text-2xl font-semibold text-slate-900 pr-4">
                {selectedDetails.title}
              </h3>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/60 text-slate-600 transition hover:bg-white hover:text-slate-900"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="relative overflow-y-auto px-6 py-6 md:px-8 md:py-7">
              {detailsLoading && (
                <p className="mb-4 text-sm text-slate-500">Loading README summary...</p>
              )}
              {detailsError && (
                <p className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 backdrop-blur-sm">
                  {detailsError}
                </p>
              )}

              <p className="mb-7 text-base leading-relaxed text-slate-700 md:text-lg">
                {renderFormattedText(selectedDetails.summary)}
              </p>

              <h4 className="mb-3 text-xl font-semibold text-slate-900 md:text-2xl">Technologies & Skills</h4>
              <div className="mb-8 flex flex-wrap gap-2.5">
                {selectedDetails.technologies.map((tech) => (
                  <span
                    key={`${selectedDetails.title}-${tech}`}
                    className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 text-sm font-medium text-emerald-800 backdrop-blur-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {selectedDetails.features.length > 0 && (
                <>
                  <h4 className="mb-3 text-xl font-semibold text-slate-900 md:text-2xl">Key Features</h4>
                  <ul className="list-disc space-y-2.5 pl-6 text-slate-800">
                    {selectedDetails.features.map((feature, index) => (
                      <li key={`${selectedDetails.title}-${index}`} className="leading-relaxed">
                        {renderFormattedText(feature)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}