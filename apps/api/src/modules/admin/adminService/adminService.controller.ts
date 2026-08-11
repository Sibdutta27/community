import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminServiceService } from './adminService.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { CreateServiceCategoryDto } from './dto/createServiceCategory.dto';
import { EditServiceCategoryDto } from './dto/editServiceCategory.dto';
import { ServiceStatus } from '@/generated/prisma/enums';
import { CreateServiceDto } from './dto/createService.dto';
import { EditServiceDto } from './dto/editService.dto';
import { GetServiceRegistrationsDto } from './dto/getServiceRegistrations.dto';


@Controller('admin/service')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminServiceController {
    constructor(private adminServiceService: AdminServiceService) { }

    /**
     * Get all service categories
     */
    @Get('/category')
    async getServiceCategories(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminServiceService.getServiceCategories({
            page : Number(page) || undefined,
            limit: Number(limit) || undefined,
            search,
        });
    }

    /**
     * Create service category
     */
    @Post('category/create')
    async createServiceCategory(
        @Body() dto: CreateServiceCategoryDto,
    ) {
        return this.adminServiceService.createServiceCategory(dto);
    }

    /**
     * Get all services
     */
    @Get()
    async getServices(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,

        @Query('status')
        status?: ServiceStatus,

        @Query('categoryId')
        categoryId?: string,
    ) {
        return this.adminServiceService.getServices({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
            status,
            categoryId,
        });
    }

    /**
     * Create service
     */
    @Post('/create')
    async createService(
        @Body() dto: CreateServiceDto,
    ) {
        return this.adminServiceService.createService(dto);
    }

    /**
     * Get single service category
     */
    @Get('category/:id')
    async getServiceCategory(
        @Param('id') id: string,
    ) {
        return this.adminServiceService.getServiceCategory(id);
    }

    /**
     * Edit service category
     */
    @Patch('category/:id')
    async editServiceCategory(
        @Param('id') id: string,

        @Body() dto: EditServiceCategoryDto,
    ) {
        return this.adminServiceService.editServiceCategory(
            id,
            dto,
        );
    }

    /**
     * Get who registered for a program, paginated.
     *
     * Declared before `:id` so the two-segment path wins over the single
     * parameter route regardless of how the router orders them.
     */
    @Get(':id/registrations')
    async getServiceRegistrations(
        @Param('id') id: string,

        @Query() query: GetServiceRegistrationsDto,
    ) {
        return this.adminServiceService.getServiceRegistrations(
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
    async exportServiceRegistrations(
        @Param('id') id: string,

        @Res({ passthrough: true }) res: Response,
    ) {
        const { filename, csv } =
            await this.adminServiceService.exportServiceRegistrations(id);

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`,
        );

        return csv;
    }

    /**
     * Get single service
     */
    @Get(':id')
    async getService(
        @Param('id') id: string,
    ) {
        return this.adminServiceService.getService(id);
    }

    /**
     * Edit service
     */
    @Patch(':id')
    async editService(
        @Param('id') id: string,

        @Body() dto: EditServiceDto,
    ) {
        return this.adminServiceService.editService(
            id,
            dto,
        );
    }

}
