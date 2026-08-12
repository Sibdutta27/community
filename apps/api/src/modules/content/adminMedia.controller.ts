import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';

import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';

import {
    AssignSlotDto,
    ConfirmMediaDto,
    PresignMediaDto,
    UpdateMediaAltDto,
} from './dto/media.dto';

import { MediaService } from './media.service';
import { PublicMediaStorageService } from './publicMediaStorage.service';

/**
 * The Website Studio's media library.
 *
 * Bytes go browser -> public bucket directly via a presigned PUT; the API only
 * ever sees metadata. Admin-gated throughout, and the service independently
 * refuses unknown slot keys and disallowed file types — the UI hiding an
 * option is not a control.
 */
@Controller('admin/content')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard,
)
export class AdminMediaController {

    constructor(
        private readonly mediaService: MediaService,
        private readonly storage: PublicMediaStorageService,
    ) { }

    /**
     * Whether uploads are possible at all.
     *
     * The Studio asks first so it can explain that storage is not set up,
     * rather than offering a file picker that fails on submit.
     */
    @Get('media/status')
    getStatus() {
        return { storageConfigured: this.storage.isConfigured };
    }

    @Get('media')
    listMedia() {
        return this.mediaService.listMedia();
    }

    /**
     * Declared before `media/:id` so the literal segment is not captured as an
     * id.
     */
    @Post('media/presign')
    presignUpload(@Body() body: PresignMediaDto) {
        return this.mediaService.presignUpload(body);
    }

    @Post('media/confirm')
    confirmUpload(
        @Body() body: ConfirmMediaDto,

        @CurrentUser() user?: { id: string },
    ) {
        return this.mediaService.confirmUpload({
            ...body,
            uploadedBy: user?.id ?? null,
        });
    }

    @Patch('media/:id')
    updateAltText(
        @Param('id') id: string,

        @Body() body: UpdateMediaAltDto,
    ) {
        return this.mediaService.updateAltText(id, body);
    }

    /**
     * Every slot the site renders, assigned or not.
     */
    @Get('slots')
    listSlots() {
        return this.mediaService.listSlots();
    }

    @Put('slots/:slotKey')
    assignSlot(
        @Param('slotKey') slotKey: string,

        @Body() body: AssignSlotDto,

        @CurrentUser() user?: { id: string },
    ) {
        return this.mediaService.assignSlot(slotKey, body.mediaId, {
            actorId: user?.id,
        });
    }

    /**
     * Back to the image that shipped in git.
     */
    @Delete('slots/:slotKey')
    clearSlot(@Param('slotKey') slotKey: string) {
        return this.mediaService.clearSlot(slotKey);
    }
}
