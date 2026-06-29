import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step2Dto } from './dto/step2.dto';
import { Step2Service } from './step2.service';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step2')
export class Step2Controller {
    constructor(private step2Service: Step2Service) { }

    @Get('/')
    step2Get(
        @CurrentUser('id') userId: string,
    ) {
        return this.step2Service.getMaternalLineages(userId);
    }

    // This endpoint is used to upsert (insert or update) the Step 2 data for the user's enrollment.
    @Post('upsert')
    @UseGuards(ConsentAcceptedGuard)
    step2Upsert(
        @CurrentUser('id') userId: string,
        @Body() dto: Step2Dto,
    ) {
        return this.step2Service.upsert(userId, dto);
    }

    // This endpoint is used to delete a maternal lineage entry.
    @Post('delete/:id')
    @UseGuards(ConsentAcceptedGuard)
    deleteMaternalLineage(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.step2Service.deleteMaternalLineage(userId, id);
    }
}
