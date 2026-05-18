import { Module } from '@nestjs/common';
import { AdminConsentController } from './adminConsent.controller';
import { AdminConsentService } from './adminConsent.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
    controllers: [
        AdminConsentController
    ],
    providers: [
        AdminConsentService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class AdminConsentModule { }