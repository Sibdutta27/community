import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step2Dto } from './dto/step2.dto';
import { Step2SaveDraftDto } from './dto/step2SaveDraft.dto';
import { Step2Service } from './step2.service';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step2')
export class Step2Controller {
    constructor(private step2Service: Step2Service) { }

    // Prefill: fetch the user's maternal kinship (mother + grandparents).
    @Get('/')
    step2Get(
        @CurrentUser('id') userId: string,
    ) {
        return this.step2Service.getMaternalKinship(userId);
    }

    // Upsert the Step 2 (Maternal Kinship) data for the user's enrollment.
    @Post('upsert')
    @UseGuards(ConsentAcceptedGuard)
    step2Upsert(
        @CurrentUser('id') userId: string,
        @Body() dto: Step2Dto,
    ) {
        return this.step2Service.upsert(userId, dto);
    }

    // Partial draft save ("Save & finish later") — no required-field
    // validation, never marks the step complete.
    @Post('save-draft')
    @UseGuards(ConsentAcceptedGuard)
    step2SaveDraft(
        @CurrentUser('id') userId: string,
        @Body() dto: Step2SaveDraftDto,
    ) {
        return this.step2Service.saveDraft(userId, dto);
    }
}
