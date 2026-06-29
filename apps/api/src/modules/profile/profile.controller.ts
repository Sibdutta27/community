import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { ProfileService } from './profile.service';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard, ActivityGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get('/')
    async getAllDocuments(@CurrentUser('id') userId: string) {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        return this.profileService.getProfile(userId);
    }
}
