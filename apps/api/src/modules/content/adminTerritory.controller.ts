import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';

import { SaveTerritoryOverrideDto } from './dto/saveTerritoryOverride.dto';
import { TerritoryService } from './territory.service';

/**
 * The Website Studio's Yukayeke tab.
 *
 * A sibling of `AdminContentController` rather than more routes on it: the copy
 * pipeline is keyed by message path and has a draft/publish queue, while a
 * territory is a record keyed by slug that goes live on save. Sharing a
 * controller would mean sharing neither.
 *
 * Admin-gated, and the service independently refuses an unknown slug or an
 * unrenderable status — hiding them in the UI is not a control.
 */
@Controller('admin/content/territories')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard,
)
export class AdminTerritoryController {

    constructor(private readonly territoryService: TerritoryService) { }

    /**
     * Every territory with the values the code ships and any stored override.
     */
    @Get()
    async list() {
        return this.territoryService.listTerritories();
    }

    @Put(':slug')
    async save(
        @Param('slug') slug: string,

        @Body() body: SaveTerritoryOverrideDto,

        @CurrentUser() user?: { id: string; email?: string },
    ) {
        return this.territoryService.saveOverride(slug, body, {
            actorId   : user?.id,
            actorEmail: user?.email,
        });
    }

    /**
     * Drop the override — the territory returns to the values in the code.
     */
    @Delete(':slug')
    async revert(
        @Param('slug') slug: string,

        @CurrentUser() user?: { id: string; email?: string },
    ) {
        return this.territoryService.revert(slug, {
            actorId   : user?.id,
            actorEmail: user?.email,
        });
    }
}
