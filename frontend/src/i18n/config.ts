export type Lang = 'en' | 'fr' | 'zh' | 'sn'

export const messages: Record<Lang, Record<string, string>> = {
  en: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.trackRequest': 'Track Request',
    'nav.getStarted': 'Get Started',
    'nav.search': 'Search',

    'home.hero.title.part1': 'Engineering Digital Infrastructure for',
    'home.hero.title.part2': 'a Smarter Future.',
    'home.hero.subtitle':
      'Quantis Technologies is a systems engineering company delivering enterprise platforms, automation solutions, data intelligence, and secure cloud infrastructure for governments and forward-thinking organizations.',
    'home.hero.primaryCta': 'Build With Quantis',
    'home.hero.secondaryCta': 'Explore Our Solutions',

    'home.pillars.heading': 'Core Capabilities',
    'home.pillars.subheading': 'Integrated systems designed for scale, security, and performance.',
    'home.pillars.enterprise': 'Enterprise Systems Engineering',
    'home.pillars.enterprise.desc':
      'Custom-built platforms, portals, and mission-critical systems engineered for scalability, performance, and security.',
    'home.pillars.cloud': 'Cloud Infrastructure & DevOps',
    'home.pillars.cloud.desc':
      'Cloud migration, CI/CD pipelines, infrastructure as code, and managed hosting for enterprise workloads.',
    'home.pillars.data': 'Data Intelligence & Analytics',
    'home.pillars.data.desc':
      'Executive dashboards, KPI tracking, data warehousing, and real-time analytics for informed decision-making.',
    'home.pillars.automation': 'Process Automation & Integration',
    'home.pillars.automation.desc':
      'Workflow automation, ERP integrations, API development, and intelligent systems that streamline operations and eliminate inefficiencies.',
    'home.pillars.security': 'Cybersecurity & Compliance',
    'home.pillars.security.desc':
      'Security audits, penetration testing, data encryption, identity management, and compliance advisory (GDPR, POPIA).',
    'home.pillars.platforms': 'Digital Platform Development',
    'home.pillars.platforms.desc':
      'End-to-end digital ecosystems including e-commerce, SaaS platforms, service portals, and enterprise tools.',

    'home.cta.heading': 'Ready to Transform Your Business?',
    'home.cta.text': 'Join hundreds of satisfied clients who trust Quantis Technologies',
    'home.cta.button': 'Get Started Today',

    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Comprehensive business solutions for the modern world.',
    'footer.services': 'Services',
    'footer.products': 'Products',
    'footer.contact': 'Contact',
    'footer.services.web': 'Web Development',
    'footer.services.mobile': 'Mobile Apps',
    'footer.services.digital': 'Digital Products',
    'footer.services.automation': 'Automation',
    'footer.products.templates': 'Templates',
    'footer.products.tools': 'Tools',
    'footer.products.apis': 'APIs',
    'footer.products.plugins': 'Plugins',
    'footer.copyright': 'All rights reserved.',
    'footer.adminLogin': 'Admin / Staff Login',
  },
  fr: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Services',
    'nav.products': 'Produits',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.trackRequest': 'Suivre la demande',
    'nav.getStarted': 'Commencer',
    'nav.search': 'Rechercher',

    'home.hero.title.part1': "Ingénierie de l'infrastructure numérique pour",
    'home.hero.title.part2': 'un avenir plus intelligent.',
    'home.hero.subtitle':
      "Quantis Technologies est une société d’ingénierie de systèmes qui fournit des plateformes d’entreprise, des solutions d’automatisation, de l’intelligence décisionnelle et une infrastructure cloud sécurisée pour les gouvernements et les organisations innovantes.",
    'home.hero.primaryCta': 'Construire avec Quantis',
    'home.hero.secondaryCta': 'Explorer nos solutions',

    'home.pillars.heading': 'Compétences clés',
    'home.pillars.subheading':
      'Des systèmes intégrés conçus pour l’échelle, la sécurité et la performance.',
    'home.pillars.enterprise': "Ingénierie des systèmes d'entreprise",
    'home.pillars.enterprise.desc':
      "Plateformes, portails et systèmes critiques développés sur mesure pour la performance, l’évolutivité et la sécurité.",
    'home.pillars.cloud': 'Infrastructure cloud et DevOps',
    'home.pillars.cloud.desc':
      'Migration vers le cloud, pipelines CI/CD, infrastructure as code et hébergement géré.',
    'home.pillars.data': 'Intelligence des données et analytique',
    'home.pillars.data.desc':
      'Tableaux de bord exécutifs, suivi des indicateurs, entrepôts de données et analytique temps réel.',
    'home.pillars.automation': 'Automatisation et intégration des processus',
    'home.pillars.automation.desc':
      'Automatisation des flux de travail, intégrations ERP, APIs et systèmes intelligents qui optimisent les opérations.',
    'home.pillars.security': 'Cybersécurité et conformité',
    'home.pillars.security.desc':
      'Audits de sécurité, tests de pénétration, chiffrement des données, gestion des identités et conseil conformité (RGPD, etc.).',
    'home.pillars.platforms': 'Développement de plateformes numériques',
    'home.pillars.platforms.desc':
      'Écosystèmes numériques complets : e‑commerce, plateformes SaaS, portails de services et outils d’entreprise.',

    'home.cta.heading': 'Prêt à transformer votre entreprise ?',
    'home.cta.text':
      'Rejoignez les nombreux clients satisfaits qui font confiance à Quantis Technologies',
    'home.cta.button': "Commencer dès aujourd'hui",

    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Des solutions complètes pour les entreprises modernes.',
    'footer.services': 'Services',
    'footer.products': 'Produits',
    'footer.contact': 'Contact',
    'footer.services.web': 'Développement web',
    'footer.services.mobile': 'Applications mobiles',
    'footer.services.digital': 'Produits numériques',
    'footer.services.automation': 'Automatisation',
    'footer.products.templates': 'Modèles',
    'footer.products.tools': 'Outils',
    'footer.products.apis': 'APIs',
    'footer.products.plugins': 'Extensions',
    'footer.copyright': 'Tous droits réservés.',
    'footer.adminLogin': 'Connexion administrateur / équipe',
  },
  zh: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': '服务',
    'nav.products': '产品',
    'nav.portfolio': '案例',
    'nav.about': '关于我们',
    'nav.contact': '联系',
    'nav.trackRequest': '跟踪请求',
    'nav.getStarted': '开始合作',
    'nav.search': '搜索',

    'home.hero.title.part1': '为数字基础设施提供工程支持，',
    'home.hero.title.part2': '构建更智能的未来。',
    'home.hero.subtitle':
      'Quantis Technologies 专注于系统工程，提供企业级平台、流程自动化、数据智能以及安全的云基础设施，服务于政府和高成长型组织。',
    'home.hero.primaryCta': '与 Quantis 合作',
    'home.hero.secondaryCta': '查看我们的解决方案',

    'home.pillars.heading': '核心能力',
    'home.pillars.subheading': '面向规模、安全与性能而设计的一体化系统。',
    'home.pillars.enterprise': '企业系统工程',
    'home.pillars.enterprise.desc':
      '为关键业务打造可扩展、高性能且安全的定制平台与门户。',
    'home.pillars.cloud': '云基础设施与 DevOps',
    'home.pillars.cloud.desc':
      '云迁移、CI/CD 流水线、基础设施即代码以及企业级托管服务。',
    'home.pillars.data': '数据智能与分析',
    'home.pillars.data.desc':
      '高管仪表盘、关键指标跟踪、数据仓库以及实时分析，助力科学决策。',
    'home.pillars.automation': '流程自动化与集成',
    'home.pillars.automation.desc':
      '工作流自动化、ERP 集成、API 开发以及提升运营效率的智能系统。',
    'home.pillars.security': '网络安全与合规',
    'home.pillars.security.desc':
      '安全评估、渗透测试、数据加密、身份管理以及合规咨询。',
    'home.pillars.platforms': '数字平台开发',
    'home.pillars.platforms.desc':
      '端到端数字生态，包括电商、SaaS 平台、服务门户和企业工具。',

    'home.cta.heading': '准备好推动业务变革了吗？',
    'home.cta.text': '加入众多信任 Quantis Technologies 的客户行列',
    'home.cta.button': '立即开始',

    'footer.title': 'Quantis Technologies',
    'footer.tagline': '为现代企业提供全面的数字解决方案。',
    'footer.services': '服务',
    'footer.products': '产品',
    'footer.contact': '联系',
    'footer.services.web': '网站开发',
    'footer.services.mobile': '移动应用',
    'footer.services.digital': '数字产品',
    'footer.services.automation': '自动化',
    'footer.products.templates': '模板',
    'footer.products.tools': '工具',
    'footer.products.apis': 'API',
    'footer.products.plugins': '插件',
    'footer.copyright': '版权所有。',
    'footer.adminLogin': '管理员 / 员工登录',
  },
  sn: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Mabasa',
    'nav.products': 'Zvigadzirwa',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'Nezvedu',
    'nav.contact': 'Taura nesu',
    'nav.trackRequest': 'Tevedza chikumbiro',
    'nav.getStarted': 'Tanga nesu',
    'nav.search': 'Tsvaga',

    'home.hero.title.part1': 'Kuvaka zvivakwa zvedhijitari',
    'home.hero.title.part2': 'zveramangwana rakangwara.',
    'home.hero.subtitle':
      'Quantis Technologies ikambani yesystem engineering inogadzira mapuratifomu emakambani, maworkflow ekuzvionera, ongororo yedata uye zvivakwa zvecloud zvakachengeteka zvehurumende nemasangano ari kufambira mberi.',
    'home.hero.primaryCta': 'Vaka ne Quantis',
    'home.hero.secondaryCta': 'Ona mhinduro dzedu',

    'home.pillars.heading': 'Masopeji Edu Makuru',
    'home.pillars.subheading':
      'Masisitimu akabatana akagadzirirwa kuyerera, kuchengeteka uye kuita zvine mutsindo.',
    'home.pillars.enterprise': 'Enterprise Systems Engineering',
    'home.pillars.enterprise.desc':
      'Mapuratifomu nemaportal akavakwa zvinoenderana nezvinodiwa, ane chiyero, kuita kwakanaka uye kuchengeteka.',
    'home.pillars.cloud': 'Cloud Infrastructure & DevOps',
    'home.pillars.cloud.desc':
      'Kutamisa masisitimu kucloud, CI/CD, infrastructure-as-code uye hosting inotungamirirwa.',
    'home.pillars.data': 'Data Intelligence & Analytics',
    'home.pillars.data.desc':
      'Madheshibhodhi evatungamiri, KPIs, data warehousing uye analytics chaiyo-nguva yekutora zvisarudzo.',
    'home.pillars.automation': 'Process Automation & Integration',
    'home.pillars.automation.desc':
      'Automation yemaworkflow, kubatanidza maERP, kugadzira maAPI uye masisitimu anoderedza kushanda nesimba.',
    'home.pillars.security': 'Cybersecurity & Compliance',
    'home.pillars.security.desc':
      'Security audits, penetration testing, encryption yedata, identity management uye kubatsirwa panyaya dzekutevedzera mitemo.',
    'home.pillars.platforms': 'Digital Platform Development',
    'home.pillars.platforms.desc':
      'Masisitimu akazara e‑digital: e‑commerce, mapuratifomu eSaaS, maportal ebasa uye maturusi emakambani.',

    'home.cta.heading': 'Wagadzirira kushandura bhizinesi rako here?',
    'home.cta.text':
      'Batana nemazana evatengi vanovimba ne Quantis Technologies',
    'home.cta.button': 'Tanga Nhasi',

    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Mhinduro dzakazara dzebhizinesi renyika yemazuva ano.',
    'footer.services': 'Mabasa',
    'footer.products': 'Zvigadzirwa',
    'footer.contact': 'Taura nesu',
    'footer.services.web': 'Web Development',
    'footer.services.mobile': 'Mobile Apps',
    'footer.services.digital': 'Digital Products',
    'footer.services.automation': 'Automation',
    'footer.products.templates': 'Templates',
    'footer.products.tools': 'Tools',
    'footer.products.apis': 'APIs',
    'footer.products.plugins': 'Plugins',
    'footer.copyright': 'Kodzero dzese dzakachengetedzwa.',
    'footer.adminLogin': 'Admin / Staff Login',
  },
}

export function t(lang: Lang, key: string): string {
  return messages[lang]?.[key] ?? messages.en[key] ?? key
}

