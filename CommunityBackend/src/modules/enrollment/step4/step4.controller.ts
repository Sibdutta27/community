import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step4Service } from './step4.service';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step4')
export class Step4Controller {
    constructor(private step4Service: Step4Service) { }

    // This endpoint is used to upsert (insert or update) the Step 4 data for the user's enrollment.
    @Post('next')
    @UseGuards(ConsentAcceptedGuard)
    step4(
        @CurrentUser('id') userId: string,
    ) {
        return this.step4Service.complete(userId);
    }
}
