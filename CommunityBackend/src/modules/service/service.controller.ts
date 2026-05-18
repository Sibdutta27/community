import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

@Controller('services')
export class ServiceController {
    
    constructor(private serviceService: ServiceService) { }
    
    @Get()
    async getServices(@Query('category') category?: string) {
        return this.serviceService.getAllAvailableServices(category);
    }

    @Get('categories')
    async getCategories() {
        return this.serviceService.getAllCategories();
    }
    
    @UseGuards(JwtAuthGuard, ActivityGuard)
    @Post('register')
    async registerService( @CurrentUser( 'id' ) userId: string, @Body('serviceId') serviceId: string ) {
        
        if ( ! serviceId ) {
            throw new BadRequestException( 'Service ID is required' );
        }
        
        return this.serviceService.registerUserToService( serviceId, userId );
    }

    @UseGuards(JwtAuthGuard, ActivityGuard)
    @Post('register-list')
    async registerServiceList( @CurrentUser( 'id' ) userId: string ) {
        return this.serviceService.registerServicesListForUser( userId );
    }
}
