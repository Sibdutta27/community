import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminCulturalConnectionService } from './adminCulturalConnection.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { EditCulturalConnectionDto } from './dto/editCulturalConnection.dto';
import { CreateCulturalConnectionDto } from './dto/createCulturalConnection.dto';


@Controller('admin/cultural-connection')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminCulturalConnectionController {
    constructor(private adminCulturalConnectionService: AdminCulturalConnectionService) { }

    /**
     * Get all cultural connection
     */
    @Get()
    async getCulturalConnections(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminCulturalConnectionService.getCulturalConnections({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
        });
    }

    /**
     * Create cultural connection
     */
    @Post('/create')
    async createCulturalConnection(
        @Body()
        dto: CreateCulturalConnectionDto,
    ) {

        return this.adminCulturalConnectionService.createCulturalConnection(dto);
    }

    /**
     * Get single cultural connection
     */
    @Get(':id')
    async getCulturalConnection(
        @Param('id') id: string,
    ) {

        return this.adminCulturalConnectionService.getCulturalConnection(id);
    }

    /**
     * Edit cultural connection
     */
    @Patch(':id')
    async editCulturalConnection(
        @Param('id') id: string,

        @Body()
        dto: EditCulturalConnectionDto,
    ) {

        return this.adminCulturalConnectionService.editCulturalConnection(
            id,
            dto,
        );
    }
}
