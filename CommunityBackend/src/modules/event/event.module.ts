import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { DatabaseModule } from '@/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [EventService],
  controllers: [EventController],
  imports: [
    DatabaseModule,
    UserModule
  ]
})
export class EventModule { }
