import { Hono } from 'hono'
import { db } from '../db'
import { wakatimeSettings } from '../db/schema'

export const wakatimeRoutes = new Hono()

const getSettings = async () => {
  const rows = await db.select().from(wakatimeSettings).limit(1)
  return rows[0] ?? null
}

const fetchWaka = async (path: string, apiKey: string, apiUrl: string): Promise<any> => {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
    }
  })
  if (!res.ok) return null
  return res.json()
}

wakatimeRoutes.get('/stats', async (c) => {
  const settings = await getSettings()
  if (!settings?.enabled || !settings.apiKey) {
    return c.json({ enabled: false })
  }

  const apiUrl = settings.apiUrl ?? 'https://wakatime.com/api/v1'
  const apiKey = settings.apiKey

  const [summary, languages, projects] = await Promise.all([
    fetchWaka('/users/current/summaries?range=today', apiKey, apiUrl),
    fetchWaka('/users/current/stats/last_7_days', apiKey, apiUrl),
    fetchWaka('/users/current/projects', apiKey, apiUrl),
  ])

  const todaySeconds = summary?.data?.[0]?.grand_total?.total_seconds ?? 0
  const hours = Math.floor(todaySeconds / 3600)
  const minutes = Math.floor((todaySeconds % 3600) / 60)

  return c.json({
    enabled: true,
    provider: settings.provider,
    today: {
      seconds: todaySeconds,
      human: `${hours}h ${minutes}m`,
    },
    languages: settings.showTopLanguages
      ? (languages?.data?.languages ?? [])
          .slice(0, settings.languagesLimit || 5)
          .map((l: any) => ({ name: l.name, percent: l.percent, hours: l.hours, minutes: l.minutes }))
      : [],
    projects: settings.showTopProjects
      ? (projects?.data ?? [])
          .slice(0, settings.projectsLimit || 5)
          .map((p: any) => ({ name: p.name, url: p.repository?.html_url }))
      : [],
  })
})

wakatimeRoutes.get('/settings', async (c) => {
  const settings = await getSettings()
  return c.json(settings ?? {})
})

wakatimeRoutes.patch('/settings', async (c) => {
  const body = await c.req.json()
  const existing = await getSettings()

  if (existing) {
    const updated = await db.update(wakatimeSettings).set(body).returning()
    return c.json(updated[0])
  }

  const created = await db.insert(wakatimeSettings).values(body).returning()
  return c.json(created[0])
})