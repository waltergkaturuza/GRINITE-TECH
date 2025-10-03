// Service entity for managing digital solutions
export interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  features: string[] // Array of features
  icon?: string // Icon name or path
  status: 'active' | 'inactive' | 'draft'
  duration?: string // e.g., "6-8 weeks"
  currency?: string // USD, ZWL, etc.
  keyBenefits?: string[] // Array of key benefits
  targetMarket?: string[] // Array of target markets
  deliverables?: string[] // Array of deliverables
  setupFee?: number
  monthlyFee?: number
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

// DTO for creating/updating services
export interface CreateServiceDto {
  title: string
  description: string
  category: string
  price: number
  features: string[]
  icon?: string
  status?: 'active' | 'inactive' | 'draft'
  duration?: string
  currency?: string
  keyBenefits?: string[]
  targetMarket?: string[]
  deliverables?: string[]
  setupFee?: number
  monthlyFee?: number
  displayOrder?: number
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  id: string
}