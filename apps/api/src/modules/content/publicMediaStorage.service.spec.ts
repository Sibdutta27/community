import { ServiceUnavailableException } from '@nestjs/common';

import { PublicMediaStorageService } from './publicMediaStorage.service';

/** A ConfigService stand-in backed by a plain map. */
function configOf(values: Record<string, string | undefined>) {
    return {
        get      : (key: string) => values[key],
        getOrThrow: (key: string) => {
            const value = values[key];
            if (value === undefined) throw new Error(`Missing ${key}`);
            return value;
        },
    } as never;
}

const PRIVATE_BUCKET = 'community';

describe('PublicMediaStorageService — bucket separation', () => {

    // The single most dangerous mistake in this feature. S3_BUCKET holds
    // birth certificates, social security cards and state IDs. Pointing the
    // public site-image bucket at it would publish every enrollment document
    // the moment someone made that bucket readable.
    it('refuses to start when the public bucket is the private document bucket', () => {
        expect(
            () => new PublicMediaStorageService(configOf({
                S3_BUCKET       : PRIVATE_BUCKET,
                S3_PUBLIC_BUCKET: PRIVATE_BUCKET,
                S3_PUBLIC_URL   : 'https://cdn.example.org',
            })),
        ).toThrow(/S3_PUBLIC_BUCKET/);
    });

    it('names the identity documents at risk so the message cannot be skimmed past', () => {
        expect(
            () => new PublicMediaStorageService(configOf({
                S3_BUCKET       : PRIVATE_BUCKET,
                S3_PUBLIC_BUCKET: PRIVATE_BUCKET,
            })),
        ).toThrow(/identity document/i);
    });

    it('starts normally when the two buckets differ', () => {
        const service = new PublicMediaStorageService(configOf({
            S3_BUCKET       : PRIVATE_BUCKET,
            S3_PUBLIC_BUCKET: 'community-site-media',
            S3_PUBLIC_URL   : 'https://cdn.example.org',
        }));

        expect(service.isConfigured).toBe(true);
    });
});

describe('PublicMediaStorageService — unconfigured', () => {

    // Neither variable is set in any environment yet. Booting must still
    // succeed: the media library is one tab in the admin panel, and the whole
    // public site reads through the same module.
    it('starts without either variable set', () => {
        const service = new PublicMediaStorageService(configOf({
            S3_BUCKET: PRIVATE_BUCKET,
        }));

        expect(service.isConfigured).toBe(false);
    });

    it('is unconfigured when the bucket is set but the public URL is not', () => {
        const service = new PublicMediaStorageService(configOf({
            S3_BUCKET       : PRIVATE_BUCKET,
            S3_PUBLIC_BUCKET: 'community-site-media',
        }));

        expect(service.isConfigured).toBe(false);
    });

    it('answers a presign request with a clear explanation rather than a crash', async () => {
        const service = new PublicMediaStorageService(configOf({
            S3_BUCKET: PRIVATE_BUCKET,
        }));

        await expect(
            service.createPresignedPutUrl('site-media/x.png', 'image/png'),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        await expect(
            service.createPresignedPutUrl('site-media/x.png', 'image/png'),
        ).rejects.toThrow(/media storage is not configured/i);
    });

    it('has no public URL to hand out for a stored key', () => {
        const service = new PublicMediaStorageService(configOf({
            S3_BUCKET: PRIVATE_BUCKET,
        }));

        expect(service.publicUrlFor('site-media/x.png')).toBeNull();
    });
});

describe('PublicMediaStorageService.publicUrlFor', () => {

    function configured(publicUrl: string) {
        return new PublicMediaStorageService(configOf({
            S3_BUCKET       : PRIVATE_BUCKET,
            S3_PUBLIC_BUCKET: 'community-site-media',
            S3_PUBLIC_URL   : publicUrl,
        }));
    }

    it('joins the base URL and the key', () => {
        expect(configured('https://cdn.example.org').publicUrlFor('site-media/a.png'))
            .toBe('https://cdn.example.org/site-media/a.png');
    });

    // A trailing slash in the env var is the most likely way this is typed by
    // hand, and `//` breaks the object path on some CDNs.
    it('tolerates a trailing slash on the configured base URL', () => {
        expect(configured('https://cdn.example.org/').publicUrlFor('site-media/a.png'))
            .toBe('https://cdn.example.org/site-media/a.png');
    });
});
