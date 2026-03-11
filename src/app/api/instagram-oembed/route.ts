import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Instagram oEmbed API.
 * GET /api/instagram-oembed?url=<encoded instagram URL>
 *
 * Uses the public oEmbed endpoint (no access token required).
 * Returns { title, thumbnail_url, author_name } on success.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !/instagram\.com\/(?:p|reel|tv)\/[\w-]+/i.test(url)) {
    return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 });
  }

  try {
    const oembedURL = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;
    const res = await fetch(oembedURL, {
      headers: { "User-Agent": "Orot/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch Instagram data" },
        { status: res.status },
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
