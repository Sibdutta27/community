import { Module } from '@nestjs/common';
import { AdminUserController } from './adminUser.controller';
import { AdminUserService } from './adminUser.service';
import { DatabaseModule } from '@/database/database.module';
import { UserModule } from '@/modules/user/user.module';
import { DocumentModule } from '@/modules/document/document.module';

@Module({
    controllers: [
        AdminUserController
    ],
    providers: [
        AdminUserService,
    ],
    imports: [
        DatabaseModule,
        DocumentModule,
        UserModule,
    ],
})
export class AdminUserModule { }