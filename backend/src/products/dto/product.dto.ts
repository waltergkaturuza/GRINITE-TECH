import { ProductType, ProductStatus } from '../entities/product.entity';

export interface CreateProductDto {
  name: string;
  description?: string;
  type: ProductType;
  status: ProductStatus;
  price: number;
  recurringInterval?: string;
  category?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  type?: ProductType;
  status?: ProductStatus;
  price?: number;
  recurringInterval?: string;
  category?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProductFilterDto {
  status?: ProductStatus;
  type?: ProductType;
  category?: string;
  search?: string;
}