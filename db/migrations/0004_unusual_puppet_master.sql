CREATE TABLE `ai_article_variants` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`round_id` text NOT NULL,
	`source_article_hash` text NOT NULL,
	`source_title` text NOT NULL,
	`writer_style` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`body` text NOT NULL,
	`summary` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `ai_generation_rounds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_generation_rounds` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`round_number` integer NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`stories_processed` integer DEFAULT 0 NOT NULL,
	`avg_score` integer,
	`best_score` integer,
	`instruction_version_id` text,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	`errors` text
);
--> statement-breakpoint
CREATE TABLE `ai_instruction_versions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`round_id` text,
	`content` text NOT NULL,
	`avg_score_before` integer,
	`avg_score_after` integer,
	`changes_summary` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `ai_generation_rounds`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `ai_variant_scores` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`variant_id` text NOT NULL,
	`judge_id` text NOT NULL,
	`humor_quality` integer NOT NULL,
	`factual_accuracy` integer NOT NULL,
	`beer_integration` integer NOT NULL,
	`readability_flow` integer NOT NULL,
	`headline_quality` integer NOT NULL,
	`overall_engagement` integer NOT NULL,
	`total_score` integer NOT NULL,
	`feedback` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `ai_article_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
