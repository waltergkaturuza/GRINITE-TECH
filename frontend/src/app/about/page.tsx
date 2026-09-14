import PublicPage from '@/components/PublicPage'
import Link from 'next/link'

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
    <PublicPage>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900 text-white py-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-site-max font-bold mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-peach-400">Quantis Technologies</span>
          </h1>
          <p className="text-xl md:text-2xl text-granite-200 mb-8 max-w-3xl mx-auto">
            We're a passionate team of developers, designers, and strategists dedicated to building exceptional digital experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-granite-800 dark:text-granite-100 mb-6">Our Mission</h2>
              <p className="text-lg text-granite-600 dark:text-granite-300 mb-6">
                At Quantis Technologies, we believe technology should empower businesses to reach their full potential. 
                Our mission is to bridge the gap between complex technical challenges and elegant, user-friendly solutions.
              </p>
              <p className="text-lg text-granite-600 dark:text-granite-300 mb-8">
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
            <div className="bg-gradient-to-br from-granite-100 to-granite-200 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-granite-800 dark:text-granite-100 mb-4">Founded in 2019</h3>
                <p className="text-granite-600 dark:text-granite-300 mb-6">
                  Started with a vision to make enterprise-grade technology accessible to businesses of all sizes.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-crimson-900">100+</div>
                    <div className="text-granite-600 dark:text-granite-300">Projects</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-crimson-900">50+</div>
                    <div className="text-granite-600 dark:text-granite-300">Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-granite-800 dark:text-granite-100 mb-4">Our Values</h2>
            <p className="text-xl text-granite-600 dark:text-granite-300 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center bg-gradient-to-br from-granite-50 to-white p-8 rounded-2xl border border-granite-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-granite-800 dark:text-granite-100 mb-4">{value.title}</h3>
                <p className="text-granite-600 dark:text-granite-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-granite-800 to-crimson-900 text-white">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Achievements</h2>
            <p className="text-xl text-granite-200 max-w-3xl mx-auto">
              Numbers that speak to our commitment and success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-xl font-semibold mb-3">{achievement.label}</div>
                <p className="text-granite-200">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-granite-800 dark:text-granite-100 mb-6">
            Ready to Work Together?
          </h2>
          <p className="text-xl text-granite-600 dark:text-granite-300 mb-8">
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
              className="border-2 border-granite-800 text-granite-800 dark:text-granite-100 hover:bg-granite-800 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </PublicPage>
  )
}