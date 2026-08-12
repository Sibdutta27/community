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
 * The cache header is load-bearing — the API runs serverless with no shared
 * in-process cache, so the edge is what stops this becoming a database query
 * per page view. The web app caches on top of it as well.
 */
@Controller('content')
export class ContentController {

    constructor(private readonly contentService: ContentService) { }

    @Get('messages')
    @Header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
    async getMessages() {
        return this.contentService.getPublishedMessages();
    }
}
