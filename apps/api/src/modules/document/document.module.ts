import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DatabaseModule } from '@/database/database.module';
import { S3Module } from '@/common/s3/s3.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
  imports: [
    DatabaseModule,
    S3Module
  ]
})
export class DocumentModule { }
