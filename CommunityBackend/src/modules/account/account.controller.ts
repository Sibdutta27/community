import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from '../user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    
    constructor(private readonly accountService: AccountService) { }
    
    @Get('info')
    @UseGuards(JwtAuthGuard, ActivityGuard)
    async getAccountInfo(@CurrentUser('id') userId: string) {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        return this.accountService.getInfo(userId);
    }

    @Get('community-meta')
    async getAllDocuments() {
        return this.accountService.getCommunityMeta();
    }
}
