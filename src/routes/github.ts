import { Hono } from 'hono'
import { db } from '../db'
import { githubSettings } from '../db/schema'
import { authMiddleware } from '../middleware/auth'

export const githubRoutes = new Hono()

const getSettings = async () => {
  const rows = await db.select().from(githubSettings).limit(1)
  return rows[0] ?? null
}

githubRoutes.get('/', async (c) => {
  const username = process.env.GITHUB_USERNAME
  if (!username) return c.json({ error: 'GitHub username not configured' }, 500)

  const settings = await getSettings()

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const limit = settings?.reposLimit || 6

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`, { headers })
  ])

  const user = await userRes.json() as Record<string, unknown>
  const reposData = await reposRes.json()
  const repos = Array.isArray(reposData) ? reposData : []

  const filteredRepos = repos.map(r => {
    const repo: Record<string, unknown> = {
      name: r.name,
      url: r.html_url,
    }

    if (settings?.showDescription !== false) repo.description = r.description
    if (settings?.showStars !== false) repo.stars = r.stargazers_count
    if (settings?.showLanguage !== false) repo.language = r.language
    if (settings?.showForks) repo.forks = r.forks_count
    if (settings?.showUpdatedAt !== false) repo.updatedAt = r.updated_at

    return repo
  })

  const response: Record<string, unknown> = {
    username: user.login,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar_url,
  }

  if (settings?.showFollowers !== false) response.followers = user.followers
  if (settings?.showPublicRepos !== false) response.publicRepos = user.public_repos
  response.repos = filteredRepos

  return c.json(response)
})

githubRoutes.get('/contributions', async (c) => {
  const settings = await getSettings()
  if (settings?.showContributions === false) {
    return c.json({ error: 'Contributions disabled' }, 200)
  }
  const username = process.env.GITHUB_USERNAME
  const token = process.env.GITHUB_TOKEN

  if (!username || !token) {
    return c.json({ error: 'GitHub token not configured' }, 500)
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  })

  if (!res.ok) {
    return c.json({ error: 'GitHub GraphQL request failed' }, 502)
  }

  const data = await res.json() as any
  const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar

  if (!calendar) {
    return c.json({ error: 'No contribution data' }, 502)
  }

  return c.json({
    total: calendar.totalContributions,
    weeks: calendar.weeks,
  })
})

githubRoutes.get('/raw-repos', authMiddleware, async (c) => {
  const username = process.env.GITHUB_USERNAME
  if (!username) return c.json({ error: 'GitHub username not configured' }, 500)

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers })
  const reposData = await res.json()
  const repos = Array.isArray(reposData) ? reposData : []

  const mapped = repos.map(r => ({
    name: r.name,
    description: r.description ?? '',
    url: r.html_url,
    language: r.language ?? null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    repoUpdatedAt: r.updated_at ? new Date(r.updated_at) : null,
  }))

  return c.json({ repos: mapped })
})