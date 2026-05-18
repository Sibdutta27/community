import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

@Controller('events')
export class EventController {

    constructor(private eventService: EventService) { }

    @Get()
    async getAllEvents(
        @Query('category') category?: string,
        @Query('date') date        ?: string,
    ) {
        return this.eventService.getAllAvailableEvent(category, date);
    }

    @Get('/previous')
    async getPreviousEvents(@Query('category') category?: string) {
        return this.eventService.getPreviousEvents(category);
    }

    @Get('categories')
    async getCategories() {
        return this.eventService.getAllCategories();
    }

    @UseGuards(JwtAuthGuard, ActivityGuard)
    @Post('register')
    async registerEvent(@CurrentUser('id') userId: string, @Body('eventId') eventId: string) {
        if ( ! eventId ) {
            throw new BadRequestException( 'Event ID is required' );
        }
        return this.eventService.registerUserToEvent(eventId, userId);
    }

    @UseGuards(JwtAuthGuard, ActivityGuard)
    @Post('register-list')
    async registerServiceList( @CurrentUser( 'id' ) userId: string ) {
        return this.eventService.registerEventsListForUser( userId );
    }
}
