import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { AcceptConsentDto } from './dto/acceptConsent.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from '../user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

@Controller('consent')
export class ConsentController {
    
    constructor(private consentService: ConsentService) { }
    
    @Get('active')
    async getActiveConsents() {
        return this.consentService.getAllActiveConsents();
    }

    @UseGuards(JwtAuthGuard, ActivityGuard)
    @Post('accept')
    async acceptConsent( @CurrentUser( 'id' ) userId: string, @Body() dto: AcceptConsentDto ) {
        return this.consentService.acceptEnrollmentConsent( userId, dto );
    }
}
