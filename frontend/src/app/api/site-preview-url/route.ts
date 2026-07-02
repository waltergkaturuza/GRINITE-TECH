import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')?.trim()
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&viewport.width=1200&viewport.height=630`,
      {
        headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' },
        signal: AbortSignal.timeout(55_000),
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Preview service unavailable' }, { status: 502 })
    }

    const payload = (await response.json()) as {
      data?: { screenshot?: { url?: string } }
    }
    const screenshotUrl = payload.data?.screenshot?.url
    if (!screenshotUrl) {
      return NextResponse.json({ error: 'No preview URL returned' }, { status: 502 })
    }

    return NextResponse.json(
      { url: screenshotUrl },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      },
    )
  } catch {
    return NextResponse.json({ error: 'Preview capture timed out' }, { status: 504 })
  }
}
