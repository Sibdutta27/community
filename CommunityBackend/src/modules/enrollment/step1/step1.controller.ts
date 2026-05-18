import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Step1Dto } from './dto/step1.dto';
import { Step1Service } from './step1.service';


@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment/step1')
export class Step1Controller {
    constructor(private step1Service: Step1Service) { }

    @Get('/')
    step1Get(
        @CurrentUser('id') userId: string,
    ) {
        return this.step1Service.getStep1(userId);
    }

    @Post('upsert')
    @UseGuards(ConsentAcceptedGuard)
    step1Upsert(
        @CurrentUser('id') userId: string,
        @Body() dto: Step1Dto,
    ) {
        return this.step1Service.upsert(userId, dto);
    }
}
