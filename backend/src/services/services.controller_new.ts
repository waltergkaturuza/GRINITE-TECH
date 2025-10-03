import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './entities/service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getAllServices(@Query('category') category?: string, @Query('status') status?: string) {
    try {
      const services = await this.servicesService.findAll(category, status);
      return {
        success: true,
        data: services,
        message: 'Services retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to retrieve services'
      };
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      const categories = await this.servicesService.getCategories();
      return {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to retrieve categories'
      };
    }
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Service ID is required'
        };
      }

      const service = await this.servicesService.findById(id);
      if (!service) {
        return {
          success: false,
          message: 'Service not found'
        };
      }

      return {
        success: true,
        data: service,
        message: 'Service retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to retrieve service'
      };
    }
  }

  @Post()
  async createService(@Body() createServiceDto: CreateServiceDto) {
    try {
      const newService = await this.servicesService.create(createServiceDto);
      return {
        success: true,
        data: newService,
        message: 'Service created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to create service'
      };
    }
  }

  @Put(':id')
  async updateService(@Param('id') id: string, @Body() updateServiceDto: Omit<UpdateServiceDto, 'id'>) {
    try {
      const updatedService = await this.servicesService.update(id, updateServiceDto);
      return {
        success: true,
        data: updatedService,
        message: 'Service updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to update service'
      };
    }
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    try {
      await this.servicesService.delete(id);
      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to delete service'
      };
    }
  }

  @Put(':id/status')
  async updateServiceStatus(@Param('id') id: string, @Body() body: { status: 'active' | 'inactive' | 'draft' }) {
    try {
      const updatedService = await this.servicesService.updateStatus(id, body.status);
      return {
        success: true,
        data: updatedService,
        message: 'Service status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to update service status'
      };
    }
  }

  @Put(':id/display-order')
  async updateServiceDisplayOrder(@Param('id') id: string, @Body() body: { displayOrder: number }) {
    try {
      const updatedService = await this.servicesService.updateDisplayOrder(id, body.displayOrder);
      return {
        success: true,
        data: updatedService,
        message: 'Service display order updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error,
        message: 'Failed to update service display order'
      };
    }
  }
}