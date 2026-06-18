CREATE TABLE "currently" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "github_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"show_stars" boolean DEFAULT true,
	"show_language" boolean DEFAULT true,
	"show_updated_at" boolean DEFAULT true,
	"show_forks" boolean DEFAULT false,
	"show_description" boolean DEFAULT true,
	"repos_limit" serial NOT NULL,
	"show_contributions" boolean DEFAULT true,
	"show_followers" boolean DEFAULT true,
	"show_public_repos" boolean DEFAULT true,
	"pinned_only" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"email" text,
	"telegram_username" text,
	"discord_username" text,
	"description" text NOT NULL,
	"available" boolean DEFAULT true,
	"github_username" text,
	"spotify_username" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text,
	"tags" text[],
	"featured" boolean DEFAULT true,
	"order" serial NOT NULL,
	"stars" integer DEFAULT 0,
	"forks" integer DEFAULT 0,
	"language" text,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'other',
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wakatime_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'wakatime',
	"api_key" text,
	"api_url" text DEFAULT 'https://wakatime.com/api/v1',
	"enabled" boolean DEFAULT false,
	"show_today_time" boolean DEFAULT true,
	"show_top_languages" boolean DEFAULT true,
	"show_top_projects" boolean DEFAULT true,
	"languages_limit" serial NOT NULL,
	"projects_limit" serial NOT NULL
);
