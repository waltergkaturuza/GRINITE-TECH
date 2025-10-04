import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestDto, CreateMessageDto } from './dto/request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RequestStatus } from './entities/request.entity';

@ApiTags('Project Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new project request' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Request submitted successfully' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @UploadedFiles() files: any[]
  ) {
    try {
      const request = await this.requestsService.create(createRequestDto, files);
      return {
        success: true,
        data: request,
        message: 'Project request submitted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit request',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all project requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: RequestStatus,
    @Query('search') search?: string
  ) {
    try {
      const result = await this.requestsService.findAll(page, limit, status, search);
      return {
        success: true,
        data: result,
        message: 'Requests retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve requests',
      };
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get request statistics (Admin only)' })
  async getStats() {
    try {
      const stats = await this.requestsService.getStats();
      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve statistics',
      };
    }
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get requests by email (for client tracking)' })
  async findByEmail(@Param('email') email: string) {
    try {
      const requests = await this.requestsService.findByEmail(email);
      return {
        success: true,
        data: requests,
        message: 'Requests retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve requests',
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific request by ID' })
  async findOne(@Param('id') id: string) {
    try {
      const request = await this.requestsService.findOne(id);
      return {
        success: true,
        data: request,
        message: 'Request retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve request',
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a request (Admin only)' })
  async update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    try {
      const request = await this.requestsService.update(id, updateRequestDto);
      return {
        success: true,
        data: request,
        message: 'Request updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update request',
      };
    }
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a request' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('attachments', 5))
  async addMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() files: any[]
  ) {
    try {
      // Set the request ID from the URL param
      createMessageDto.requestId = id;
      
      const message = await this.requestsService.addMessage(createMessageDto, files);
      return {
        success: true,
        data: message,
        message: 'Message added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add message',
      };
    }
  }

  @Patch('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  async markMessageAsRead(@Param('messageId') messageId: string) {
    try {
      await this.requestsService.markMessageAsRead(messageId);
      return {
        success: true,
        message: 'Message marked as read',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to mark message as read',
      };
    }
  }

  @Get('documents/:documentId')
  @ApiOperation({ summary: 'Download a document' })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response
  ) {
    try {
      const document = await this.requestsService.getDocument(documentId);
      
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      
      return res.sendFile(document.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Document not found',
      });
    }
  }
}