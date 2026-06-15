import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  available: boolean('available').default(true),
  githubUsername: text('github_username'),
  spotifyUsername: text('spotify_username'),
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