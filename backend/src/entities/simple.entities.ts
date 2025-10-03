// Simplified entities without complex relationships for immediate server startup

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  status: string;
  category?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderDto {
  id: number;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address?: string;
  billing_address?: string;
  items: OrderItemDto[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemDto {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  product_name: string;
}

export interface ProjectDto {
  id: number;
  name: string;
  description: string;
  client_id: string;
  assigned_to?: string;
  status: string;
  due_date?: Date;
  progress_percentage: number;
  budget?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_estimate: string;
  features: string[];
  created_at: Date;
  updated_at: Date;
}

export interface UserProjectDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  role: 'admin' | 'client' | 'developer';
  status: 'active' | 'inactive' | 'suspended';
  projects?: ProjectDto[];
  created_at: Date;
  updated_at: Date;
}