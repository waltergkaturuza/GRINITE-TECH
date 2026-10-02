'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type TechItem = {
  name: string
  slug: string
  color: string
  maskSrc?: string
  about: string
  usedFor: string
}

const ROW_ONE: TechItem[] = [
  { name: 'React', slug: 'react', color: '61DAFB', about: 'Builds interactive screens from reusable pieces.', usedFor: 'Dashboards, client portals, and public websites.' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'ffffff', about: 'Runs React apps with routing, pages, and search-friendly delivery.', usedFor: 'The company site and web applications.' },
  { name: 'TypeScript', slug: 'typescript', color: '3178C6', about: 'Adds types to JavaScript so mistakes show up before release.', usedFor: 'Frontend and API code on larger systems.' },
  { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4', about: 'Styles interfaces with small utility classes instead of large stylesheets.', usedFor: 'Layouts across the site, dashboard, and invoices.' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E', about: 'The language browsers and many servers already understand.', usedFor: 'Interactive pages and supporting scripts.' },
  { name: 'HTML5', slug: 'html5', color: 'E34F26', about: 'Defines the structure of a web page.', usedFor: 'Every website and web app we ship.' },
  { name: 'CSS3', slug: 'css', color: '1572B6', about: 'Controls layout, color, and motion on the screen.', usedFor: 'Responsive pages, including this skills strip.' },
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E', about: 'Runs JavaScript on the server.', usedFor: 'APIs, background jobs, and realtime features.' },
  { name: 'NestJS', slug: 'nestjs', color: 'E0234E', about: 'Organizes Node services into modules, with validation and a clear structure.', usedFor: 'The business API behind invoices, clients, and projects.' },
  { name: 'Express', slug: 'express', color: 'ffffff', about: 'A small toolkit for HTTP servers and routes.', usedFor: 'Lighter APIs and integration endpoints.' },
  { name: 'Python', slug: 'python', color: '3776AB', about: 'A clear language for automation, data, and services.', usedFor: 'Scripts, data tasks, and integrations.' },
  { name: 'Java', slug: 'openjdk', color: 'ED8B00', about: 'A long-standing language for enterprise services.', usedFor: 'Client systems that need a JVM backend.' },
  { name: 'C#', slug: 'csharp', color: '512BD4', maskSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/csharp.svg', about: 'Microsoft’s language for business applications.', usedFor: '.NET services and Windows-friendly systems.' },
  { name: '.NET', slug: 'dotnet', color: '512BD4', about: 'Microsoft’s platform for web services and desktop-linked apps.', usedFor: 'Enterprise backends requested by clients.' },
]

const ROW_TWO: TechItem[] = [
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1', about: 'A reliable database for structured records and reporting.', usedFor: 'Invoices, clients, projects, and other core records.' },
  { name: 'MySQL', slug: 'mysql', color: '4479A1', about: 'A widely used relational database.', usedFor: 'Client systems that already store data in MySQL.' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248', about: 'Stores flexible documents instead of fixed tables.', usedFor: 'Records whose shape changes from one item to the next.' },
  { name: 'Redis', slug: 'redis', color: 'FF4438', about: 'Keeps small pieces of data in memory for very fast access.', usedFor: 'Short-lived data and quick lookups.' },
  { name: 'Prisma', slug: 'prisma', color: 'E2E8F0', about: 'A typed toolkit for reading and writing a database from Node.', usedFor: 'Projects that want safer database queries.' },
  { name: 'TypeORM', slug: '', color: 'FE0902', about: 'Maps database tables to code objects.', usedFor: 'The NestJS API that talks to PostgreSQL.' },
  { name: 'React Native', slug: 'react', color: '61DAFB', about: 'Builds iOS and Android apps with React.', usedFor: 'Mobile apps that share one codebase.' },
  { name: 'Flutter', slug: 'flutter', color: '02569B', about: 'Draws mobile interfaces from a single Dart codebase.', usedFor: 'Cross-platform phone apps.' },
  { name: 'Android', slug: 'android', color: '3DDC84', about: 'Google’s phone and tablet platform.', usedFor: 'Field and client apps on Android devices.' },
  { name: 'iOS', slug: 'apple', color: 'ffffff', about: 'Apple’s platform for iPhone and iPad.', usedFor: 'Companion apps released alongside Android.' },
  { name: 'Expo', slug: 'expo', color: 'ffffff', about: 'Tools that build, preview, and ship React Native apps.', usedFor: 'Faster mobile builds and device testing.' },
  { name: 'AWS', slug: 'amazonaws', color: 'FF9900', maskSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonaws.svg', about: 'Amazon’s cloud for servers, storage, and databases.', usedFor: 'Production hosting and file storage.' },
  { name: 'Docker', slug: 'docker', color: '2496ED', about: 'Packages an app so it runs the same way everywhere.', usedFor: 'Development and production deployments.' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '326CE5', about: 'Runs and scales many containers across servers.', usedFor: 'Systems that need to grow under load.' },
  { name: 'Vercel', slug: 'vercel', color: 'ffffff', about: 'Hosts frontend apps and puts them on a global network.', usedFor: 'Next.js sites, including this one.' },
  { name: 'Render', slug: 'render', color: 'ffffff', about: 'Hosts web services without a large infrastructure setup.', usedFor: 'APIs and sites that need a straightforward deploy.' },
  { name: 'Git', slug: 'git', color: 'F05032', about: 'Tracks every change to the source code.', usedFor: 'All project history and releases.' },
  { name: 'GitHub', slug: 'github', color: 'ffffff', about: 'Stores repositories and coordinates reviews.', usedFor: 'Source control and team collaboration.' },
  { name: 'VS Code', slug: '', color: '007ACC', about: 'The editor used to write, search, and review code.', usedFor: 'Day-to-day development.' },
  { name: 'Figma', slug: 'figma', color: 'F24E1E', about: 'Designs screens and flows before they are built.', usedFor: 'Interface layouts and client reviews.' },
  { name: 'Jira', slug: 'jira', color: '2684FF', about: 'Tracks tasks, bugs, and delivery progress.', usedFor: 'Planning work across a project.' },
  { name: 'Postman', slug: 'postman', color: 'FF6C37', about: 'Sends requests to an API and checks the response.', usedFor: 'Testing and documenting APIs.' },
]

function TechMark({ item }: { item: TechItem }) {
  if (item.maskSrc) {
    return (
      <span
        className="qt-tech-mask"
        style={{
          backgroundColor: `#${item.color}`,
          WebkitMaskImage: `url(${item.maskSrc})`,
          maskImage: `url(${item.maskSrc})`,
        }}
        aria-hidden
      />
    )
  }
  if (item.slug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${item.slug}/${item.color}`}
        alt=""
        width={18}
        height={18}
      />
    )
  }
  return (
    <span className="qt-tech-mark" style={{ color: `#${item.color}` }} aria-hidden>
      {item.name.slice(0, 1)}
    </span>
  )
}

function TechPill({ item, onOpen, tabIndex = 0 }: { item: TechItem; onOpen: (item: TechItem) => void; tabIndex?: number }) {
  return (
    <button type="button" className="qt-tech-pill" tabIndex={tabIndex} onClick={() => onOpen(item)}>
      <TechMark item={item} />
      {item.name}
    </button>
  )
}

function MarqueeRow({
  items,
  reverse = false,
  onOpen,
}: {
  items: TechItem[]
  reverse?: boolean
  onOpen: (item: TechItem) => void
}) {
  return (
    <div className="qt-marquee-viewport">
      <div className={`qt-marquee-track ${reverse ? 'qt-marquee-reverse' : ''}`}>
        {[0, 1].map((copy) => (
          <div className="qt-marquee-group" key={copy} aria-hidden={copy === 1}>
            {items.map((item) => (
              <TechPill key={`${copy}-${item.name}`} item={item} onOpen={onOpen} tabIndex={copy === 1 ? -1 : 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TechSkillMarquee() {
  const [selected, setSelected] = useState<TechItem | null>(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <section className={`qt-skill-marquee px-0 py-8 sm:py-10 ${selected ? 'is-paused' : ''}`} aria-label="Technical skills">
      <div className="mb-7 flex justify-center px-4">
        <p className="rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
          The stack we build with
        </p>
      </div>

      <div className="space-y-3">
        <MarqueeRow items={ROW_ONE} onOpen={setSelected} />
        <MarqueeRow items={ROW_TWO} reverse onOpen={setSelected} />
      </div>

      {selected && createPortal(
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tech-skill-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900">
                <TechMark item={selected} />
              </span>
              <h3 id="tech-skill-title" className="text-xl font-semibold">
                {selected.name}
              </h3>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What it does</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{selected.about}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Where we use it</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{selected.usedFor}</p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </section>
  )
}
