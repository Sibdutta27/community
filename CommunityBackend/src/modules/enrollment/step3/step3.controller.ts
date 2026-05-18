import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step3Service } from './step3.service';
import { Step3Dto } from './dto/step3.dto';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step3')
export class Step3Controller {
    constructor(private step3Service: Step3Service) { }

    // This endpoint is used to fetch the list of cultural connections that the user can select from in Step 3 of the enrollment process.
    @Get('cultural-connection-list')
    getCulturalConnectionList() {
        return this.step3Service.getCulturalConnectionList();
    }

    // Get all cultural connections for the user. This is used to pre-populate the Step 3 form if the user has already filled it out before.
    @Get('/')
    step3Get(
        @CurrentUser('id') userId: string,
    ) {
        return this.step3Service.getSelectedCulturalConnections(userId);
    }

    // This endpoint is used to upsert (insert or update) the Step 3 data for the user's enrollment.
    @Post('upsert')
    @UseGuards(ConsentAcceptedGuard)
    step3(
        @CurrentUser('id') userId: string,
        @Body() dto: Step3Dto,
    ) {
        return this.step3Service.upsert(userId, dto);
    }
}
