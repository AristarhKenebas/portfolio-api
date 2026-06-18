import { Hono } from 'hono'

export const youtubeRoutes = new Hono()

const BASE = 'https://www.googleapis.com/youtube/v3'

youtubeRoutes.get('/image-proxy', async (c) => {
  const url = c.req.query('url')
  
  if (!url) {
    return c.json({ error: 'URL is required' }, 400)
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image')
    
    const arrayBuffer = await response.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        // Кэшируем картинку в браузере на 24 часа (86400 секунд)
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return c.json({ error: 'Image proxy failed' }, 500)
  }
})

youtubeRoutes.get('/', async (c) => {
  const key = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  if (!key || !channelId) {
    return c.json({ error: 'YouTube not configured' }, 500)
  }

  const [channelRes, videosRes] = await Promise.all([
    fetch(`${BASE}/channels?part=snippet,statistics&id=${channelId}&key=${key}`),
    fetch(`${BASE}/search?part=snippet&channelId=${channelId}&order=date&maxResults=6&type=video&key=${key}`)
  ])

  const channelData = await channelRes.json() as any
  const videosData = await videosRes.json() as any

  const channel = channelData.items?.[0]
  if (!channel) return c.json({ error: 'Channel not found' }, 404)

  const videos = (videosData.items ?? []).map((v: any) => ({
    id: v.id.videoId,
    title: v.snippet.title,
    description: v.snippet.description,
    thumbnail: v.snippet.thumbnails?.medium?.url,
    publishedAt: v.snippet.publishedAt,
    url: `https://youtube.com/watch?v=${v.id.videoId}`,
  }))

  return c.json({
    name: channel.snippet.title,
    description: channel.snippet.description,
    avatar: channel.snippet.thumbnails?.medium?.url,
    subscribers: channel.statistics.subscriberCount,
    views: channel.statistics.viewCount,
    videoCount: channel.statistics.videoCount,
    url: `https://youtube.com/channel/${channelId}`,
    videos,
  })
})