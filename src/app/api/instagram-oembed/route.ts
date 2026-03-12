import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Instagram oEmbed API.
 * GET /api/instagram-oembed?url=<encoded instagram URL>
 *
 * Uses Facebook Graph API oEmbed endpoint.
 * Set INSTAGRAM_ACCESS_TOKEN env var (Facebook App token) for authenticated requests.
 * Falls back to the public endpoint if no token is set.
 */
export async function GET(req: NextRequest) {
  const rawURL = req.nextUrl.searchParams.get("url");

  if (!rawURL || !/instagram\.com\/(?:p|reel|tv)\/[\w-]+/i.test(rawURL)) {
    return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 });
  }

  // Strip query parameters from Instagram URL (e.g. ?img_index=1)
  const cleanURL = rawURL.replace(/\?.*$/, "");

  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    let oembedURL: string;

    if (token) {
      // Authenticated Facebook Graph API endpoint
      oembedURL = `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(cleanURL)}&access_token=${token}&omitscript=true`;
    } else {
      // Public endpoint (may be rate-limited or blocked)
      oembedURL = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanURL)}&omitscript=true`;
    }

    const res = await fetch(oembedURL, {
      headers: { "User-Agent": "Orot/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const status = res.status;
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "Instagram API authentication failed" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Could not fetch Instagram data" },
        { status },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      title: data.title || "",
      thumbnail_url: data.thumbnail_url || null,
      author_name: data.author_name || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 502 },
    );
  }
}
