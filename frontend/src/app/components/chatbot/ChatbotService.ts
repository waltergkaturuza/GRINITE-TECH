import { ChatbotIntent, IntentClassificationResult, ChatbotResponse } from './types'

export class ChatbotService {
  private apiKey: string | null = null
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null
  }

  /**
   * Classify user intent based on message content
   */
  classifyIntent(message: string): IntentClassificationResult {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Intent patterns
    const intentPatterns: Record<ChatbotIntent, string[]> = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
      services: ['service', 'what do you do', 'what do you offer', 'capabilities', 'solutions', 'development'],
      pricing: ['price', 'cost', 'how much', 'pricing', 'quote', 'estimate', 'budget', 'rate'],
      contact: ['contact', 'reach', 'call', 'email', 'phone', 'address', 'location', 'get in touch'],
      portfolio: ['portfolio', 'work', 'example', 'case study', 'previous project', 'showcase', 'clients'],
      process: ['process', 'how do you', 'methodology', 'approach', 'workflow', 'timeline', 'steps'],
      support: ['help', 'support', 'problem', 'issue', 'trouble', 'assistance', 'stuck'],
      technical: ['technical', 'technology', 'stack', 'framework', 'database', 'api', 'integration'],
      business: ['business', 'company', 'team', 'about', 'who are you', 'experience', 'founded'],
      default: []
    }

    let bestMatch: ChatbotIntent = 'default'
    let maxScore = 0

    // Calculate intent scores
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (intent === 'default') continue

      let score = 0
      patterns.forEach(pattern => {
        if (normalizedMessage.includes(pattern)) {
          score += pattern.length / normalizedMessage.length
        }
      })

      if (score > maxScore) {
        maxScore = score
        bestMatch = intent as ChatbotIntent
      }
    }

    // Extract entities (basic implementation)
    const entities: Record<string, string> = {}
    
    // Extract potential service names
    const serviceKeywords = ['website', 'mobile app', 'ecommerce', 'api', 'cloud', 'analytics']
    serviceKeywords.forEach(service => {
      if (normalizedMessage.includes(service)) {
        entities.service = service
      }
    })

    // Extract potential budget mentions
    const budgetMatch = normalizedMessage.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/g)
    if (budgetMatch) {
      entities.budget = budgetMatch[0]
    }

    return {
      intent: bestMatch,
      confidence: Math.min(maxScore * 2, 0.95), // Scale confidence
      entities: Object.keys(entities).length > 0 ? entities : undefined
    }
  }

  /**
   * Generate contextual response based on intent and entities
   */
  generateResponse(message: string, intent: ChatbotIntent, entities?: Record<string, string>): ChatbotResponse {
    const startTime = Date.now()
    
    const responses: Record<ChatbotIntent, string[]> = {
      greeting: [
        "Hello! Welcome to GRANITE TECH. I'm here to help you explore our services and answer any questions you might have. What can I assist you with today?",
        "Hi there! Thanks for visiting GRANITE TECH. I'm your AI assistant, ready to help you learn about our development services, pricing, and how we can bring your ideas to life.",
        "Greetings! I'm GRANITE TECH's AI assistant. Whether you're looking for web development, mobile apps, or custom solutions, I'm here to guide you. How can I help?"
      ],
      services: [
        "GRANITE TECH offers comprehensive digital solutions including:\n\n🌐 **Website Development** (Starting at $1,999)\n📱 **Mobile App Development** (Starting at $7,999)\n🛒 **E-commerce Solutions** (Starting at $4,999)\n⚡ **API Development** (Starting at $2,999)\n☁️ **Cloud Infrastructure** (Starting at $3,499)\n📊 **Analytics Dashboards** (Starting at $3,999)\n\nWhich service interests you most?",
        "We specialize in creating cutting-edge digital solutions:\n\n• Custom website development with modern frameworks\n• Native and cross-platform mobile applications\n• Scalable e-commerce platforms\n• RESTful and GraphQL API development\n• Cloud deployment and infrastructure\n• Business intelligence dashboards\n\nAll projects include ongoing support and maintenance. What type of project are you considering?"
      ],
      pricing: [
        "Our competitive pricing structure:\n\n💰 **Starter Website**: $1,999+\n💰 **Professional Website**: $3,999+\n💰 **E-commerce Platform**: $4,999+\n💰 **Mobile App**: $7,999+\n💰 **API Development**: $2,999+\n💰 **Cloud Setup**: $3,499+\n\nPrices vary based on complexity and features. Would you like a detailed quote for your specific project?",
        "We believe in transparent, value-based pricing. Our packages start at $1,999 for basic websites and scale up based on your needs. Enterprise solutions are custom-quoted. All projects include:\n\n✅ Initial consultation\n✅ Custom design\n✅ Development & testing\n✅ Deployment\n✅ 3 months support\n\nWhat's your project scope and budget range?"
      ],
      contact: [
        "Ready to start your project? Here's how to reach us:\n\n📧 **Email**: Contact form on our website\n📞 **Phone**: Available during business hours\n💬 **Live Chat**: Right here with me!\n🕒 **Response Time**: Within 24 hours\n\nWhat's the best way for our team to follow up with you?",
        "Let's connect! GRANITE TECH is here to help:\n\n• Use our contact form for detailed project discussions\n• Chat with me for immediate questions\n• Schedule a consultation call\n• Email us for quotes and proposals\n\nWe pride ourselves on quick responses and personalized service. How would you prefer to continue our conversation?"
      ],
      portfolio: [
        "We're proud of our diverse portfolio:\n\n🏆 **150+ Projects Completed**\n🏢 **Industries**: Healthcare, Finance, E-commerce, Education, SaaS\n🌟 **Highlights**:\n   • Custom CRM systems\n   • E-commerce platforms processing $1M+ annually\n   • Mobile apps with 100K+ downloads\n   • Enterprise cloud migrations\n\nWhat industry or project type interests you? I can share relevant case studies!",
        "Our portfolio showcases excellence across multiple domains:\n\n• **Startups**: MVP development and rapid prototyping\n• **SMBs**: Digital transformation and automation\n• **Enterprise**: Large-scale system integration\n• **Non-profits**: Cost-effective solutions\n\nRecent successes include AI-powered dashboards, multi-vendor marketplaces, and real-time collaboration tools. What type of project example would you like to see?"
      ],
      process: [
        "Our proven development methodology:\n\n**Phase 1: Discovery** (1-2 weeks)\n   • Requirements gathering\n   • Technical planning\n   • Design mockups\n\n**Phase 2: Development** (4-8 weeks)\n   • Agile sprints\n   • Weekly demos\n   • Continuous testing\n\n**Phase 3: Launch** (1 week)\n   • Deployment\n   • Training\n   • Go-live support\n\n**Phase 4: Support** (Ongoing)\n   • Maintenance\n   • Updates\n   • Scaling\n\nWhich phase would you like to know more about?",
        "We follow an agile, client-centric approach:\n\n🔍 **Research & Planning**: Understanding your vision\n🎨 **Design**: User-focused interfaces\n⚙️ **Development**: Clean, scalable code\n🧪 **Testing**: Rigorous quality assurance\n🚀 **Deployment**: Smooth launches\n📈 **Growth**: Ongoing optimization\n\nTypical timeline: 2-12 weeks depending on complexity. Want to discuss your project timeline?"
      ],
      support: [
        "I'm here to help! What specific challenge are you facing?\n\n• **Technical questions** about our services\n• **Project planning** and requirements\n• **Pricing and timeline** estimates\n• **Portfolio examples** in your industry\n• **Getting started** with your project\n\nJust let me know what you need assistance with, and I'll provide detailed guidance!",
        "No problem! I'm designed to help with any questions about GRANITE TECH:\n\n• Service capabilities and technical details\n• Project scoping and planning\n• Pricing and proposal requests\n• Timeline and process questions\n• Portfolio and case study requests\n\nWhat specific area can I help clarify for you?"
      ],
      technical: [
        "Our technical expertise includes:\n\n**Frontend**: React, Next.js, Vue.js, Angular, TypeScript\n**Backend**: Node.js, Python, .NET, Java, PHP\n**Mobile**: React Native, Flutter, Native iOS/Android\n**Database**: PostgreSQL, MongoDB, MySQL, Redis\n**Cloud**: AWS, Azure, Google Cloud, Docker, Kubernetes\n**APIs**: REST, GraphQL, WebSocket, Microservices\n\nWhat technology stack are you considering for your project?",
        "We stay current with cutting-edge technologies:\n\n🔧 **Modern Frameworks**: Latest versions of React, Vue, Angular\n🗄️ **Scalable Databases**: SQL and NoSQL solutions\n☁️ **Cloud-Native**: Serverless, containers, microservices\n🔒 **Security**: OAuth, JWT, encryption, GDPR compliance\n📱 **Cross-Platform**: Hybrid and native mobile development\n⚡ **Performance**: CDN, caching, optimization\n\nNeed technical consulting for your project architecture?"
      ],
      business: [
        "About GRANITE TECH:\n\n🏢 **Founded**: Dedicated to digital excellence\n👥 **Team**: Experienced full-stack developers, designers, and project managers\n🎯 **Mission**: Transforming business ideas into powerful digital solutions\n🌍 **Reach**: Serving clients globally\n🏆 **Achievement**: 150+ successful projects, 98% client satisfaction\n\nWe combine technical expertise with business acumen to deliver solutions that drive growth. What brings you to GRANITE TECH today?",
        "GRANITE TECH is your trusted technology partner:\n\n• **Experience**: Years of successful project delivery\n• **Expertise**: Full-stack development across all major technologies\n• **Approach**: Client-focused, agile, and transparent\n• **Quality**: Rigorous testing and best practices\n• **Support**: Long-term partnerships beyond project delivery\n\nWe're not just developers – we're strategic partners invested in your success. How can we help achieve your business goals?"
      ],
      default: [
        "That's a great question! I'd love to help you with that. Could you provide a bit more detail about what you're looking for?\n\nI can assist with:\n• Service information and capabilities\n• Pricing and project estimates\n• Technical questions\n• Portfolio examples\n• Getting started with your project",
        "I'm here to help! To give you the most useful information, could you tell me more about:\n\n• What type of project you're considering?\n• Your timeline and budget considerations?\n• Specific technical requirements?\n• Any particular challenges you're facing?\n\nThe more details you share, the better I can assist you!"
      ]
    }

    const intentResponses = responses[intent] || responses.default
    const selectedResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)]

    // Add entity-specific customizations
    let customizedResponse = selectedResponse
    if (entities?.service) {
      customizedResponse = `I see you're interested in ${entities.service}! ${customizedResponse}`
    }
    if (entities?.budget) {
      customizedResponse += `\n\nWith a budget around ${entities.budget}, I can suggest some great options that would fit your needs.`
    }

    const responseTime = Date.now() - startTime

    // Generate follow-up questions based on intent
    const followUpQuestions: Partial<Record<ChatbotIntent, string[]>> = {
      greeting: ["What type of project are you considering?", "How can I help you today?"],
      services: ["What's your target timeline?", "Do you have a preferred technology stack?", "What's your budget range?"],
      pricing: ["What features are most important to you?", "When would you like to start?", "Do you need ongoing maintenance?"],
      contact: ["What's the best way to reach you?", "When would be a good time for a consultation?"],
      portfolio: ["What industry are you in?", "What size is your target audience?", "Any specific features in mind?"],
      process: ["What's your project timeline?", "Do you have existing systems to integrate with?"],
      support: ["What specific area do you need help with?", "Would you like to speak with our technical team?"],
      technical: ["What technologies are you currently using?", "Do you have any specific requirements?"],
      business: ["What are your main business goals?", "What challenges are you trying to solve?"],
      default: ["What type of project interests you?", "What's your timeline?", "Tell me about your business goals"]
    }

    // Generate suggested actions
    const suggestedActions = [
      { label: "View Our Services", action: "navigate", url: "/services" },
      { label: "See Portfolio", action: "navigate", url: "/portfolio" },
      { label: "Get Quote", action: "navigate", url: "/contact" },
      { label: "Learn About Process", action: "chat", url: "#" }
    ]

    return {
      content: customizedResponse,
      intent,
      confidence: 0.85,
      responseTime,
      followUpQuestions: followUpQuestions[intent]?.slice(0, 2),
      suggestedActions: suggestedActions.slice(0, 2)
    }
  }

  /**
   * Save chat session to backend
   */
  async saveChatSession(sessionId: string, messages: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          messages,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to save chat session:', error)
      return false
    }
  }

  /**
   * Load previous chat sessions
   */
  async loadChatSessions(userId?: string): Promise<any[]> {
    try {
      const url = userId 
        ? `${this.baseUrl}/chat/sessions?userId=${userId}`
        : `${this.baseUrl}/chat/sessions`
      
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    }
    return []
  }

  /**
   * Send feedback about chatbot response
   */
  async sendFeedback(messageId: string, rating: number, comment?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          rating,
          comment,
          timestamp: new Date().toISOString()
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send feedback:', error)
      return false
    }
  }
}