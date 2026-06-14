import { Hono } from 'hono'

export const githubRoutes = new Hono()

githubRoutes.get('/', async (c) => {
  const username = process.env.GITHUB_USERNAME
  if (!username) return c.json({ error: 'GitHub username not configured' }, 500)

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  }

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token') {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const res = await fetch(`https://api.github.com/users/${username}`, { headers })
  const user = await res.json() as Record<string, unknown>

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
    { headers }
  )
  const repos = await reposRes.json() as Array<Record<string, unknown>>

  return c.json({
    username: user.login,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar_url,
    followers: user.followers,
    publicRepos: user.public_repos,
    repos: repos.map(r => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
      updatedAt: r.updated_at,
    }))
  })
})