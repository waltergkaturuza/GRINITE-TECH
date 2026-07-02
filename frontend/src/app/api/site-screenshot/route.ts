import { NextRequest, NextResponse } from 'next/server'

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

  const encoded = encodeURIComponent(url)
  const providers = [
    `https://s0.wp.com/mshots/v1/${encoded}?w=1200&h=630`,
    `https://image.thum.io/get/width/1200/crop/630/noanimate/${url}`,
  ]

  for (const providerUrl of providers) {
    try {
      const response = await fetch(providerUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' },
      })

      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.startsWith('image/')) continue

      const imageBuffer = await response.arrayBuffer()
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'Unable to capture site preview' }, { status: 502 })
}
