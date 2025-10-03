# GRANITE TECH System

A comprehensive business management platform featuring:
- Public-facing e-commerce website
- Client project portal
- Admin dashboard with monitoring
- AI-powered chatbot
- Automated reporting and analytics

## Architecture Overview

This system follows a modular microservices architecture with:

### Core Components
- **Frontend**: Next.js with TailwindCSS
- **Backend**: Node.js/NestJS API
- **Database**: PostgreSQL + Redis caching
- **AI/Chatbot**: Rasa + GPT integration
- **Monitoring**: Prometheus + Grafana
- **DevOps**: Docker + Kubernetes

### Project Structure
```
granite-tech-system/
├── backend/                 # NestJS API server
├── frontend/               # Next.js application
├── chatbot/               # Rasa chatbot service
├── monitoring/            # Prometheus & Grafana configs
├── infrastructure/        # Docker & K8s configs
├── database/             # Database schemas & migrations
├── docs/                 # Documentation
└── scripts/              # Deployment & utility scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Development Workflow

- Feature branches from `develop`
- Pull requests for code review
- Automated testing with CI/CD
- Staging environment for testing

## License

Proprietary - GRANITE TECH