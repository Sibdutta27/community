import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Allow `next/image` to optimize images served from the Website Studio's
 * public media bucket.
 *
 * Driven by `S3_PUBLIC_URL` — the same variable the API signs uploads against
 * — so the two cannot drift into a state where an admin can upload an image
 * the site then refuses to render.
 *
 * Returns nothing when the variable is unset (which is every environment
 * today) or unparseable. That is the normal case, not a failure: with no
 * remote host configured, every slot resolves to a path under `public/` and no
 * pattern is needed. Throwing here would take the whole build down over an
 * optional feature.
 */
function publicMediaRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const publicUrl = process.env.S3_PUBLIC_URL?.trim();

  if (!publicUrl) {
    return [];
  }

  try {
    const { protocol, hostname, port, pathname } = new URL(publicUrl);

    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        ...(port ? { port } : {}),
        // Scoped to the configured path so this cannot become a general
        // "optimize anything on that host" allowance.
        pathname: `${pathname.replace(/\/+$/, "")}/**`,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.138.221.214"],

  images: {
    remotePatterns: publicMediaRemotePatterns(),
  },
};

export default withNextIntl(nextConfig);
