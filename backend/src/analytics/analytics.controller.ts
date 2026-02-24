import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('page-view')
  async trackPageView(@Body() body: TrackPageViewDto) {
    await this.analyticsService.trackPageView(body);
    return { success: true };
  }

  @Post('event')
  async trackEvent(@Body() body: TrackEventDto) {
    await this.analyticsService.trackEvent(body);
    return { success: true };
  }

  @Get('summary')
  async summary(@Query('windowDays') windowDays?: string) {
    const days = windowDays ? parseInt(windowDays, 10) || 14 : 14;
    const data = await this.analyticsService.getSummary(days);
    return {
      success: true,
      data,
    };
  }
}

