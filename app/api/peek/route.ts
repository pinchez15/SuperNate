import { peekHosts } from "@/lib/sites"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Some of Nate's homepages send X-Frame-Options: DENY. This route fetches one
 * of those allowlisted homepages and serves it same-origin for the in-game browser.
 */
export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url")?.trim() ?? ""
  const host = peekHosts.get(target)
  if (!host) {
    return new NextResponse("That page is not on the list.", { status: 400 })
  }

  try {
    const upstream = await fetch(target, {
      redirect: "follow",
      headers: {
        accept: "text/html",
        "user-agent": "Mozilla/5.0 (compatible; SuperNate64/1.0)",
      },
    })
    if (new URL(upstream.url).host !== host) {
      return new NextResponse("That page wandered off.", { status: 400 })
    }
    const html = await upstream.text()
    const base = `https://${host}/`
    const stripped = html.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "")
    const withBase = /<head[^>]*>/i.test(stripped)
      ? stripped.replace(/<head([^>]*)>/i, `<head$1><base href="${base}">`)
      : `<head><base href="${base}"></head>${stripped}`

    return new NextResponse(withBase, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=120",
        "x-frame-options": "SAMEORIGIN",
      },
    })
  } catch {
    return new NextResponse("The site did not pick up.", { status: 502 })
  }
}
