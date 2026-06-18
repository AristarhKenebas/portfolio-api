ALTER TABLE "projects" ALTER COLUMN "stars" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "forks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "updated_at";