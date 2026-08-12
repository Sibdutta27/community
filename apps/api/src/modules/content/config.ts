const MB = 1024 * 1024;

/**
 * What the media library accepts for a site image.
 *
 * Raster only. Every entry here is a format a browser decodes as pixels and
 * cannot execute.
 */
export const MEDIA_ALLOWED_MIME = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
] as const;

/**
 * 4 MB. Well above a sensibly exported hero image and far below the point
 * where a page becomes unusable on a phone — these images are served to every
 * visitor on the public site, not downloaded on demand like a document.
 */
export const MEDIA_MAX_FILE_SIZE = 4 * MB;

/**
 * SVG is refused deliberately, and the message says so.
 *
 * An SVG is an XML document that may carry `<script>` and event handlers. One
 * served from a public origin the site trusts is stored XSS, and the site's
 * actual SVGs are design-system icons that belong in git next to the
 * components that use them.
 */
export const SVG_MIME_TYPES = ['image/svg+xml', 'image/svg'] as const;

export const SVG_REJECTION_MESSAGE =
    'SVG files are not accepted here: an SVG can carry script and would run on '
    + 'the public site. The site\'s SVGs are design-system icons that live in '
    + 'the code — ask a developer to add or change one. Upload a JPEG, PNG, '
    + 'WebP or AVIF instead.';

/**
 * The storage prefix every site image lives under, inside the PUBLIC bucket.
 *
 * Both halves of the presign/confirm pair check it, so a confirm can only ever
 * register an object the presign step could have created.
 */
export const MEDIA_KEY_PREFIX = 'site-media/';

/** How long a presigned media PUT stays valid. */
export const MEDIA_PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS = 15 * 60;

/**
 * The image slots the site renders — a mirror of
 * `apps/web/src/content/media-slots.ts`.
 *
 * The web registry is authoritative: there it is simultaneously the allowlist
 * and the shipped fallback, so a slot missing from the database can never
 * produce a broken image. This mirror exists for two things the web app cannot
 * do from here — refuse an unknown slot key at the API boundary, and describe
 * each slot to the person choosing an image in the admin panel.
 *
 * Keep `defaultPath` in step with the web registry. It is shown as text, never
 * loaded, so a stale entry is a misleading caption rather than a broken page —
 * but it is still a lie, so update both together.
 */
export const MEDIA_SLOTS = {
    'brand.logo': {
        label      : 'Site logo',
        description: 'The seal in the navigation bar, the footer and on member ID cards.',
        defaultPath: '/images/logo.png',
    },
    'home.hero.portrait.1': {
        label      : 'Homepage hero — portrait 1',
        description: 'First of the three member faces beneath the homepage headline.',
        defaultPath: '/images/member1.png',
    },
    'home.hero.portrait.2': {
        label      : 'Homepage hero — portrait 2',
        description: 'Second of the three member faces beneath the homepage headline.',
        defaultPath: '/images/member2.png',
    },
    'home.hero.portrait.3': {
        label      : 'Homepage hero — portrait 3',
        description: 'Third of the three member faces beneath the homepage headline.',
        defaultPath: '/images/member3.png',
    },
    'home.guainiaMap': {
        label      : 'Homepage — Guainía map',
        description: 'The full-width map band on the homepage.',
        defaultPath: '/images/guainia-map.svg',
    },
    'about.story': {
        label      : 'About page — story image',
        description: 'The large image beside "our story" on the About page.',
        defaultPath: '/images/taino-nature.svg',
    },
    'yucayeke.mapIllustration': {
        label      : 'Homepage — yukayeke illustration',
        description: 'The illustrated map in the yukayeke section of the homepage.',
        defaultPath: '/images/yucayeke-map.svg',
    },
} as const;

export const MEDIA_SLOT_KEYS = Object.keys(MEDIA_SLOTS) as Array<
    keyof typeof MEDIA_SLOTS
>;

export type MediaSlotKey = keyof typeof MEDIA_SLOTS;

export function isMediaSlotKey(candidate: string): candidate is MediaSlotKey {
    return (MEDIA_SLOT_KEYS as readonly string[]).includes(candidate);
}

/**
 * Public URL for a stored media key, or `null` when public media storage is
 * not configured.
 *
 * `null` is a first-class answer, not an error: with no `S3_PUBLIC_URL` there
 * is no URL to serve, and the site falls back to the image that shipped in
 * git. A half-built URL would render as a broken image instead.
 */
export function buildPublicMediaUrl(
    publicBaseUrl: string | undefined | null,
    fileKey: string,
): string | null {

    const base = publicBaseUrl?.trim().replace(/\/+$/, '');

    if (!base || !fileKey) {
        return null;
    }

    return `${base}/${fileKey.replace(/^\/+/, '')}`;
}
