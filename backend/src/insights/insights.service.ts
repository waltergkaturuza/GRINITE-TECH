import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  InsightCategory,
  InsightKind,
  InsightPost,
  InsightStatus,
} from './entities/insight-post.entity';
import { InsightComment, InsightCommentStatus } from './entities/insight-comment.entity';
import { InsightVote } from './entities/insight-vote.entity';
import {
  InsightSubscriber,
  InsightSubscriberStatus,
} from './entities/insight-subscriber.entity';
import {
  CreateCommentDto,
  CreateInsightDto,
  CreateQuestionDto,
  InsightFilterDto,
  SubscribeInsightDto,
  UpdateCommentDto,
  UpdateInsightDto,
} from './dto/insight.dto';
import { EmailService } from '../email/email.service';

type AuthUser = {
  userId?: string;
  email?: string;
  role?: string;
  user?: { firstName?: string; lastName?: string; email?: string };
};

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || 'update'}-${suffix}`;
}

function displayName(user?: AuthUser, fallback?: string) {
  const first = user?.user?.firstName;
  const last = user?.user?.lastName;
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || fallback || user?.email || 'Community member';
}

export type ThreadedComment = {
  id: string
  postId: string
  parentId: string | null
  body: string
  authorName: string
  authorEmail?: string
  authorUserId?: string
  voteScore: number
  accepted: boolean
  status: string
  createdAt: Date
  updatedAt: Date
  replies: ThreadedComment[]
}
function isStaff(user?: AuthUser) {
  const role = String(user?.role || '').toLowerCase();
  return ['admin', 'developer', 'staff'].includes(role);
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @InjectRepository(InsightPost)
    private readonly posts: Repository<InsightPost>,
    @InjectRepository(InsightComment)
    private readonly comments: Repository<InsightComment>,
    @InjectRepository(InsightVote)
    private readonly votes: Repository<InsightVote>,
    @InjectRepository(InsightSubscriber)
    private readonly subscribers: Repository<InsightSubscriber>,
    private readonly emailService: EmailService,
  ) {}

  async seedIfEmpty() {
    const count = await this.posts.count();
    if (count > 0) return;

    const now = new Date();
    const samples: Partial<InsightPost>[] = [
      {
        slug: 'quantis-fuel-management-africa-launch',
        title: 'Quantis launches fuel management systems for African institutions',
        excerpt:
          'A traceable coupon-to-disbursement platform built for ministries, NGOs, and fleet operators that cannot afford leakage.',
        body: `Public-sector fuel programmes fail in the same places: paper coupons, informal approvals, and reports that cannot be audited.

Quantis Technologies has productised the architecture behind our institutional fuel coupon work into a deployable fuel management system for African governments and NGOs.

The platform covers allocation, multi-level approvals, station redemption, exception handling, and board-ready reporting. It is designed for low-connectivity environments and strict accountability.

If you run a fuel, fleet, or subsidy programme, talk to us about a scoped pilot rather than a multi-year rebuild.`,
        kind: InsightKind.ARTICLE,
        category: InsightCategory.NEWS,
        tags: 'fuel,africa,government,erp',
        status: InsightStatus.PUBLISHED,
        featured: true,
        authorName: 'Quantis Technologies',
        publishedAt: now,
        viewCount: 128,
        commentCount: 0,
      },
      {
        slug: 'q3-digital-transformation-packages',
        title: 'Q3 promotion: scoped digital transformation packages',
        excerpt:
          'Fixed-scope discovery, automation, and portal packages for organisations that need momentum this quarter—not a 40-page proposal.',
        body: `We are offering three time-boxed packages through the end of the quarter:

1. Systems discovery (2 weeks) — current-state map, risk register, and a buildable roadmap.
2. Workflow automation sprint (4 weeks) — one high-friction process moved off email and spreadsheets.
3. Service portal starter (6 weeks) — authenticated portal, request intake, and status tracking.

Packages include architecture, implementation, and a handover workshop. They do not include open-ended retainers.

Contact sales to lock a start date. Capacity is limited to keep delivery quality intact.`,
        kind: InsightKind.ARTICLE,
        category: InsightCategory.PROMOTIONS,
        tags: 'promotion,automation,portals',
        status: InsightStatus.PUBLISHED,
        featured: false,
        authorName: 'Quantis Technologies',
        publishedAt: now,
        viewCount: 86,
        commentCount: 0,
      },
      {
        slug: 'api-toolkit-for-institutional-integrations',
        title: 'New product: API toolkit for institutional integrations',
        excerpt:
          'A documented integration layer for identity, payments, notifications, and reporting so partner systems stop talking through spreadsheets.',
        body: `Most institutional programmes do not fail because the core app is missing. They fail because every adjacent system is glued together by email.

