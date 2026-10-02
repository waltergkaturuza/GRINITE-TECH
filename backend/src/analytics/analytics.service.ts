import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AnalyticsEvent, PageView } from './analytics.entity';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { countryName } from './visitor-country';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageView)
    private readonly pageViewRepo: Repository<PageView>,
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
  ) {}

  private classifyDevice(userAgent?: string): 'desktop' | 'mobile' | 'tablet' | 'bot' | 'other' {
    const ua = (userAgent || '').toLowerCase();
    if (!ua) return 'other';
    if (/(bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot)/i.test(ua)) return 'bot';
    if (/(ipad|tablet|kindle|silk|playbook)/i.test(ua)) return 'tablet';
    if (/(mobi|iphone|ipod|android|blackberry|phone)/i.test(ua)) return 'mobile';
    if (/(windows|macintosh|linux|x11)/i.test(ua)) return 'desktop';
    return 'other';
  }

  async trackPageView(data: TrackPageViewDto, countryCode?: string | null): Promise<void> {
    const view = this.pageViewRepo.create({
      path: data.path,
      referrer: data.referrer,
      sessionId: data.sessionId,
      userId: data.userId,
      userAgent: data.userAgent,
      countryCode: countryCode || undefined,
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
    const allTime = windowDays <= 0;
    const since = new Date();
    since.setDate(since.getDate() - windowDays);
    const createdAt = allTime ? undefined : MoreThanOrEqual(since);

    const [pageViews, events] = await Promise.all([
      this.pageViewRepo.find({ where: createdAt ? { createdAt } : {} }),
      this.eventRepo.find({ where: createdAt ? { createdAt } : {} }),
    ]);

    const totalPageViews = pageViews.length;
    const totalEvents = events.length;

    const viewsByDay: Record<string, number> = {};
    const sessionsByDay: Record<string, number> = {};
    const daySessions: Record<string, Set<string>> = {};
    for (const view of pageViews) {
      const key = view.createdAt.toISOString().slice(0, 10);
      viewsByDay[key] = (viewsByDay[key] || 0) + 1;
      const sid = view.sessionId || '';
      if (!daySessions[key]) daySessions[key] = new Set();
      if (sid) daySessions[key].add(sid);
    }
    for (const [day, set] of Object.entries(daySessions)) {
      sessionsByDay[day] = set.size;
    }

    const topPages: Record<string, number> = {};
    for (const view of pageViews) {
      topPages[view.path] = (topPages[view.path] || 0) + 1;
    }

    const devices: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, bot: 0, other: 0 };
    const visitorsByCountry = new Map<string, Set<string>>();
    for (const view of pageViews) {
      const device = this.classifyDevice(view.userAgent);
      devices[device] = (devices[device] || 0) + 1;
      if (!view.countryCode) continue;
      const visitorKey = view.sessionId || view.id;
      const visitors = visitorsByCountry.get(view.countryCode) || new Set<string>();
      visitors.add(visitorKey);
      visitorsByCountry.set(view.countryCode, visitors);
    }

    const rankedCountries = [...visitorsByCountry.entries()]
      .map(([code, visitors]) => ({ code, name: countryName(code), count: visitors.size }))
      .sort((a, b) => b.count - a.count);
    const topCountries = rankedCountries.slice(0, 8);
    const otherCount = rankedCountries.slice(8).reduce((sum, row) => sum + row.count, 0);
    const countries = otherCount > 0 ? [...topCountries, { code: 'OTHER', name: 'Other', count: otherCount }] : topCountries;

    const eventCounts: Record<string, number> = {};
    const eventsByDay: Record<string, number> = {};
    const eventsByDayByName: Record<string, Record<string, number>> = {};
    for (const e of events) {
      eventCounts[e.eventName] = (eventCounts[e.eventName] || 0) + 1;
      const dayKey = e.createdAt.toISOString().slice(0, 10);
      eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + 1;
      if (!eventsByDayByName[e.eventName]) eventsByDayByName[e.eventName] = {};
      eventsByDayByName[e.eventName][dayKey] = (eventsByDayByName[e.eventName][dayKey] || 0) + 1;
    }

    const uniqueSessions = new Set(pageViews.map(v => v.sessionId).filter(Boolean)).size;

    return {
      windowDays: allTime ? 0 : windowDays,
      totalPageViews,
      totalEvents,
      uniqueSessions,
      viewsByDay,
      sessionsByDay,
      devices,
      countries,
      topPages: Object.entries(topPages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50)
        .map(([path, count]) => ({ path, count })),
      eventsByName: eventCounts,
      eventsByDay,
      eventsByDayByName,
    };
  }
}

