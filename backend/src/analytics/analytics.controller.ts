import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { countryCodeForRequest } from './visitor-country';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('page-view')
  async trackPageView(@Body() body: TrackPageViewDto, @Req() req: Request) {
    const countryCode = await countryCodeForRequest(req);
    await this.analyticsService.trackPageView(body, countryCode);
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

