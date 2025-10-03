import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// Simple product interface
interface SimpleProduct {
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

// Mock data for development
const mockProducts: SimpleProduct[] = [
  {
    id: 1,
    name: 'Starter Website Package',
    description: 'Professional website with modern design, responsive layout, and basic SEO optimization.',
    price: 1999,
    status: 'active',
    category: 'web-development',
    image_url: 'https://via.placeholder.com/400x300?text=Website+Package',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'E-commerce Solution',
    description: 'Complete online store with payment processing, inventory management, and customer accounts.',
    price: 4999,
    status: 'active',
    category: 'e-commerce',
    image_url: 'https://via.placeholder.com/400x300?text=E-commerce+Solution',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 3,
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android with modern UI/UX design.',
    price: 7999,
    status: 'active',
    category: 'mobile-development',
    image_url: 'https://via.placeholder.com/400x300?text=Mobile+App',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 4,
    name: 'API Development Package',
    description: 'RESTful API development with authentication, documentation, and database integration.',
    price: 2999,
    status: 'active',
    category: 'backend-development',
    image_url: 'https://via.placeholder.com/400x300?text=API+Development',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 5,
    name: 'Cloud Infrastructure Setup',
    description: 'Complete cloud deployment with monitoring, backup, and security configuration.',
    price: 3499,
    status: 'active',
    category: 'devops',
    image_url: 'https://via.placeholder.com/400x300?text=Cloud+Infrastructure',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 6,
    name: 'Analytics Dashboard',
    description: 'Business intelligence dashboard with real-time data visualization and reporting.',
    price: 3999,
    status: 'active',
    category: 'data-analytics',
    image_url: 'https://via.placeholder.com/400x300?text=Analytics+Dashboard',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

@Controller('api/products')
export class SimpleProductsController {
  
  @Get()
  async findAll(): Promise<SimpleProduct[]> {
    try {
      return mockProducts.filter(product => product.status === 'active');
    } catch (error) {
      throw new HttpException('Failed to retrieve products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SimpleProduct> {
    try {
      const productId = parseInt(id, 10);
      const product = mockProducts.find(p => p.id === productId && p.status === 'active');
      
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() productData: Partial<SimpleProduct>): Promise<SimpleProduct> {
    try {
      const newProduct: SimpleProduct = {
        id: mockProducts.length + 1,
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        status: 'active',
        category: productData.category,
        image_url: productData.image_url,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      mockProducts.push(newProduct);
      return newProduct;
    } catch (error) {
      throw new HttpException('Failed to create product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<SimpleProduct>): Promise<SimpleProduct> {
    try {
      const productId = parseInt(id, 10);
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      const updatedProduct = {
        ...mockProducts[productIndex],
        ...updateData,
        updated_at: new Date()
      };
      
      mockProducts[productIndex] = updatedProduct;
      return updatedProduct;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const productId = parseInt(id, 10);
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      // Soft delete by changing status
      mockProducts[productIndex].status = 'deleted';
      mockProducts[productIndex].updated_at = new Date();
      
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('category/:category')
  async getByCategory(@Param('category') category: string): Promise<SimpleProduct[]> {
    try {
      return mockProducts.filter(product => 
        product.category === category && product.status === 'active'
      );
    } catch (error) {
      throw new HttpException('Failed to retrieve products by category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}