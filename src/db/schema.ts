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

export const spotifyTokens = pgTable('spotify_tokens', {
  id: serial('id').primaryKey(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: text('expires_at').notNull(),
})