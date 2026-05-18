import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminEventService } from './adminEvent.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { CreateEventCategoryDto } from './dto/createEventCategory.dto';
import { UpdateEventCategoryDto } from './dto/updateEventCategory.dto';
import { CreateEventDto } from './dto/createEvent.dto';
import { UpdateEventDto } from './dto/updateEvent.dto';


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