Our API toolkit packages the integration patterns we reuse across government and NGO platforms:

- Identity and role mapping
- Payment and disbursement webhooks
- Notification events
- Audit-grade activity feeds

Each connector ships with sandbox credentials, OpenAPI docs, and a reference client. Browse the products catalogue or ask a question in the community if you are evaluating an integration.`,
        kind: InsightKind.ARTICLE,
        category: InsightCategory.PRODUCTS,
        tags: 'apis,integrations,products',
        status: InsightStatus.PUBLISHED,
        featured: false,
        authorName: 'Quantis Engineering',
        publishedAt: now,
        viewCount: 64,
        commentCount: 0,
      },
      {
        slug: 'why-nestjs-and-postgres-for-government-systems',
        title: 'Why NestJS and Postgres still win for government systems',
        excerpt:
          'A practical note on stack choices when audit trails, role models, and 10-year maintainability matter more than the newest framework.',
        body: `We get asked why we still start many institutional systems on NestJS, Postgres, and a typed frontend.

The short answer: the constraints are boring and unforgiving. You need migrations you can explain, role models that map to real ministries, and a runtime that operations teams can host.

Postgres gives us transactional integrity and reporting without a second database. NestJS gives us predictable modules, guards, and audit hooks. TypeScript reduces the class of bugs that become incidents after go-live.

New frameworks are welcome in prototypes. Production systems for public money need a stack you can staff, secure, and still understand in five years.`,
        kind: InsightKind.ARTICLE,
        category: InsightCategory.TECHNOLOGY,
        tags: 'nestjs,postgres,architecture',
        status: InsightStatus.PUBLISHED,
        featured: false,
        authorName: 'Quantis Engineering',
        publishedAt: now,
        viewCount: 91,
        commentCount: 0,
      },
      {
        slug: 'offline-first-data-collection-for-ngos',
        title: 'How should NGOs approach offline-first data collection?',
        excerpt:
          'Field teams lose connectivity for hours. What architecture has actually worked for you—local SQLite, progressive sync, or something else?',
        body: `We are collecting field-tested approaches for NGO and government programmes that capture data in low-connectivity districts.

If you have shipped (or suffered) an offline-first collector, we want the specifics:

- How did you resolve conflicts when two officers update the same household?
- Did you sync photos immediately or defer them?
- What broke first: auth, GPS, or the queue?

