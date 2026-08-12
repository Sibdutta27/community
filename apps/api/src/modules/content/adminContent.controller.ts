import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';

import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';

import { ContentService } from './content.service';
import { SaveContentDraftDto } from './dto/saveContentDraft.dto';

/**
 * The Website Studio's write surface.
 *
 * Every route is admin-gated, and the service independently refuses key paths
 * outside the editable namespaces — hiding them in the UI is not a control.
 */
@Controller('admin/content')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard,
)
export class AdminContentController {

    constructor(private readonly contentService: ContentService) { }

    /**
     * Every editable key with its default and any draft/published override.
     */
    @Get('keys')
    async getKeys(
        @Query('namespace') namespace?: string,
    ) {
        return this.contentService.getEditableKeys(namespace);
    }

    @Get('revisions')
    async getRevisions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.contentService.getRevisions({
            page : Number(page) || 1,
            limit: Number(limit) || 20,
        });
    }

    /**
     * Publish every pending draft. Declared before the `:keyPath` routes so
     * the literal segment is not captured as a key path.
     */
    @Post('publish')
    async publish(
        @CurrentUser() user?: { id: string; email?: string },
    ) {
        return this.contentService.publish({
            actorId   : user?.id,
            actorEmail: user?.email,
        });
    }

    @Post('discard')
    async discardDrafts() {
        return this.contentService.discardDrafts();
    }

    /**
     * Save a draft edit for one key. Key paths contain dots but no slashes, so
     * a single segment holds them without encoding.
     */
    @Put('strings/:keyPath')
    async saveDraft(
        @Param('keyPath') keyPath: string,

        @Body() body: SaveContentDraftDto,

        @CurrentUser() user?: { id: string },
    ) {
        return this.contentService.saveDraft(keyPath, {
            en     : body.en,
            es     : body.es,
            actorId: user?.id,
        });
    }

    /**
     * Drop the override — the key returns to its shipped default.
     */
    @Delete('strings/:keyPath')
    async revert(
        @Param('keyPath') keyPath: string,

        @CurrentUser() user?: { id: string; email?: string },
    ) {
        return this.contentService.revert(keyPath, {
            actorId   : user?.id,
            actorEmail: user?.email,
        });
    }
}
