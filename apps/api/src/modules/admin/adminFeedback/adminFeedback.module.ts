import { Module } from '@nestjs/common';
import { AdminFeedbackController } from './adminFeedback.controller';
import { AdminFeedbackService } from './adminFeedback.service';
import { DatabaseModule } from '@/database/database.module';
import { S3Module } from '@/common/s3/s3.module';

@Module({
    controllers: [
        AdminFeedbackController
    ],
    providers: [
        AdminFeedbackService,
    ],
    imports: [
        DatabaseModule,
        S3Module,
    ],
})
export class AdminFeedbackModule { }
