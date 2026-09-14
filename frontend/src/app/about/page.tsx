import PublicPage from '@/components/PublicPage'
import Link from 'next/link'
import { QUANTIS_LOGO_URL } from '@/constants/company'
import ValuesTypingCards from '@/components/ValuesTypingCards'
import PageBackdrop from '@/components/PageBackdrop'

const values = [
  {
    title: 'Innovation',
    description: 'We embrace cutting-edge technologies and creative solutions to solve complex problems.'
  },
  {
    title: 'Quality',
    description: 'Every project undergoes rigorous testing and quality assurance to exceed expectations.'
  },
  {
    title: 'Collaboration',
    description: 'We work closely with our clients as partners in their digital transformation journey.'
  },
  {
    title: 'Growth',
    description: 'We focus on scalable solutions that grow with your business and adapt to changing needs.'
  }
]

const achievements = [
  {
    number: '100+',
    label: 'Projects Completed',
    description: 'Successfully delivered projects across various industries'
  },
  {
    number: '50+',
    label: 'Happy Clients',
    description: 'Building long-term partnerships with satisfied customers'
  },
  {
    number: '5+',
    label: 'Years Experience',
    description: 'Proven track record in software development and consulting'
  },
  {
    number: '99%',
    label: 'Project Success Rate',
    description: 'Delivering on time and within budget consistently'
  }
]

export default function AboutPage() {
  return (
    <PublicPage className="bg-granite-900">
      <div className="relative overflow-hidden">
        <PageBackdrop
          src="/istockphoto-2217832615-640x640.jpg"
          priority
          overlayClassName="bg-gradient-to-br from-granite-900/70 via-granite-900/55 to-crimson-950/65"
        />

        <div className="relative z-10">
          <section className="text-white pt-6 pb-4 sm:pt-8 sm:pb-5">
            <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-site-max font-bold mb-3 drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-peach-400">Quantis Technologies</span>
              </h1>
              <p className="text-xl md:text-2xl text-granite-200 max-w-3xl mx-auto">
                We're a passionate team of developers, designers, and strategists dedicated to building exceptional digital experiences.
              </p>
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="wide-container px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Mission</h2>
                  <p className="text-lg text-granite-200 mb-4">
                    At Quantis Technologies, we believe technology should empower businesses to reach their full potential.
                    Our mission is to bridge the gap between complex technical challenges and elegant, user-friendly solutions.
                  </p>
                  <p className="text-lg text-granite-200 mb-6">
                    We don't just build software – we craft digital experiences that drive growth, enhance productivity,
                    and create lasting value for our clients and their customers.
                  </p>
                  <Link
                    href="/contact"
                    className="bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Start Your Project
                  </Link>
                </div>
                <div className="flex justify-center lg:justify-end items-start overflow-visible min-w-0">
                  <div className="quantis-logo-hinge">
                    <img
                      src={QUANTIS_LOGO_URL}
                      alt="Quantis Technologies"
                      className="quantis-logo-on-dark h-36 sm:h-44 lg:h-52 w-auto max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="wide-container px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Values</h2>
                <p className="text-xl text-granite-200 max-w-3xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>

              <ValuesTypingCards values={values} />
            </div>
          </section>

          <section className="py-8 sm:py-10 text-white">
            <div className="wide-container px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Achievements</h2>
                <p className="text-xl text-granite-200 max-w-3xl mx-auto">
                  Numbers that speak to our commitment and success
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.label}
                    className="text-center bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                    <div className="text-xl font-semibold mb-3">{achievement.label}</div>
                    <p className="text-granite-200">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pt-8 sm:pt-10 pb-12 sm:pb-14">
            <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Work Together?
              </h2>
              <p className="text-xl text-granite-200 mb-6">
                Let's discuss how we can help bring your vision to life with innovative technology solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Get In Touch
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white/80 text-white hover:bg-white hover:text-granite-900 px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  View Our Services
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicPage>
  )
}
