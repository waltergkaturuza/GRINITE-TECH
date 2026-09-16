import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ServicesService } from './services.service'
import { CreateServiceDto, UpdateServiceDto } from './entities/service.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getAllServices(@Query('category') category?: string, @Query('status') status?: string) {
    const services = await this.servicesService.findAll(category, status)
    return {
      success: true,
      data: services,
      message: 'Services retrieved successfully',
    }
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.servicesService.getCategories()
    return {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
    }
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    const service = await this.servicesService.findById(id)
    if (!service) {
      return {
        success: false,
        message: 'Service not found',
      }
    }
    return {
      success: true,
      data: service,
      message: 'Service retrieved successfully',
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async createService(@Body() createServiceDto: CreateServiceDto) {
    const service = await this.servicesService.create(createServiceDto)
    return {
      success: true,
      data: service,
      message: 'Service created successfully',
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async updateService(@Param('id') id: string, @Body() updateServiceDto: Omit<UpdateServiceDto, 'id'>) {
    const service = await this.servicesService.update(id, updateServiceDto)
    return {
      success: true,
      data: service,
      message: 'Service updated successfully',
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async patchService(@Param('id') id: string, @Body() updateServiceDto: Omit<UpdateServiceDto, 'id'>) {
    return this.updateService(id, updateServiceDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async deleteService(@Param('id') id: string) {
    await this.servicesService.delete(id)
    return {
      success: true,
      message: 'Service deleted successfully',
    }
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async updateServiceStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' | 'draft' },
  ) {
    const service = await this.servicesService.updateStatus(id, body.status)
    return {
      success: true,
      data: service,
      message: 'Service status updated successfully',
    }
  }

  @Put(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  async updateDisplayOrder(@Param('id') id: string, @Body() body: { displayOrder: number }) {
    const service = await this.servicesService.updateDisplayOrder(id, body.displayOrder)
    return {
      success: true,
      data: service,
      message: 'Service display order updated successfully',
    }
  }
}
