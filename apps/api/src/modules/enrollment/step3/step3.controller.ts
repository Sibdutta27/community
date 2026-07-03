import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step3Service } from './step3.service';
import { Step3Dto } from './dto/step3.dto';
import { Step3SaveDraftDto } from './dto/step3SaveDraft.dto';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step3')
export class Step3Controller {
    constructor(private step3Service: Step3Service) { }

    // Prefill: fetch the user's paternal kinship (father + grandparents).
    @Get('/')
    step3Get(
        @CurrentUser('id') userId: string,
    ) {
        return this.step3Service.getPaternalKinship(userId);
    }

    // Upsert the Step 3 (Paternal Kinship) data for the user's enrollment.
    @Post('upsert')
    @UseGuards(ConsentAcceptedGuard)
    step3(
        @CurrentUser('id') userId: string,
        @Body() dto: Step3Dto,
    ) {
        return this.step3Service.upsert(userId, dto);
    }

    // Partial draft save ("Save & finish later") — no required-field
    // validation, never marks the step complete.
    @Post('save-draft')
    @UseGuards(ConsentAcceptedGuard)
    step3SaveDraft(
        @CurrentUser('id') userId: string,
        @Body() dto: Step3SaveDraftDto,
    ) {
        return this.step3Service.saveDraft(userId, dto);
    }
}
