'use client'

type TechItem = {
  name: string
  slug: string
  color: string
  maskSrc?: string
}

const ROW_ONE: TechItem[] = [
  { name: 'React', slug: 'react', color: '61DAFB' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'ffffff' },
  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
  { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
  { name: 'HTML5', slug: 'html5', color: 'E34F26' },
  { name: 'CSS3', slug: 'css', color: '1572B6' },
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
  { name: 'NestJS', slug: 'nestjs', color: 'E0234E' },
  { name: 'Express', slug: 'express', color: 'ffffff' },
  { name: 'Python', slug: 'python', color: '3776AB' },
  { name: 'Java', slug: 'openjdk', color: 'ED8B00' },
  { name: 'C#', slug: 'csharp', color: '512BD4', maskSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/csharp.svg' },
  { name: '.NET', slug: 'dotnet', color: '512BD4' },
]

const ROW_TWO: TechItem[] = [
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'MySQL', slug: 'mysql', color: '4479A1' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
  { name: 'Redis', slug: 'redis', color: 'FF4438' },
  { name: 'Prisma', slug: 'prisma', color: 'E2E8F0' },
  { name: 'TypeORM', slug: '', color: 'FE0902' },
  { name: 'React Native', slug: 'react', color: '61DAFB' },
  { name: 'Flutter', slug: 'flutter', color: '02569B' },
  { name: 'Android', slug: 'android', color: '3DDC84' },
  { name: 'iOS', slug: 'apple', color: 'ffffff' },
  { name: 'Expo', slug: 'expo', color: 'ffffff' },
  { name: 'AWS', slug: 'amazonaws', color: 'FF9900', maskSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonaws.svg' },
  { name: 'Docker', slug: 'docker', color: '2496ED' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '326CE5' },
  { name: 'Vercel', slug: 'vercel', color: 'ffffff' },
  { name: 'Render', slug: 'render', color: 'ffffff' },
  { name: 'Git', slug: 'git', color: 'F05032' },
  { name: 'GitHub', slug: 'github', color: 'ffffff' },
  { name: 'VS Code', slug: '', color: '007ACC' },
  { name: 'Figma', slug: 'figma', color: 'F24E1E' },
  { name: 'Jira', slug: 'jira', color: '2684FF' },
  { name: 'Postman', slug: 'postman', color: 'FF6C37' },
]

function TechPill({ item }: { item: TechItem }) {
  return (
    <span className="qt-tech-pill">
      {item.maskSrc ? (
        <span
          className="qt-tech-mask"
          style={{
            backgroundColor: `#${item.color}`,
            WebkitMaskImage: `url(${item.maskSrc})`,
            maskImage: `url(${item.maskSrc})`,
          }}
          aria-hidden
        />
      ) : item.slug ? (
        <img
          src={`https://cdn.simpleicons.org/${item.slug}/${item.color}`}
          alt=""
          width={18}
          height={18}
        />
      ) : (
        <span className="qt-tech-mark" style={{ color: `#${item.color}` }} aria-hidden>
          {item.name.slice(0, 1)}
        </span>
      )}
      {item.name}
    </span>
  )
}

function MarqueeRow({ items, reverse = false }: { items: TechItem[]; reverse?: boolean }) {
  const loop = [...items, ...items]
  return (
    <div className="qt-marquee-viewport">
      <div className={`qt-marquee-track ${reverse ? 'qt-marquee-reverse' : ''}`}>
        {loop.map((item, index) => (
          <TechPill key={`${item.name}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}

export default function TechSkillMarquee() {
  return (
    <section className="qt-skill-marquee px-4 py-8 sm:px-8 sm:py-10" aria-label="Technical skills">
      <span className="qt-skill-corner qt-skill-corner-tl" aria-hidden />
      <span className="qt-skill-corner qt-skill-corner-tr" aria-hidden />
      <span className="qt-skill-corner qt-skill-corner-bl" aria-hidden />
      <span className="qt-skill-corner qt-skill-corner-br" aria-hidden />

      <div className="mb-7 flex justify-center">
        <p className="rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
          The stack we build with
        </p>
      </div>

      <div className="space-y-3">
        <MarqueeRow items={ROW_ONE} />
        <MarqueeRow items={ROW_TWO} reverse />
      </div>
    </section>
  )
}
