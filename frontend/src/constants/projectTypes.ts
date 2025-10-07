// Enhanced project types for software development
export const EXPANDED_PROJECT_TYPES = [
  // Web Development
  { value: 'website', label: '🌐 Website', category: 'Web Development', description: 'Static or dynamic websites' },
  { value: 'web_app', label: '💻 Web Application', category: 'Web Development', description: 'Interactive web applications' },
  { value: 'spa', label: '⚡ Single Page App (SPA)', category: 'Web Development', description: 'React, Vue, Angular applications' },
  { value: 'pwa', label: '📱 Progressive Web App', category: 'Web Development', description: 'Web apps with native-like features' },
  { value: 'ecommerce', label: '🛒 E-commerce Platform', category: 'Web Development', description: 'Online stores and marketplaces' },
  { value: 'cms', label: '📝 Content Management System', category: 'Web Development', description: 'Custom or headless CMS' },
  { value: 'blog', label: '📖 Blog/Portfolio', category: 'Web Development', description: 'Personal or business blogs' },
  { value: 'landing_page', label: '🎯 Landing Page', category: 'Web Development', description: 'Marketing and conversion pages' },

  // Mobile Development
  { value: 'mobile_app', label: '📱 Mobile App', category: 'Mobile Development', description: 'Native mobile applications' },
  { value: 'ios_app', label: '🍎 iOS App', category: 'Mobile Development', description: 'Native iOS applications' },
  { value: 'android_app', label: '🤖 Android App', category: 'Mobile Development', description: 'Native Android applications' },
  { value: 'react_native', label: '⚛️ React Native App', category: 'Mobile Development', description: 'Cross-platform React Native' },
  { value: 'flutter', label: '🦋 Flutter App', category: 'Mobile Development', description: 'Cross-platform Flutter app' },
  { value: 'hybrid_app', label: '🔄 Hybrid Mobile App', category: 'Mobile Development', description: 'Cordova, Ionic, etc.' },

  // Backend & APIs
  { value: 'api', label: '🔌 REST API', category: 'Backend Development', description: 'RESTful web services' },
  { value: 'graphql_api', label: '📊 GraphQL API', category: 'Backend Development', description: 'GraphQL services' },
  { value: 'microservices', label: '🧩 Microservices', category: 'Backend Development', description: 'Distributed microservice architecture' },
  { value: 'serverless', label: '☁️ Serverless Functions', category: 'Backend Development', description: 'AWS Lambda, Vercel Functions, etc.' },
  { value: 'websocket', label: '🔄 Real-time API', category: 'Backend Development', description: 'WebSocket, Socket.io applications' },
  { value: 'grpc', label: '⚡ gRPC Service', category: 'Backend Development', description: 'High-performance RPC services' },

  // Desktop Applications
  { value: 'desktop_app', label: '🖥️ Desktop Application', category: 'Desktop Development', description: 'Native desktop applications' },
  { value: 'electron_app', label: '⚡ Electron App', category: 'Desktop Development', description: 'Cross-platform Electron apps' },
  { value: 'windows_app', label: '🪟 Windows Application', category: 'Desktop Development', description: 'Windows-specific applications' },
  { value: 'macos_app', label: '🍎 macOS Application', category: 'Desktop Development', description: 'macOS-specific applications' },
  { value: 'linux_app', label: '🐧 Linux Application', category: 'Desktop Development', description: 'Linux-specific applications' },

  // Data & Analytics
  { value: 'data_pipeline', label: '📊 Data Pipeline', category: 'Data Engineering', description: 'ETL and data processing systems' },
  { value: 'dashboard', label: '📈 Analytics Dashboard', category: 'Data Analytics', description: 'Business intelligence dashboards' },
  { value: 'data_visualization', label: '📊 Data Visualization', category: 'Data Analytics', description: 'Interactive charts and graphs' },
  { value: 'ml_model', label: '🤖 Machine Learning Model', category: 'AI/ML', description: 'ML model development and deployment' },
  { value: 'ai_chatbot', label: '💬 AI Chatbot', category: 'AI/ML', description: 'Conversational AI systems' },
  { value: 'recommendation_system', label: '🎯 Recommendation Engine', category: 'AI/ML', description: 'Personalization systems' },

  // DevOps & Infrastructure
  { value: 'devops', label: '🔧 DevOps Setup', category: 'DevOps', description: 'CI/CD pipelines and infrastructure' },
  { value: 'cloud_migration', label: '☁️ Cloud Migration', category: 'DevOps', description: 'Moving systems to cloud platforms' },
  { value: 'monitoring', label: '📊 Monitoring System', category: 'DevOps', description: 'Application and infrastructure monitoring' },
  { value: 'automation', label: '🤖 Automation Scripts', category: 'DevOps', description: 'Build and deployment automation' },

  // Game Development
  { value: 'game', label: '🎮 Game Development', category: 'Game Development', description: 'Video games and interactive media' },
  { value: 'mobile_game', label: '📱 Mobile Game', category: 'Game Development', description: 'Mobile gaming applications' },
  { value: 'web_game', label: '🌐 Browser Game', category: 'Game Development', description: 'HTML5 and WebGL games' },

  // Blockchain & Web3
  { value: 'blockchain', label: '⛓️ Blockchain App', category: 'Blockchain', description: 'Decentralized applications' },
  { value: 'smart_contract', label: '📜 Smart Contracts', category: 'Blockchain', description: 'Ethereum, Solana contracts' },
  { value: 'nft_marketplace', label: '🖼️ NFT Marketplace', category: 'Blockchain', description: 'Non-fungible token platforms' },
  { value: 'defi', label: '💰 DeFi Application', category: 'Blockchain', description: 'Decentralized finance platforms' },

  // IoT & Hardware
  { value: 'iot', label: '🌐 IoT Application', category: 'IoT', description: 'Internet of Things systems' },
  { value: 'embedded', label: '🔧 Embedded Software', category: 'Hardware', description: 'Firmware and embedded systems' },
  { value: 'raspberry_pi', label: '🥧 Raspberry Pi Project', category: 'Hardware', description: 'Raspberry Pi applications' },

  // Testing & QA
  { value: 'testing', label: '🧪 Testing Framework', category: 'Testing', description: 'Automated testing solutions' },
  { value: 'qa_automation', label: '🤖 QA Automation', category: 'Testing', description: 'Quality assurance automation' },

  // Security
  { value: 'security_audit', label: '🔒 Security Audit', category: 'Security', description: 'Security assessments and penetration testing' },
  { value: 'auth_system', label: '🔐 Authentication System', category: 'Security', description: 'User authentication and authorization' },

  // Business & Consulting
  { value: 'consulting', label: '💼 Technical Consulting', category: 'Consulting', description: 'Technical advisory services' },
  { value: 'code_review', label: '👀 Code Review', category: 'Consulting', description: 'Code quality assessment' },
  { value: 'architecture_design', label: '🏗️ Architecture Design', category: 'Consulting', description: 'System architecture planning' },
  { value: 'maintenance', label: '🔧 Maintenance & Support', category: 'Maintenance', description: 'Ongoing system maintenance' },
  { value: 'migration', label: '📦 System Migration', category: 'Migration', description: 'Technology stack migrations' },
  { value: 'optimization', label: '⚡ Performance Optimization', category: 'Optimization', description: 'Speed and efficiency improvements' },

  // Training & Documentation
  { value: 'training', label: '📚 Technical Training', category: 'Education', description: 'Developer training and workshops' },
  { value: 'documentation', label: '📖 Technical Documentation', category: 'Documentation', description: 'API docs, user guides, etc.' },
  { value: 'tutorial', label: '🎓 Tutorial Creation', category: 'Education', description: 'Educational content development' }
]

// Group project types by category for better organization
export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile Development', 
  'Backend Development',
  'Desktop Development',
  'Data Engineering',
  'Data Analytics',
  'AI/ML',
  'DevOps',
  'Game Development',
  'Blockchain',
  'IoT',
  'Hardware',
  'Testing',
  'Security',
  'Consulting',
  'Maintenance',
  'Migration',
  'Optimization',
  'Education',
  'Documentation'
]

// Legacy simple project types (for backward compatibility)
export const PROJECT_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'api', label: 'API' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'maintenance', label: 'Maintenance' }
]