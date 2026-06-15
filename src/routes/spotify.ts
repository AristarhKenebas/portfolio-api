import { Hono } from 'hono'
import { db } from '../db'
import { spotifyTokens } from '../db/schema'

export const spotifyRoutes = new Hono()

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

const getBasicAuth = () => {
  const creds = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  return Buffer.from(creds).toString('base64')
}

const getStoredTokens = async () => {
  const rows = await db.select().from(spotifyTokens).limit(1)
  return rows[0] ?? null
}

const saveTokens = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  const expiresAt = String(Date.now() + expiresIn * 1000)
  const existing = await getStoredTokens()

  if (existing) {
    await db.update(spotifyTokens).set({ accessToken, refreshToken, expiresAt })
  } else {
    await db.insert(spotifyTokens).values({ accessToken, refreshToken, expiresAt })
  }
}

const refreshAccessToken = async (refreshToken: string) => {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json() as Record<string, unknown>
  if (data.access_token) {
    await saveTokens(
      data.access_token as string,
      (data.refresh_token as string) ?? refreshToken,
      data.expires_in as number
    )
    return data.access_token as string
  }
  return null
}

const getValidToken = async () => {
  const tokens = await getStoredTokens()
  if (!tokens) return null

  if (Date.now() < Number(tokens.expiresAt) - 60000) {
    return tokens.accessToken
  }

  return refreshAccessToken(tokens.refreshToken)
}

spotifyRoutes.get('/auth', (c) => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: 'user-read-currently-playing user-read-recently-played',
  })

  return c.redirect(`${SPOTIFY_AUTH_URL}?${params}`)
})

spotifyRoutes.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.json({ error: 'No code provided' }, 400)

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  })

  const data = await res.json() as Record<string, unknown>

  if (data.access_token) {
    await saveTokens(
      data.access_token as string,
      data.refresh_token as string,
      data.expires_in as number
    )
    return c.html('<h1>Spotify connected! You can close this tab.</h1>')
  }

  return c.json({ error: 'Failed to get token' }, 400)
})

spotifyRoutes.get('/now-playing', async (c) => {
  const token = await getValidToken()
  if (!token) {
    return c.json({ isPlaying: false, error: 'Not authenticated' })
  }

  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  console.log('Spotify status:', res.status)
  const text = await res.text()
  console.log('Spotify body:', text.slice(0, 200))

  if (res.status === 204 || !text) {
    return c.json({ isPlaying: false })
  }

  try {
    const data = JSON.parse(text) as Record<string, unknown>
    const item = data.item as Record<string, unknown>

    if (!item) return c.json({ isPlaying: false })

    const artists = item.artists as Array<Record<string, unknown>>

    return c.json({
      isPlaying: data.is_playing,
      title: item.name,
      artist: artists.map(a => a.name).join(', '),
      album: (item.album as Record<string, unknown>)?.name,
      albumArt: ((item.album as Record<string, unknown>)?.images as Array<Record<string, unknown>>)?.[0]?.url,
      url: (item.external_urls as Record<string, unknown>)?.spotify,
    })
  } catch {
    return c.json({ isPlaying: false })
  }
})