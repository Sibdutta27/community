import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ActivityGuard } from './guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { DocumentType } from '@/generated/prisma/enums';
import { DocumentService } from '../document/document.service';

@Controller('user')
@UseGuards(
    JwtAuthGuard,
    ActivityGuard
)
export class UserController {
    constructor(private userService: UserService, private documentService: DocumentService) { }

    // ---------------- UPLOAD PROFILE PHOTO ----------------
    @Post('upload-profile-photo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @CurrentUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        // Upload the document
        return this.documentService.saveUserDocument(
            userId,
            DocumentType.PROFILE_PICTURE,
            file,
        );
    }
}
