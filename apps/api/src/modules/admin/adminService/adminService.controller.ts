import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminServiceService } from './adminService.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { CreateServiceCategoryDto } from './dto/createServiceCategory.dto';
import { EditServiceCategoryDto } from './dto/editServiceCategory.dto';
import { ServiceStatus } from '@/generated/prisma/enums';
import { CreateServiceDto } from './dto/createService.dto';
import { EditServiceDto } from './dto/editService.dto';


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