Share a research note, a failure, or a pattern. High-signal answers will be curated into a public briefing.`,
        kind: InsightKind.QUESTION,
        category: InsightCategory.RESEARCH,
        tags: 'offline,ngo,field-data,research',
        status: InsightStatus.PUBLISHED,
        featured: false,
        authorName: 'Community desk',
        publishedAt: now,
        viewCount: 47,
        commentCount: 0,
      },
    ];

    const saved = await this.posts.save(samples.map((row) => this.posts.create(row)));
    const question = saved.find((p) => p.kind === InsightKind.QUESTION);
    if (question) {
      const first = await this.comments.save(
        this.comments.create({
          postId: question.id,
          body: 'We used SQLite on device with a mutation queue. Conflicts were last-write-wins except for household IDs, which were allocated from a block of IDs issued at login. Photos synced later on Wi-Fi only.',
          authorName: 'Field systems lead',
          authorEmail: 'community@quantistechnologies.co.zw',
          voteScore: 8,
          accepted: true,
          status: InsightCommentStatus.PUBLISHED,
        }),
      );
      await this.comments.save(
        this.comments.create({
          postId: question.id,
          parentId: first.id,
          body: 'Same pattern. The thing that broke first for us was auth token refresh while offline—cache a long-lived field token scoped to the assignment, not the user session.',
          authorName: 'Quantis Engineering',
          authorEmail: 'support@quantistech.co.zw',
          voteScore: 5,
          status: InsightCommentStatus.PUBLISHED,
        }),
      );
      question.commentCount = 2;
      await this.posts.save(question);
    }
  }

  async findPublished(filters: InsightFilterDto = {}) {
    const query = this.posts.createQueryBuilder('post');
    query.andWhere('post.status = :status', { status: InsightStatus.PUBLISHED });

    if (filters.category && filters.category !== 'all') {
      query.andWhere('post.category = :category', { category: filters.category });
    }
    if (filters.kind && filters.kind !== 'all') {
      query.andWhere('post.kind = :kind', { kind: filters.kind });
    }
    if (filters.featured) {
      query.andWhere('post.featured = :featured', { featured: true });
    }
    if (filters.search) {
      query.andWhere(
        '(LOWER(post.title) LIKE :q OR LOWER(post.excerpt) LIKE :q OR LOWER(post.body) LIKE :q OR LOWER(post.tags) LIKE :q)',
        { q: `%${filters.search.toLowerCase()}%` },
      );
    }

    query.orderBy('post.featured', 'DESC').addOrderBy('post.publishedAt', 'DESC');
    const items = await query.getMany();

    const countsRaw = await this.posts
      .createQueryBuilder('post')
      .select('post.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('post.status = :status', { status: InsightStatus.PUBLISHED })
      .groupBy('post.category')
      .getRawMany();

    const counts = countsRaw.reduce((acc: Record<string, number>, row) => {
      acc[row.category] = Number(row.count);
      return acc;
    }, {});

    return {
      items,
      total: items.length,
      counts,
    };
  }

  async findAllAdmin(filters: InsightFilterDto = {}) {
    const query = this.posts.createQueryBuilder('post');
    if (filters.status) query.andWhere('post.status = :status', { status: filters.status });
    if (filters.category && filters.category !== 'all') {
      query.andWhere('post.category = :category', { category: filters.category });
    }
    if (filters.kind && filters.kind !== 'all') {
      query.andWhere('post.kind = :kind', { kind: filters.kind });
    }
    if (filters.search) {
      query.andWhere('(LOWER(post.title) LIKE :q OR LOWER(post.body) LIKE :q)', {
        q: `%${filters.search.toLowerCase()}%`,
      });
    }
    query.orderBy('post.updatedAt', 'DESC');
    return query.getMany();
  }

  async findBySlug(slug: string, incrementViews = false) {
    const post = await this.posts.findOne({ where: { slug } });
    if (!post || post.status !== InsightStatus.PUBLISHED) {
      throw new NotFoundException('Update not found');
    }
    if (incrementViews) {
      post.viewCount = (post.viewCount || 0) + 1;
      await this.posts.save(post);
    }
    return post;
  }

  async findOneAdmin(id: string) {
    const post = await this.posts.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Update not found');
    return post;
  }

  async create(dto: CreateInsightDto, user?: AuthUser) {
    const post = this.posts.create({
      ...dto,
      slug: slugify(dto.title),
      kind: dto.kind || InsightKind.ARTICLE,
      category: dto.category || InsightCategory.NEWS,
      status: dto.status || InsightStatus.DRAFT,
      featured: Boolean(dto.featured),
      authorName: dto.authorName || displayName(user, 'Quantis Technologies'),
      authorEmail: dto.authorEmail || user?.email,
      authorUserId: user?.userId,
      publishedAt: (dto.status || InsightStatus.DRAFT) === InsightStatus.PUBLISHED ? new Date() : null,
    });
    const saved = await this.posts.save(post);
    this.queueNewsBrief(saved);
    return saved;
  }

  async createQuestion(dto: CreateQuestionDto, user?: AuthUser) {
    const authorName = dto.authorName || displayName(user);
    const authorEmail = dto.authorEmail || user?.email;
    if (!user?.userId && (!authorName || !authorEmail)) {
      throw new BadRequestException('Name and email are required to ask a question');
    }

    const post = this.posts.create({
      title: dto.title,
      body: dto.body,
      excerpt: dto.body.slice(0, 180),
      slug: slugify(dto.title),
      kind: InsightKind.QUESTION,
      category: dto.category || InsightCategory.COMMUNITY,
      tags: dto.tags,
      status: InsightStatus.PUBLISHED,
      featured: false,
      authorName,
      authorEmail,
      authorUserId: user?.userId,
      publishedAt: new Date(),
    });
    return this.posts.save(post);
  }

  async update(id: string, dto: UpdateInsightDto) {
    const post = await this.findOneAdmin(id);
    const wasPublished = post.status === InsightStatus.PUBLISHED;
    Object.assign(post, dto);
    if (dto.status === InsightStatus.PUBLISHED && !wasPublished) {
      post.publishedAt = new Date();
    }
    const saved = await this.posts.save(post);
    if (!wasPublished && saved.status === InsightStatus.PUBLISHED) {
      this.queueNewsBrief(saved);
    }
    return saved;
  }

  async remove(id: string) {
    const post = await this.findOneAdmin(id);
    await this.posts.remove(post);
    return { success: true };
  }

  async listComments(slug: string, includeHidden = false): Promise<ThreadedComment[]> {
    const post = await this.posts.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Update not found');

    const where: any = { postId: post.id };
    if (!includeHidden) where.status = InsightCommentStatus.PUBLISHED;

    const comments = await this.comments.find({
      where,
      order: { accepted: 'DESC', voteScore: 'DESC', createdAt: 'ASC' },
    });
    return this.nestComments(comments);
  }

  async listCommentsAdmin() {
    return this.comments.find({
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(slug: string, dto: CreateCommentDto, user?: AuthUser) {
    const post = await this.posts.findOne({ where: { slug } });
    if (!post || post.status !== InsightStatus.PUBLISHED) {
      throw new NotFoundException('Update not found');
    }

    const authorName = dto.authorName || displayName(user);
    const authorEmail = dto.authorEmail || user?.email;
    if (!user?.userId && (!authorName || !authorEmail)) {
      throw new BadRequestException('Name and email are required to contribute');
    }

    if (dto.parentId) {
      const parent = await this.comments.findOne({ where: { id: dto.parentId, postId: post.id } });
      if (!parent) throw new BadRequestException('Parent contribution was not found');
    }

    const comment = this.comments.create({
      postId: post.id,
      parentId: dto.parentId || null,
      body: dto.body,
      authorName,
      authorEmail,
      authorUserId: user?.userId,
      status: InsightCommentStatus.PUBLISHED,
    });
    const saved = await this.comments.save(comment);
    post.commentCount = (post.commentCount || 0) + 1;
    await this.posts.save(post);
    return saved;
  }

  async voteComment(commentId: string, value: 1 | -1, voterKey: string, user?: AuthUser) {
    const comment = await this.comments.findOne({ where: { id: commentId } });
    if (!comment || comment.status !== InsightCommentStatus.PUBLISHED) {
      throw new NotFoundException('Contribution not found');
    }

    const key = user?.userId ? `user:${user.userId}` : `anon:${voterKey}`;
    if (!voterKey && !user?.userId) {
      throw new BadRequestException('A voter key is required');
    }

    const existing = await this.votes.findOne({ where: { commentId, voterKey: key } });
    if (existing) {
      if (existing.value === value) {
        comment.voteScore -= existing.value;
        await this.votes.remove(existing);
        await this.comments.save(comment);
        return { voteScore: comment.voteScore, value: 0 };
      }
      comment.voteScore += value - existing.value;
      existing.value = value;
      existing.userId = user?.userId;
      await this.votes.save(existing);
      await this.comments.save(comment);
      return { voteScore: comment.voteScore, value };
    }

    await this.votes.save(
      this.votes.create({
        commentId,
        voterKey: key,
        userId: user?.userId,
        value,
      }),
    );
    comment.voteScore += value;
    await this.comments.save(comment);
    return { voteScore: comment.voteScore, value };
  }

  async acceptComment(commentId: string, user?: AuthUser) {
    const comment = await this.comments.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Contribution not found');
    const post = await this.findOneAdmin(comment.postId);

    const owner = post.authorUserId && post.authorUserId === user?.userId;
    if (!owner && !isStaff(user)) {
      throw new ForbiddenException('Only the author or staff can accept an answer');
    }
    if (post.kind !== InsightKind.QUESTION) {
      throw new BadRequestException('Accepted answers apply to questions');
    }

    await this.comments.update({ postId: post.id }, { accepted: false });
    comment.accepted = true;
    return this.comments.save(comment);
  }

  async updateComment(id: string, dto: UpdateCommentDto) {
    const comment = await this.comments.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Contribution not found');
    Object.assign(comment, dto);
    return this.comments.save(comment);
  }

  async removeComment(id: string) {
    const comment = await this.comments.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Contribution not found');
    const post = await this.posts.findOne({ where: { id: comment.postId } });
    await this.comments.remove(comment);
    if (post) {
      post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
      await this.posts.save(post);
    }
    return { success: true };
  }

  async searchPublished(query: string) {
    if (!query?.trim()) {
      return this.posts.find({
        where: { status: InsightStatus.PUBLISHED },
        order: { publishedAt: 'DESC' },
        take: 8,
      });
    }
    return this.posts
      .createQueryBuilder('post')
      .where('post.status = :status', { status: InsightStatus.PUBLISHED })
      .andWhere('(LOWER(post.title) LIKE :q OR LOWER(post.excerpt) LIKE :q OR LOWER(post.tags) LIKE :q)', {
        q: `%${query.toLowerCase()}%`,
      })
      .orderBy('post.publishedAt', 'DESC')
      .take(8)
      .getMany();
  }

  async subscribe(dto: SubscribeInsightDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name?.trim() || null;
    let subscriber = await this.subscribers.findOne({ where: { email } });

    if (subscriber?.status === InsightSubscriberStatus.ACTIVE) {
      return { success: true, alreadySubscribed: true };
    }

    if (subscriber) {
      subscriber.status = InsightSubscriberStatus.ACTIVE;
      subscriber.unsubscribedAt = null;
      subscriber.unsubscribeToken = randomUUID();
      if (name) subscriber.name = name;
    } else {
      subscriber = this.subscribers.create({
        email,
        name,
        status: InsightSubscriberStatus.ACTIVE,
        unsubscribeToken: randomUUID(),
      });
    }

    const saved = await this.subscribers.save(subscriber);
    void this.emailService
      .sendSubscribeConfirmation({
        to: saved.email,
        name: saved.name,
        unsubscribeToken: saved.unsubscribeToken,
      })
      .catch((error) =>
        this.logger.error(
          `Subscribe confirmation failed for ${saved.email}`,
          error instanceof Error ? error.stack : error,
        ),
      );

    return { success: true, alreadySubscribed: false };
  }

  async unsubscribe(token?: string) {
    const value = String(token || '').trim();
    if (!value) throw new BadRequestException('Unsubscribe token is required');
    const subscriber = await this.subscribers.findOne({ where: { unsubscribeToken: value } });
    if (!subscriber) throw new NotFoundException('Subscription was not found');
    subscriber.status = InsightSubscriberStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    await this.subscribers.save(subscriber);
    return { success: true };
  }

  async listSubscribers() {
    const items = await this.subscribers.find({
      order: { createdAt: 'DESC' },
    });
    return items.map(({ unsubscribeToken, ...rest }) => rest);
  }

  private queueNewsBrief(post: InsightPost) {
    if (post.status !== InsightStatus.PUBLISHED) return;
    if (post.kind === InsightKind.QUESTION) return;
    void this.sendNewsBriefs(post).catch((error) =>
      this.logger.error(
        `News brief send failed for ${post.slug}`,
        error instanceof Error ? error.stack : error,
      ),
    );
  }

  private async sendNewsBriefs(post: InsightPost) {
    const recipients = await this.subscribers.find({
      where: { status: InsightSubscriberStatus.ACTIVE },
    });
    if (!recipients.length) return;

    const excerpt = (post.excerpt || post.body || '').replace(/\s+/g, ' ').trim().slice(0, 280);
    for (const subscriber of recipients) {
      const result = await this.emailService.sendNewsBrief({
        to: subscriber.email,
        name: subscriber.name,
        title: post.title,
        excerpt,
        category: post.category,
        slug: post.slug,
        unsubscribeToken: subscriber.unsubscribeToken,
      });
      if (!result.success) {
        this.logger.warn(`News brief was not delivered to ${subscriber.email}: ${result.error}`);
      }
    }
  }

  private nestComments(comments: InsightComment[]): ThreadedComment[] {
    const byId = new Map<string, ThreadedComment>()
    comments.forEach((c) => {
      byId.set(c.id, {
        id: c.id,
        postId: c.postId,
        parentId: c.parentId,
        body: c.body,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        authorUserId: c.authorUserId,
        voteScore: c.voteScore,
        accepted: c.accepted,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        replies: [],
      })
    })
    const roots: ThreadedComment[] = []
    byId.forEach((comment) => {
      if (comment.parentId && byId.has(comment.parentId)) {
        byId.get(comment.parentId)!.replies.push(comment)
      } else {
        roots.push(comment)
      }
    })
    return roots
  }
}
