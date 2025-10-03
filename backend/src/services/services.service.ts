import { Injectable } from '@nestjs/common'
import { Service, CreateServiceDto, UpdateServiceDto } from './entities/service.entity'

@Injectable()
export class ServicesService {
  private services: Service[] = [
    {
      id: '1',
      title: 'Systems Digitalization',
      description: 'Transform manual processes into efficient digital workflows',
      category: 'Digital Transformation',
      price: 3500,
      features: [
        'Process Analysis & Mapping',
        'Digital Workflow Design',
        'System Integration',
        'Staff Training',
        'Documentation & Support'
      ],
      icon: 'ComputerDesktopIcon',
      status: 'active',
      duration: '4-6 weeks',
      currency: 'USD',
      keyBenefits: [
        'Increased Efficiency',
        'Reduced Manual Errors',
        'Better Data Management',
        'Cost Savings'
      ],
      targetMarket: ['SMEs', 'Government Offices', 'NGOs'],
      deliverables: [
        'Digital Process Documentation',
        'Custom Software Solution',
        'Training Materials',
        '3 Months Support'
      ],
      setupFee: 3500,
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'ERP Systems',
      description: 'Enterprise Resource Planning systems for SMEs, schools, SMBs, and hospitals',
      category: 'Enterprise Solutions',
      price: 8000,
      features: [
        'Integrated ERP',
        'Accounting Integration',
        'HR Management',
        'Procurement System',
        'Inventory Management'
      ],
      icon: 'BuildingOfficeIcon',
      status: 'active',
      duration: '8-12 weeks',
      currency: 'USD',
      keyBenefits: [
        'Centralized Operations',
        'Real-time Reporting',
        'Compliance Management',
        'Scalable Solution'
      ],
      targetMarket: ['Schools', 'NGOs', 'Hospitals', 'Retail Businesses'],
      deliverables: [
        'Complete ERP System',
        'Data Migration',
        'User Training',
        '6 Months Support'
      ],
      setupFee: 8000,
      monthlyFee: 200,
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    // Add more default services here...
  ]

  async findAll(category?: string, status?: string): Promise<Service[]> {
    let filteredServices = [...this.services]

    if (category) {
      filteredServices = filteredServices.filter(service => 
        service.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (status) {
      filteredServices = filteredServices.filter(service => service.status === status)
    }

    return filteredServices.sort((a, b) => a.displayOrder - b.displayOrder)
  }

  async getCategories(): Promise<string[]> {
    const categorySet = new Set(this.services.map(service => service.category))
    const categories = Array.from(categorySet)
    return categories.sort()
  }

  async findById(id: string): Promise<Service | null> {
    return this.services.find(service => service.id === id) || null
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const newService: Service = {
      id: `service_${Date.now()}`,
      ...createServiceDto,
      status: createServiceDto.status || 'active',
      displayOrder: createServiceDto.displayOrder || this.services.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.services.push(newService)
    return newService
  }

  async update(id: string, updateServiceDto: Omit<UpdateServiceDto, 'id'>): Promise<Service> {
    const serviceIndex = this.services.findIndex(service => service.id === id)
    if (serviceIndex === -1) {
      throw new Error('Service not found')
    }

    const updatedService = {
      ...this.services[serviceIndex],
      ...updateServiceDto,
      updatedAt: new Date()
    }

    this.services[serviceIndex] = updatedService
    return updatedService
  }

  async delete(id: string): Promise<void> {
    const serviceIndex = this.services.findIndex(service => service.id === id)
    if (serviceIndex === -1) {
      throw new Error('Service not found')
    }

    this.services.splice(serviceIndex, 1)
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'draft'): Promise<Service> {
    return this.update(id, { status })
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<Service> {
    return this.update(id, { displayOrder })
  }
}