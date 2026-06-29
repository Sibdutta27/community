import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { DatabaseModule } from '@/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService],
  imports: [
    DatabaseModule,
    UserModule
  ]
})
export class ServiceModule {}
