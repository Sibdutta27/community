import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { DatabaseModule } from '@/database/database.module';
import { S3Module } from '@/common/s3/s3.module';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
  imports: [
    DatabaseModule,
    S3Module
  ]
})
export class FeedbackModule { }
