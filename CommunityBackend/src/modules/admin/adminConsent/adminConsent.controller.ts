import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminConsentService } from './adminConsent.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { CreateConsentDto } from './dto/createConsent.dto';
import { EditConsentDto } from './dto/editConsent.dto';


@Controller('admin/consent')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminConsentController {
    constructor(private adminConsentService: AdminConsentService) { }

    /**
     * Get all cultural connection
     */
    @Get()
    async getCulturalConnections(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminConsentService.getConsents({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
        });
    }

    /**
     * Create consent
     */
    @Post('/create')
    async createConsent(
        @Body() body: CreateConsentDto,
    ) {

        return this.adminConsentService.createConsent(body);
    }

    /**
     * Get single consent
     */
    @Get(':id')
    async getConsent(
        @Param('id') id: string,
    ) {

        return this.adminConsentService.getConsent(id);
    }

    /**
     * Edit consent
     */
    @Patch(':id')
    async editConsent(
        @Param('id') id: string,
        @Body() body: EditConsentDto,
    ) {

        return this.adminConsentService.editConsent(
            id,
            body,
        );
    }
}
