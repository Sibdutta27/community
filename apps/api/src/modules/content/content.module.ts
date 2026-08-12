import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { ContentController } from './content.controller';
import { AdminContentController } from './adminContent.controller';
import { AdminTerritoryController } from './adminTerritory.controller';
import { ContentService } from './content.service';
import { TerritoryService } from './territory.service';

/**
 * Site content for the Website Studio.
 *
 * Every controller shares one `ContentService` on purpose — the public read and
 * the admin writes must agree on what "published" means, and splitting them is
 * how a draft ends up served to the public. `TerritoryService` sits alongside
 * it for the same reason: territory overrides go out on the same public
 * payload, so they must bust the same cache.
 */
@Module({
    controllers: [
        ContentController,
        AdminContentController,
        AdminTerritoryController,
    ],
    providers: [
        ContentService,
        TerritoryService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class ContentModule { }
