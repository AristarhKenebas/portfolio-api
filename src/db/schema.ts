import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  email: text('email'),
  telegramUsername: text('telegram_username'),
  discordUsername: text('discord_username'),
  description: text('description').notNull(),
  available: boolean('available').default(true),
  githubUsername: text('github_username'),
  spotifyUsername: text('spotify_username'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').default('other'),
  order: serial('order'),
})

export const currently = pgTable('currently', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'reading', 'learning', 'working_on'
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const githubSettings = pgTable('github_settings', {
  id: serial('id').primaryKey(),
  showStars: boolean('show_stars').default(true),
  showLanguage: boolean('show_language').default(true),
  showUpdatedAt: boolean('show_updated_at').default(true),
  showForks: boolean('show_forks').default(false),
  showDescription: boolean('show_description').default(true),
  reposLimit: serial('repos_limit'),
  showContributions: boolean('show_contributions').default(true),
  showFollowers: boolean('show_followers').default(true),
  showPublicRepos: boolean('show_public_repos').default(true),
  pinnedOnly: boolean('pinned_only').default(false),
})

export const wakatimeSettings = pgTable('wakatime_settings', {
  id: serial('id').primaryKey(),
  provider: text('provider').default('wakatime'), // wakatime | wakapi | hakatime
  apiKey: text('api_key'),
  apiUrl: text('api_url').default('https://wakatime.com/api/v1'),
  enabled: boolean('enabled').default(false),
  showTodayTime: boolean('show_today_time').default(true),
  showTopLanguages: boolean('show_top_languages').default(true),
  showTopProjects: boolean('show_top_projects').default(true),
  languagesLimit: serial('languages_limit'),
  projectsLimit: serial('projects_limit'),
})

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url'),
  tags: text('tags').array(),
  featured: boolean('featured').default(true),
  order: serial('order'),
  stars: integer('stars'),
  forks: integer('forks'),
  language: text('language'),
  repoUpdatedAt: timestamp('repo_updated_at'),
})

export const projectDisplaySettings = pgTable('project_display_settings', {
  id: serial('id').primaryKey(),
  showStars: boolean('show_stars').default(true),
  showForks: boolean('show_forks').default(true),
  showLanguage: boolean('show_language').default(true),
  showUpdatedAt: boolean('show_updated_at').default(true),
})