import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Body() dto: NotificationDto) {
    return this.notificationsService.createNotification(dto);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Get()
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
  ) {
    return this.notificationsService.getUserNotifications(userId, companyId);
  }
}
