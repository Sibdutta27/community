import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { ContentController } from './content.controller';
import { AdminContentController } from './adminContent.controller';
import { AdminTerritoryController } from './adminTerritory.controller';
import { AdminMediaController } from './adminMedia.controller';
import { ContentService } from './content.service';
import { TerritoryService } from './territory.service';
import { MediaService } from './media.service';
import { PublicMediaStorageService } from './publicMediaStorage.service';

/**
 * Site content for the Website Studio — copy, territories and images.
 *
 * The controllers share their services on purpose: the public read and the
 * admin writes must agree on what "published" means, and splitting them is how
 * a draft ends up served to the public. `TerritoryService` and `MediaService`
 * sit alongside `ContentService` for the same reason — all three feed the one
 * `/content/messages` payload, so they must bust the same cache.
 *
 * `PublicMediaStorageService` is instantiated at boot and refuses to start if
 * the public image bucket is the same bucket that holds enrollment identity
 * documents. That check belongs at startup, not at upload time — a
 * misconfiguration should never reach a running process.
 */
@Module({
    controllers: [
        ContentController,
        AdminContentController,
        AdminTerritoryController,
        AdminMediaController,
    ],
    providers: [
        ContentService,
        TerritoryService,
        MediaService,
        PublicMediaStorageService,
    ],
    imports: [
        DatabaseModule,
    ],
})
export class ContentModule { }
