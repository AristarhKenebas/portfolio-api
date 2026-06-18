CREATE TABLE "project_display_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"show_stars" boolean DEFAULT true,
	"show_forks" boolean DEFAULT true,
	"show_language" boolean DEFAULT true,
	"show_updated_at" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "avatar_url" text;