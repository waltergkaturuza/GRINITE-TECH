import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AnalyticsEvent, PageView } from './analytics.entity';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageView)
    private readonly pageViewRepo: Repository<PageView>,
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
  ) {}

  async trackPageView(data: TrackPageViewDto): Promise<void> {
    const view = this.pageViewRepo.create({
      path: data.path,
      referrer: data.referrer,
      sessionId: data.sessionId,
      userId: data.userId,
    });
    await this.pageViewRepo.save(view);
  }

  async trackEvent(data: TrackEventDto): Promise<void> {
    const event = this.eventRepo.create({
      eventName: data.eventName,
      page: data.page,
      sessionId: data.sessionId,
      userId: data.userId,
      metadata: data.metadata,
    });
    await this.eventRepo.save(event);
  }

  async getSummary(windowDays = 14) {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const [pageViews, events] = await Promise.all([
      this.pageViewRepo.find({ where: { createdAt: MoreThanOrEqual(since) } }),
      this.eventRepo.find({ where: { createdAt: MoreThanOrEqual(since) } }),
    ]);

    const totalPageViews = pageViews.length;
    const totalEvents = events.length;

    const viewsByDay: Record<string, number> = {};
    for (const view of pageViews) {
      const key = view.createdAt.toISOString().slice(0, 10);
      viewsByDay[key] = (viewsByDay[key] || 0) + 1;
    }

    const topPages: Record<string, number> = {};
    for (const view of pageViews) {
      topPages[view.path] = (topPages[view.path] || 0) + 1;
    }

    const eventCounts: Record<string, number> = {};
    for (const e of events) {
      eventCounts[e.eventName] = (eventCounts[e.eventName] || 0) + 1;
    }

    const uniqueSessions = new Set(pageViews.map(v => v.sessionId).filter(Boolean)).size;

    return {
      windowDays,
      totalPageViews,
      totalEvents,
      uniqueSessions,
      viewsByDay,
      topPages: Object.entries(topPages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, count]) => ({ path, count })),
      eventsByName: eventCounts,
    };
  }
}

