import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { ContentController } from './content.controller';
import { AdminContentController } from './adminContent.controller';
import { ContentService } from './content.service';

/**
 * Site content for the Website Studio.
 *
 * Both controllers share one service on purpose — the public read and the
 * admin writes must agree on what "published" means, and splitting them is how
 * a draft ends up served to the public.
 */
@Module({
    controllers: [
        ContentController,
        AdminContentController,
    ],
    providers: [
        ContentService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class ContentModule { }
