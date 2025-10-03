import Link from 'next/link'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import Navigation from './components/Navigation'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-granite-800/90 via-crimson-900/80 to-jungle-900/90"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Comprehensive Business
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900"> Solutions</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              From web development to digital products, we provide end-to-end solutions 
              that help your business thrive in the digital world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-crimson-900 hover:bg-crimson-800 text-white font-medium text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Your Project
                <ArrowRightIcon className="ml-2 h-5 w-5 inline" />
              </Link>
              <Link href="/portfolio" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-medium text-lg px-8 py-3 rounded-lg transition-all duration-200">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-crimson-900 to-transparent"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-granite-800 mb-4">
              Everything You Need to <span className="text-crimson-900">Succeed</span>
            </h2>
            <p className="text-xl text-granite-600">
              Comprehensive solutions tailored to your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card group hover:border-crimson-200 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-crimson-900 to-crimson-700 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-granite-800 mb-2">
                Web Development
              </h3>
              <p className="text-granite-600">
                Custom websites and web applications built with modern technologies
              </p>
            </div>

            <div className="card group hover:border-jungle-200 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-jungle-900 to-olive-900 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-granite-800 mb-2">
                Digital Products
              </h3>
              <p className="text-granite-600">
                Templates, tools, and digital assets to accelerate your business
              </p>
            </div>

            <div className="card group hover:border-yellow-200 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-900 to-peach-900 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckIcon className="h-6 w-6 text-granite-800" />
              </div>
              <h3 className="text-xl font-semibold text-granite-800 mb-2">
                Business Automation
              </h3>
              <p className="text-granite-600">
                Streamline operations with custom automation solutions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-granite-800 to-crimson-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-granite-800/95 to-crimson-900/95"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your <span className="text-yellow-900">Business</span>?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join hundreds of satisfied clients who trust GRANITE TECH
          </p>
          <Link href="/contact" className="bg-white text-granite-800 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-granite-800 text-white py-12 border-t border-granite-700">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-900">GRANITE TECH</h3>
              <p className="text-gray-300">
                Comprehensive business solutions for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-crimson-300">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-crimson-300 transition-colors duration-200">Web Development</li>
                <li className="hover:text-crimson-300 transition-colors duration-200">Mobile Apps</li>
                <li className="hover:text-crimson-300 transition-colors duration-200">Digital Products</li>
                <li className="hover:text-crimson-300 transition-colors duration-200">Automation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-jungle-300">Products</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-jungle-300 transition-colors duration-200">Templates</li>
                <li className="hover:text-jungle-300 transition-colors duration-200">Tools</li>
                <li className="hover:text-jungle-300 transition-colors duration-200">APIs</li>
                <li className="hover:text-jungle-300 transition-colors duration-200">Plugins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-olive-300">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-olive-300 transition-colors duration-200">support@granite-tech.com</li>
                <li className="hover:text-olive-300 transition-colors duration-200">+1 (555) 123-4567</li>
                <li className="hover:text-olive-300 transition-colors duration-200">Live Chat</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-granite-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 <span className="text-crimson-300">GRANITE TECH</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}