'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { projectsAPI } from '@/lib/api'
import { 
  ArrowLeftIcon, 
  CodeBracketIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const projectsResponse = await projectsAPI.getProjects()
        setProjects(projectsResponse || [])
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

  // Create portfolio projects from real data
  const portfolioProjects = projects.slice(0, 6).map(project => ({
    id: project.id,
    title: project.name,
    description: project.description || 'Professional project developed with modern technologies',
    technologies: project.technologies ? project.technologies.split(',').map((t: string) => t.trim()) : ['React', 'Node.js'],
    status: project.status || 'Completed',
    icon: '🚀',
    github: project.repositoryUrl,
    demo: project.liveUrl
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Walter Katuruza - Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Full-stack software developer specializing in modern web technologies, 
            mobile applications, and scalable backend systems. Passionate about creating 
            innovative solutions that drive business growth.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/waltergkaturuza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View GitHub
            </a>
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
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
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Featured Projects</h2>
          {portfolioProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl opacity-20">
                      {project.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {project.github && (
                        <a 
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a 
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
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
              <p className="text-gray-600 mb-4">No projects available yet.</p>
              <Link 
                href="/dashboard/projects"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Projects
              </Link>
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Experience & Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CodeBracketIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clean Code</h3>
              <p className="text-gray-600 text-sm">
                Writing maintainable, scalable, and well-documented code following industry best practices.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full-Stack</h3>
              <p className="text-gray-600 text-sm">
                End-to-end development from database design to user interface implementation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600 text-sm">
                Responsive design and mobile application development for all platforms.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-gray-600 text-sm">
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
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}