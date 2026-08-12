import { Controller, Get, Header } from '@nestjs/common';

import { ContentService } from './content.service';

/**
 * The public content read.
 *
 * Deliberately unauthenticated: it is fetched by the web app's i18n request
 * config behind every page render, including for signed-out visitors. It
 * returns only published overrides for keys that are still editable and live,
 * so it can never leak a draft.
 *
 * Deliberately NOT edge-cached. An earlier version set
 * `s-maxage=60, stale-while-revalidate=600`, which quietly defeated the whole
 * publish flow: the web app busts its own Data Cache on the revalidate hook,
 * re-fetches, and Vercel hands back the SAME stale copy — so a published edit
 * stayed invisible for up to ten minutes while every layer reported success.
 *
 * Caching belongs one level up, in the web app's Data Cache, because that is
 * the layer the publish hook can actually invalidate. The load here is one
 * small query per revalidation per region, not one per page view.
 */
@Controller('content')
export class ContentController {

    constructor(private readonly contentService: ContentService) { }

    @Get('messages')
    @Header('Cache-Control', 'no-store')
    async getMessages() {
        return this.contentService.getPublishedMessages();
    }
}
