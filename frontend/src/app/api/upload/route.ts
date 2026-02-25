import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
]

export async function POST(request: NextRequest) {
  try {
    const pathname = request.headers.get('X-Blob-Path')
    if (!pathname) {
      return NextResponse.json({ error: 'X-Blob-Path header required' }, { status: 400 })
    }

    const body = await request.blob()
    const contentType = request.headers.get('content-type') || 'application/octet-stream'
    const size = body.size

    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    if (contentType && !ALLOWED_TYPES.includes(contentType) && !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const blob = await put(pathname, body, {
      access: 'public',
      contentType: contentType !== 'application/octet-stream' ? contentType : undefined,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
