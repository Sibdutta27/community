import { ContentController } from './content.controller';

/**
 * The public read is fronted by Vercel's edge. Any shared-cache directive here
 * outlives a publish: the web app busts its own Data Cache on the revalidate
 * hook, re-fetches, and is handed the SAME stale edge copy — so an edit stays
 * invisible for the life of the header no matter what the hook does.
 *
 * This was a real bug, caught by the cross-app e2e: publish reported success,
 * the endpoint kept returning `{}`, and the site showed the old wording.
 */
describe('ContentController caching', () => {

    function cacheControlOf(methodName: string): string | undefined {
        const headers = Reflect.getMetadata(
            '__headers__',
            ContentController.prototype[methodName],
        ) as { name: string; value: string }[] | undefined;

        return headers?.find(
            (header) => header.name.toLowerCase() === 'cache-control',
        )?.value;
    }

    it('does not let a shared cache outlive a publish', () => {
        const value = cacheControlOf('getMessages') ?? '';

        expect(value).not.toMatch(/s-maxage=[1-9]/);
        expect(value).not.toMatch(/stale-while-revalidate=[1-9]/);
    });

    it('states its caching intent explicitly rather than leaving it to a default', () => {
        expect(cacheControlOf('getMessages')).toBeDefined();
    });
});
