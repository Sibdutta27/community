import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { createS3Client } from '@/config/s3.config';

import { buildPublicMediaUrl } from './config';

/**
 * Storage for site images, in a bucket that is separate from the one holding
 * enrollment documents.
 *
 * ## Why a second bucket exists at all
 *
 * `S3_BUCKET` holds birth certificates, social security cards and state IDs.
 * Nothing in it may ever be publicly readable, and its policy must never be
 * touched to make a logo load. Site images are the opposite: they are served
 * to every anonymous visitor on every page. Those two requirements cannot be
 * met by one bucket, so site images get their own — `S3_PUBLIC_BUCKET`,
 * reachable at `S3_PUBLIC_URL`.
 *
 * The constructor refuses to let the process start if the two names match,
 * because that mistake is silent until the day the public bucket is made
 * readable and every identity document in it becomes downloadable.
 *
 * ## Why an unset variable is not an error
 *
 * Neither variable is set in any environment yet. Throwing at boot would take
 * the whole API down for a feature nobody has turned on. Instead the service
 * starts unconfigured, uploads fail with a message that says exactly that, and
 * everything else — the public content read, the entire site — is unaffected.
 */
@Injectable()
export class PublicMediaStorageService {

    private readonly logger = new Logger(PublicMediaStorageService.name);

    private readonly bucket?: string;
    private readonly publicBaseUrl?: string;

    /** Built on first use so an unconfigured deployment never needs S3 credentials. */
    private client?: S3Client;

    constructor(private readonly configService: ConfigService) {

        const privateBucket = this.configService.get<string>('S3_BUCKET')?.trim();
        const publicBucket = this.configService.get<string>('S3_PUBLIC_BUCKET')?.trim();
        const publicBaseUrl = this.configService.get<string>('S3_PUBLIC_URL')?.trim();

        // Fail at boot, loudly, rather than start a process that would publish
        // identity documents the moment the bucket policy was relaxed.
        if (publicBucket && privateBucket && publicBucket === privateBucket) {
            throw new Error(
                `S3_PUBLIC_BUCKET must not be the same bucket as S3_BUCKET (both are "${publicBucket}"). `
                + 'S3_BUCKET holds enrollment identity documents — birth certificates, social security '
                + 'cards and state IDs — and must stay private. Site images need a separate, public '
                + 'bucket. Refusing to start.',
            );
        }

        this.bucket = publicBucket || undefined;
        this.publicBaseUrl = publicBaseUrl || undefined;

        if (!this.isConfigured) {
            this.logger.warn(
                'S3_PUBLIC_BUCKET / S3_PUBLIC_URL are not set — the Website Studio media '
                + 'library is read-only and the site serves the images that shipped in git',
            );
        }
    }

    /**
     * Whether a site image can be uploaded and served.
     *
     * Both halves are required: a bucket with no public URL can be written to
     * but never linked, which is a broken image rather than a working one.
     */
    public get isConfigured(): boolean {
        return Boolean(this.bucket && this.publicBaseUrl);
    }

    /**
     * Refuse the operation with a message an admin can act on.
     */
    public assertConfigured() {
        if (!this.isConfigured) {
            throw new ServiceUnavailableException(
                'Media storage is not configured. Set S3_PUBLIC_BUCKET and S3_PUBLIC_URL '
                + 'on the API to a public bucket that is separate from the private document '
                + 'bucket, then try again.',
            );
        }
    }

    /**
     * A presigned PUT against the PUBLIC bucket, so the browser uploads the
     * bytes directly and they never pass through the API.
     */
    public async createPresignedPutUrl(
        key: string,
        contentType: string,
        expiresInSec = 900,
    ): Promise<string> {

        this.assertConfigured();

        const command = new PutObjectCommand({
            Bucket     : this.bucket,
            Key        : key,
            ContentType: contentType,
        });

        return getSignedUrl(this.s3Client(), command, { expiresIn: expiresInSec });
    }

    /**
     * The URL the public site loads this image from, or `null` when storage is
     * unconfigured — in which case the shipped default is what renders.
     */
    public publicUrlFor(fileKey: string): string | null {
        return buildPublicMediaUrl(this.publicBaseUrl, fileKey);
    }

    private s3Client(): S3Client {
        this.client ??= createS3Client(this.configService);

        return this.client;
    }
}
