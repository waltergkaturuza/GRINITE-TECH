'use client'

import { useState, useEffect } from 'react'
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
  type?: 'web' | 'mobile' | 'backend' | 'data' | 'system'
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

const FEATURED_WORK: PortfolioProject[] = [
  {
    id: 'quantis-portfolio',
    title: 'Quantis Technologies Website & Portfolio',
    description: 'Company website and portfolio presence for Quantis Technologies.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    status: 'Live',
    demo: 'https://www.quantistechnologies.co.zw',
    type: 'web',
  },
  {
    id: 'tnf-summit',
    title: 'TNF Global Summit 2026 Admin Dashboard',
    description: 'Conference admin dashboard for registrations, content, and event workflows.',
    technologies: ['Next.js', 'TypeScript', 'Vercel'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/tnf_summit',
    demo: 'https://tnf-summit.vercel.app',
    type: 'web',
  },
  {
    id: 'saywhat-sirtis',
    title: 'SAYWHAT SIRTIS',
    description: 'Integrated real-time information system with secure access portal and enterprise workflows.',
    technologies: ['Next.js', 'TypeScript', 'Realtime', 'RBAC'],
    status: 'Live',
    github: 'https://github.com/waltergkaturuza/SaywhatSirtis',
    demo: 'https://saywhat-sirtis.vercel.app/',
    type: 'system',
  },
  {
    id: 'poz-fuel',
    title: 'POZ Fuel Coupon System',
    description: 'Fuel coupon issuance and tracking system for operational control and reporting.',
    technologies: ['Web App', 'Auth', 'Reporting'],
    status: 'Live',
    demo: 'https://parliament-zimbabwe-fuel-system.vercel.app/',
    github: 'https://github.com/waltergkaturuza/Parliament-Zimbabwe',
    type: 'system',
  },
  {
    id: 'munda-market-buyer',
    title: 'Munda Market (Buyer Portal)',
    description: 'Buyer experience for browsing products, ordering, and account management.',
    technologies: ['Web App', 'E-commerce'],
    status: 'Live',
    demo: 'https://munda-market-buyer.vercel.app/',
    github: 'https://github.com/waltergkaturuza/Munda-Market',
    type: 'web',
  },
  {
    id: 'munda-market-admin',
    title: 'Munda Market (Admin Console)',
    description: 'Admin console for catalog, orders, users and operational workflows.',
    technologies: ['Admin', 'RBAC', 'Analytics'],
    status: 'Live',
    demo: 'https://munda-market-admin.vercel.app/login',
    github: 'https://github.com/waltergkaturuza/Munda-Market',
    type: 'web',
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

export default function Portfolio() {
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    .slice(0, 9)
    .map((r) => ({
      id: `gh-${r.id}`,
      title: r.name.replace(/[-_]/g, ' '),
      description: r.description || 'Open-source project.',
      technologies: [r.language || 'Software'].filter(Boolean) as string[],
      status: r.homepage ? 'Live' : 'Open Source',
      github: r.html_url,
      demo: r.homepage || undefined,
      type: 'web',
    }))

  const featured = FEATURED_WORK

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950/95 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-800/70 overflow-hidden hover:border-emerald-500/70 hover:shadow-2xl transition-all"
                >
                  <div className="h-48 bg-emerald-900/40">
                    <img
                      src={svgThumbDataUri(project.title, project.description)}
                      alt={`${project.title} thumbnail`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg md:text-xl font-semibold text-emerald-50 tracking-tight">
                        {project.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Live' 
                          ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/25' 
                          : project.status === 'Suspended'
                            ? 'bg-red-400/15 text-red-200 border border-red-400/25'
                            : 'bg-amber-400/15 text-amber-200 border border-amber-400/25'
                      }`}>
                        {project.status || 'Project'}
                      </span>
                    </div>
                    <p className="text-emerald-100/90 text-sm mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(project.technologies ?? []).slice(0, 3).map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="bg-emerald-900/60 text-emerald-100 text-xs px-2 py-1 rounded-full border border-emerald-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.technologies?.length ?? 0) > 3 && (
                        <span className="bg-emerald-900/60 text-emerald-100 text-xs px-2 py-1 rounded-full border border-emerald-700/60">
                          +{(project.technologies?.length ?? 0) - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {project.github && (
                        <a 
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-white/15 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a 
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-crimson-900 text-white text-sm px-3 py-2 rounded-lg hover:bg-crimson-800 transition-colors"
                        >
                          Live Demo
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">More from GitHub</h2>
          {githubProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {githubProjects.map((project) => (
                <div key={project.id} className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/15 overflow-hidden hover:border-white/25 transition-all">
                  <div className="h-40 bg-black/20">
                    <img
                      src={svgThumbDataUri(project.title, project.technologies.join(' • '))}
                      alt={`${project.title} thumbnail`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Live'
                          ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/25'
                          : 'bg-white/10 text-gray-100 border border-white/15'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-white/15 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                        >
                          Repo
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-crimson-900 text-white text-sm px-3 py-2 rounded-lg hover:bg-crimson-800 transition-colors"
                        >
                          Live
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
    </div>
  )
}