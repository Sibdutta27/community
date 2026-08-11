import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminEventService } from './adminEvent.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { CreateEventCategoryDto } from './dto/createEventCategory.dto';
import { UpdateEventCategoryDto } from './dto/updateEventCategory.dto';
import { CreateEventDto } from './dto/createEvent.dto';
import { UpdateEventDto } from './dto/updateEvent.dto';
import { GetEventRegistrationsDto } from './dto/getEventRegistrations.dto';
import { GetEventCalendarDto } from './dto/getEventCalendar.dto';


@Controller('admin/event')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminEventController {
    constructor(private adminEventService: AdminEventService) { }


    /**
     * Get all event categories
     */
    @Get('category')
    async getEventCategories(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminEventService.getEventCategories({
            page: Number(page) || undefined,
            limit: Number(limit) || undefined,
            search,
        });
    }

    /**
     * Create event category
     */
    @Post('category/create')
    async createEventCategory(
        @Body() dto: CreateEventCategoryDto,
    ) {
        return this.adminEventService.createEventCategory(dto);
    }

    /**
     * Get all events
     */
    @Get()
    async getEvents(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.adminEventService.getEvents({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
            categoryId,
        });
    }

    /**
     * Create event
     */
    @Post('create')
    async createEvent(
        @Body() dto: CreateEventDto,
    ) {
        return this.adminEventService.createEvent(dto);
    }

    /**
     * Get every event inside a date window, for the month calendar.
     *
     * Declared before `:id` so the literal path is not swallowed by the
     * parameter route.
     */
    @Get('calendar')
    async getEventCalendar(
        @Query() query: GetEventCalendarDto,
    ) {
        return this.adminEventService.getEventCalendar({
            from: query.from,
            to: query.to,
            categoryId: query.categoryId,
        });
    }

    /**
     * Get single event category
     */
    @Get('category/:id')
    async getEventCategory(
        @Param('id') id: string,
    ) {
        return this.adminEventService.getEventCategory(id);
    }

    /**
     * Update event category
     */
    @Patch('category/:id')
    async updateEventCategory(
        @Param('id') id: string,
        @Body() dto: UpdateEventCategoryDto,
    ) {

        return this.adminEventService.updateEventCategory(
            id,
            dto,
        );
    }

    /**
     * Get who registered for an event, paginated.
     *
     * Declared before `:id` so the two-segment path wins over the single
     * parameter route regardless of how the router orders them.
     */
    @Get(':id/registrations')
    async getEventRegistrations(
        @Param('id') id: string,

        @Query() query: GetEventRegistrationsDto,
    ) {
        return this.adminEventService.getEventRegistrations(
            id,
            {
                page: query.page || 1,
                limit: query.limit || 10,
                search: query.search,
            },
        );
    }

    /**
     * Download the full registrant roster as CSV
     */
    @Get(':id/registrations/export')
    @Header('Content-Type', 'text/csv; charset=utf-8')
    async exportEventRegistrations(
        @Param('id') id: string,

        @Res({ passthrough: true }) res: Response,
    ) {
        const { filename, csv } =
            await this.adminEventService.exportEventRegistrations(id);

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`,
        );

        return csv;
    }

    /**
     * Get single event
     */
    @Get(':id')
    async getEvent(
        @Param('id') id: string,
    ) {
        return this.adminEventService.getEvent(id);
    }

    /**
     * Update event
     */
    @Patch(':id')
    async updateEvent(
        @Param('id') id: string,
        @Body() dto: UpdateEventDto,
    ) {
        return this.adminEventService.updateEvent(
            id,
            dto,
        );
    }
}
