export type Lang = 'en' | 'fr' | 'zh' | 'sn' | 'pt' | 'ja' | 'ru' | 'el'

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
  pt: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Serviços',
    'nav.products': 'Produtos',
    'nav.portfolio': 'Portfólio',
    'nav.about': 'Sobre',
    'nav.contact': 'Contacto',
    'nav.trackRequest': 'Acompanhar pedido',
    'nav.getStarted': 'Começar',
    'nav.search': 'Pesquisar',
    'home.hero.title.part1': 'Engenharia de infraestrutura digital para',
    'home.hero.title.part2': 'um futuro mais inteligente.',
    'home.hero.subtitle':
      'A Quantis Technologies é uma empresa de engenharia de sistemas que fornece plataformas empresariais, soluções de automação, inteligência de dados e infraestrutura cloud segura para governos e organizações inovadoras.',
    'home.hero.primaryCta': 'Construir com a Quantis',
    'home.hero.secondaryCta': 'Explorar as nossas soluções',
    'home.pillars.heading': 'Capacidades principais',
    'home.pillars.subheading':
      'Sistemas integrados concebidos para escala, segurança e desempenho.',
    'home.pillars.enterprise': 'Engenharia de sistemas empresariais',
    'home.pillars.enterprise.desc':
      'Plataformas, portais e sistemas críticos personalizados para escalabilidade, desempenho e segurança.',
    'home.pillars.cloud': 'Infraestrutura cloud e DevOps',
    'home.pillars.cloud.desc':
      'Migração para a cloud, pipelines CI/CD, infraestrutura como código e alojamento gerido.',
    'home.pillars.data': 'Inteligência de dados e análise',
    'home.pillars.data.desc':
      'Dashboards executivos, acompanhamento de KPIs, data warehousing e análises em tempo real.',
    'home.pillars.automation': 'Automação e integração de processos',
    'home.pillars.automation.desc':
      'Automação de fluxos de trabalho, integrações ERP, APIs e sistemas inteligentes que otimizam operações.',
    'home.pillars.security': 'Cibersegurança e conformidade',
    'home.pillars.security.desc':
      'Auditorias de segurança, testes de penetração, encriptação de dados, gestão de identidades e consultoria de conformidade.',
    'home.pillars.platforms': 'Desenvolvimento de plataformas digitais',
    'home.pillars.platforms.desc':
      'Ecossistemas digitais completos incluindo e‑commerce, plataformas SaaS, portais de serviços e ferramentas empresariais.',
    'home.cta.heading': 'Pronto para transformar o seu negócio?',
    'home.cta.text':
      'Junte‑se aos muitos clientes satisfeitos que confiam na Quantis Technologies',
    'home.cta.button': 'Começar hoje',
    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Soluções empresariais completas para o mundo moderno.',
    'footer.services': 'Serviços',
    'footer.products': 'Produtos',
    'footer.contact': 'Contacto',
    'footer.services.web': 'Desenvolvimento web',
    'footer.services.mobile': 'Aplicações móveis',
    'footer.services.digital': 'Produtos digitais',
    'footer.services.automation': 'Automação',
    'footer.products.templates': 'Modelos',
    'footer.products.tools': 'Ferramentas',
    'footer.products.apis': 'APIs',
    'footer.products.plugins': 'Plugins',
    'footer.copyright': 'Todos os direitos reservados.',
    'footer.adminLogin': 'Login de administrador / equipa',
  },
  ja: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'サービス',
    'nav.products': 'プロダクト',
    'nav.portfolio': 'ポートフォリオ',
    'nav.about': '会社概要',
    'nav.contact': 'お問い合わせ',
    'nav.trackRequest': 'リクエスト追跡',
    'nav.getStarted': 'はじめる',
    'nav.search': '検索',
    'home.hero.title.part1': 'デジタルインフラを設計し、',
    'home.hero.title.part2': 'スマートな未来をつくる。',
    'home.hero.subtitle':
      'Quantis Technologies は、政府機関や先進的な組織向けに、エンタープライズ向けプラットフォーム、業務自動化、データインテリジェンス、安全なクラウドインフラを提供するシステムエンジニアリング企業です。',
    'home.hero.primaryCta': 'Quantis と開発する',
    'home.hero.secondaryCta': 'ソリューションを見る',
    'home.pillars.heading': 'コアケイパビリティ',
    'home.pillars.subheading':
      'スケーラビリティ・セキュリティ・パフォーマンスを前提に設計された統合システム。',
    'home.pillars.enterprise': 'エンタープライズシステム開発',
    'home.pillars.enterprise.desc':
      '重要業務向けの高信頼・高可用なプラットフォームやポータルをフルスクラッチで構築。',
    'home.pillars.cloud': 'クラウドインフラ & DevOps',
    'home.pillars.cloud.desc':
      'クラウド移行、CI/CD パイプライン、IaC、エンタープライズ向けマネージドホスティング。',
    'home.pillars.data': 'データインテリジェンス & 分析',
    'home.pillars.data.desc':
      '経営ダッシュボード、KPI 可視化、データウェアハウス、リアルタイム分析。',
    'home.pillars.automation': '業務自動化 & 連携',
    'home.pillars.automation.desc':
      'ワークフロー自動化、ERP 連携、API 開発により、業務効率と品質を向上。',
    'home.pillars.security': 'セキュリティ & コンプライアンス',
    'home.pillars.security.desc':
      'セキュリティ診断、ペネトレーションテスト、暗号化、ID 管理、コンプライアンス支援。',
    'home.pillars.platforms': 'デジタルプラットフォーム開発',
    'home.pillars.platforms.desc':
      'EC、SaaS、サービスポータル、業務ツールなど、エンドツーエンドのデジタル基盤を構築。',
    'home.cta.heading': 'ビジネス変革の準備はできていますか？',
    'home.cta.text':
      'Quantis Technologies を信頼する多くのクライアントに続きましょう。',
    'home.cta.button': '今すぐ相談する',
    'footer.title': 'Quantis Technologies',
    'footer.tagline': '現代ビジネスのための包括的なデジタルソリューション。',
    'footer.services': 'サービス',
    'footer.products': 'プロダクト',
    'footer.contact': 'お問い合わせ',
    'footer.services.web': 'Web 開発',
    'footer.services.mobile': 'モバイルアプリ',
    'footer.services.digital': 'デジタルプロダクト',
    'footer.services.automation': '自動化',
    'footer.products.templates': 'テンプレート',
    'footer.products.tools': 'ツール',
    'footer.products.apis': 'API',
    'footer.products.plugins': 'プラグイン',
    'footer.copyright': '無断転載を禁じます。',
    'footer.adminLogin': '管理者 / スタッフログイン',
  },
  ru: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Сервисы',
    'nav.products': 'Продукты',
    'nav.portfolio': 'Портфолио',
    'nav.about': 'О компании',
    'nav.contact': 'Контакты',
    'nav.trackRequest': 'Отслеживать запрос',
    'nav.getStarted': 'Начать',
    'nav.search': 'Поиск',
    'home.hero.title.part1': 'Проектируем цифровую инфраструктуру для',
    'home.hero.title.part2': 'более умного будущего.',
    'home.hero.subtitle':
      'Quantis Technologies — компания в области системной инженерии, создающая корпоративные платформы, решения для автоматизации, аналитику данных и защищённую облачную инфраструктуру для государств и развивающихся организаций.',
    'home.hero.primaryCta': 'Создать проект с Quantis',
    'home.hero.secondaryCta': 'Посмотреть решения',
    'home.pillars.heading': 'Ключевые компетенции',
    'home.pillars.subheading':
      'Интегрированные системы, спроектированные для масштаба, безопасности и высокой производительности.',
    'home.pillars.enterprise': 'Инженерия корпоративных систем',
    'home.pillars.enterprise.desc':
      'Пользовательские платформы, порталы и критически важные системы с акцентом на масштабируемость и надёжность.',
    'home.pillars.cloud': 'Облачная инфраструктура и DevOps',
    'home.pillars.cloud.desc':
      'Миграция в облако, CI/CD, инфраструктура как код и управляемый хостинг.',
    'home.pillars.data': 'Интеллектуальный анализ данных',
    'home.pillars.data.desc':
      'Дашборды для руководителей, мониторинг KPI, хранилища данных и аналitika в реальном времени.',
    'home.pillars.automation': 'Автоматизация и интеграция процессов',
    'home.pillars.automation.desc':
      'Автоматизация рабочих процессов, интеграция ERP, разработка API и интеллектуальные системы.',
    'home.pillars.security': 'Кибербезопасность и соответствие',
    'home.pillars.security.desc':
      'Аудиты безопасности, тесты на проникновение, шифрование данных, управление идентичностями и консалтинг по соответствию.',
    'home.pillars.platforms': 'Разработка цифровых платформ',
    'home.pillars.platforms.desc':
      'Комплексные цифровые экосистемы: e‑commerce, SaaS‑платформы, сервисные порталы и корпоративные инструменты.',
    'home.cta.heading': 'Готовы трансформировать ваш бизнес?',
    'home.cta.text':
      'Присоединяйтесь к клиентам, которые доверяют Quantis Technologies',
    'home.cta.button': 'Начать сейчас',
    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Комплексные решения для современного бизнеса.',
    'footer.services': 'Сервисы',
    'footer.products': 'Продукты',
    'footer.contact': 'Контакты',
    'footer.services.web': 'Веб‑разработка',
    'footer.services.mobile': 'Мобильные приложения',
    'footer.services.digital': 'Цифровые продукты',
    'footer.services.automation': 'Автоматизация',
    'footer.products.templates': 'Шаблоны',
    'footer.products.tools': 'Инструменты',
    'footer.products.apis': 'API',
    'footer.products.plugins': 'Плагины',
    'footer.copyright': 'Все права защищены.',
    'footer.adminLogin': 'Вход для администраторов / персонала',
  },
  el: {
    'nav.brand': 'Quantis Technologies',
    'nav.services': 'Υπηρεσίες',
    'nav.products': 'Προϊόντα',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'Σχετικά',
    'nav.contact': 'Επικοινωνία',
    'nav.trackRequest': 'Παρακολούθηση αιτήματος',
    'nav.getStarted': 'Ξεκινήστε',
    'nav.search': 'Αναζήτηση',
    'home.hero.title.part1': 'Σχεδιάζουμε ψηφιακές υποδομές για',
    'home.hero.title.part2': 'ένα πιο έξυπνο μέλλον.',
    'home.hero.subtitle':
      'Η Quantis Technologies είναι εταιρεία μηχανικών συστημάτων που παρέχει εταιρικές πλατφόρμες, λύσεις αυτοματοποίησης, ανάλυση δεδομένων και ασφαλή cloud υποδομή για κυβερνήσεις και οργανισμούς.',
    'home.hero.primaryCta': 'Χτίστε με την Quantis',
    'home.hero.secondaryCta': 'Δείτε τις λύσεις μας',
    'home.pillars.heading': 'Βασικές δυνατότητες',
    'home.pillars.subheading':
      'Ολοκληρωμένα συστήματα σχεδιασμένα για κλίμακα, ασφάλεια και απόδοση.',
    'home.pillars.enterprise': 'Μηχανική εταιρικών συστημάτων',
    'home.pillars.enterprise.desc':
      'Προσαρμοσμένες πλατφόρμες, portals και κρίσιμα συστήματα με έμφαση στην ασφάλεια και την επεκτασιμότητα.',
    'home.pillars.cloud': 'Cloud υποδομή & DevOps',
    'home.pillars.cloud.desc':
      'Μεταφορά στο cloud, CI/CD pipelines, infrastructure as code και διαχειριζόμενη φιλοξενία.',
    'home.pillars.data': 'Data Intelligence & Analytics',
    'home.pillars.data.desc':
      'Dashboards διοίκησης, παρακολούθηση KPIs, data warehousing και ανάλυση σε πραγματικό χρόνο.',
    'home.pillars.automation': 'Αυτοματοποίηση & ενοποίηση διαδικασιών',
    'home.pillars.automation.desc':
      'Αυτοματοποίηση ροών εργασίας, ERP integrations, APIs και «έξυπνα» συστήματα.',
    'home.pillars.security': 'Ασφάλεια & Συμμόρφωση',
    'home.pillars.security.desc':
      'Έλεγχοι ασφάλειας, penetration testing, κρυπτογράφηση δεδομένων και συμβουλευτική συμμόρφωσης.',
    'home.pillars.platforms': 'Ανάπτυξη ψηφιακών πλατφορμών',
    'home.pillars.platforms.desc':
      'Ολοκληρωμένα ψηφιακά οικοσυστήματα: e‑commerce, SaaS, portals υπηρεσιών και εργαλεία επιχείρησης.',
    'home.cta.heading': 'Έτοιμοι να μετασχηματίσετε την επιχείρησή σας;',
    'home.cta.text':
      'Γίνετε μέλος των πελατών που εμπιστεύονται την Quantis Technologies',
    'home.cta.button': 'Ξεκινήστε σήμερα',
    'footer.title': 'Quantis Technologies',
    'footer.tagline': 'Ολοκληρωμένες λύσεις για τον σύγχρονο επιχειρηματικό κόσμο.',
    'footer.services': 'Υπηρεσίες',
    'footer.products': 'Προϊόντα',
    'footer.contact': 'Επικοινωνία',
    'footer.services.web': 'Web Development',
    'footer.services.mobile': 'Mobile Apps',
    'footer.services.digital': 'Digital Products',
    'footer.services.automation': 'Automation',
    'footer.products.templates': 'Templates',
    'footer.products.tools': 'Tools',
    'footer.products.apis': 'APIs',
    'footer.products.plugins': 'Plugins',
    'footer.copyright': 'Με επιφύλαξη παντός δικαιώματος.',
    'footer.adminLogin': 'Είσοδος διαχειριστή / προσωπικού',
  },
}

export function t(lang: Lang, key: string): string {
  return messages[lang]?.[key] ?? messages.en[key] ?? key
}

