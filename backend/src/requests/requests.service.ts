import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ProjectRequest, RequestDocument, RequestMessage, RequestStatus } from './entities/request.entity';
import { CreateRequestDto, UpdateRequestDto, CreateMessageDto } from './dto/request.dto';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ProjectRequest)
    private requestRepository: Repository<ProjectRequest>,
    @InjectRepository(RequestDocument)
    private documentRepository: Repository<RequestDocument>,
    @InjectRepository(RequestMessage)
    private messageRepository: Repository<RequestMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async create(createRequestDto: CreateRequestDto, files?: any[]): Promise<ProjectRequest> {
    const request = this.requestRepository.create(createRequestDto);
    const savedRequest = await this.requestRepository.save(request);

    // Handle file uploads if any
    if (files && files.length > 0) {
      await this.saveRequestDocuments(savedRequest, files);
    }

    // Send notification to admins (implement email service later)
    await this.createSystemMessage(savedRequest.id, 'New project request received');

    return this.findOne(savedRequest.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus,
    search?: string
  ) {
    const queryBuilder = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.assignedTo', 'assignedTo')
      .leftJoinAndSelect('request.documents', 'documents')
      .leftJoinAndSelect('request.messages', 'messages')
      .orderBy('request.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(request.fullName ILIKE :search OR request.email ILIKE :search OR request.company ILIKE :search OR request.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const total = await queryBuilder.getCount();
    const requests = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProjectRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'documents', 'messages', 'messages.sender'],
      order: {
        messages: {
          sentAt: 'ASC',
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async findByEmail(email: string): Promise<ProjectRequest[]> {
    return this.requestRepository.find({
      where: { email: ILike(`%${email}%`) },
      relations: ['documents', 'messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateRequestDto: UpdateRequestDto): Promise<ProjectRequest> {
    const request = await this.findOne(id);

    if (updateRequestDto.assignedToId) {
      const assignedUser = await this.userRepository.findOne({
        where: { id: updateRequestDto.assignedToId },
      });
      if (assignedUser) {
        request.assignedTo = assignedUser;
      }
    }

    // Convert date strings to Date objects
    if (updateRequestDto.estimatedStartDate) {
      request.estimatedStartDate = new Date(updateRequestDto.estimatedStartDate);
    }
    if (updateRequestDto.estimatedEndDate) {
      request.estimatedEndDate = new Date(updateRequestDto.estimatedEndDate);
    }

    Object.assign(request, updateRequestDto);
    
    const savedRequest = await this.requestRepository.save(request);

    // Create system message for status changes
    if (updateRequestDto.status && updateRequestDto.status !== request.status) {
      await this.createSystemMessage(
        savedRequest.id,
        `Request status updated to ${updateRequestDto.status}`
      );
    }

    return this.findOne(savedRequest.id);
  }

  async addMessage(createMessageDto: CreateMessageDto, files?: any[]): Promise<RequestMessage> {
    const request = await this.findOne(createMessageDto.requestId);
    
    const message = this.messageRepository.create({
      request,
      senderName: createMessageDto.senderName,
      senderEmail: createMessageDto.senderEmail,
      senderType: createMessageDto.senderType,
      message: createMessageDto.message,
      isInternal: createMessageDto.isInternal || false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send email notification if this is an admin reply to a client
    if (createMessageDto.senderType === 'admin' && !createMessageDto.isInternal) {
      try {
        const emailResult = await this.emailService.sendReplyEmail({
          to: request.email,
          subject: `Reply to your project request - ${request.serviceInterested}`,
          message: createMessageDto.message,
          senderName: createMessageDto.senderName,
          senderEmail: createMessageDto.senderEmail,
          requestId: request.id,
          clientName: request.fullName,
        });

        if (emailResult.success) {
          console.log(`Email sent successfully to ${request.email} for request ${request.id}`);
        } else {
          console.error(`Failed to send email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error('Error sending reply email:', error);
        // Don't throw the error - we still want to save the message even if email fails
      }
    }

    // Handle file attachments if any (implement later)
    // if (files && files.length > 0) {
    //   await this.saveMessageAttachments(savedMessage, files);
    // }

    return savedMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.messageRepository.update(messageId, { isRead: true });
  }

  async getStats() {
    const totalRequests = await this.requestRepository.count();
    const pendingRequests = await this.requestRepository.count({
      where: { status: RequestStatus.PENDING },
    });
    const inProgressRequests = await this.requestRepository.count({
      where: { status: RequestStatus.IN_PROGRESS },
    });
    const completedRequests = await this.requestRepository.count({
      where: { status: RequestStatus.COMPLETED },
    });

    const statusDistribution = await this.requestRepository
      .createQueryBuilder('request')
      .select('request.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.status')
      .getRawMany();

    return {
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      statusDistribution,
    };
  }

  private async saveRequestDocuments(request: ProjectRequest, files: any[]): Promise<void> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'requests', request.id);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Save file info to database
      const document = this.documentRepository.create({
        request,
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      await this.documentRepository.save(document);
    }
  }

  private async createSystemMessage(requestId: string, message: string): Promise<void> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (request) {
      const systemMessage = this.messageRepository.create({
        request,
        senderName: 'System',
        senderEmail: 'system@granitetech.co.zw',
        senderType: 'system',
        message,
        isRead: false,
        isInternal: true,
      });

      await this.messageRepository.save(systemMessage);
    }
  }

  async getDocument(documentId: string): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['request'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return {
      filePath: document.filePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
    };
  }
}