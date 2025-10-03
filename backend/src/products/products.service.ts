import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(filters?: ProductFilterDto): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (filters?.status) {
      query.andWhere('product.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('product.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      query.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.orderBy('product.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    Object.assign(product, updateProductDto);
    
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getActiveProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' }
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'active' })
      .andWhere(
        '(product.name LIKE :query OR product.description LIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('product.name', 'ASC')
      .getMany();
  }
}