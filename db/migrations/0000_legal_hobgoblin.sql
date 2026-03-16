CREATE TABLE `articles` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`sport_id` text NOT NULL,
	`league_id` text,
	`title` text NOT NULL,
	`subtitle` text,
	`body` text NOT NULL,
	`summary` text,
	`original_source_url` text,
	`original_source_name` text,
	`source_data_hash` text,
	`image_url` text,
	`category` text NOT NULL,
	`tags` text,
	`published_at` integer,
	`generated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `generation_logs` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	`status` text DEFAULT 'running' NOT NULL,
	`sports_processed` integer DEFAULT 0 NOT NULL,
	`articles_generated` integer DEFAULT 0 NOT NULL,
	`errors` text
);
--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`sport_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`espn_slug` text,
	`country` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leagues_slug_unique` ON `leagues` (`slug`);--> statement-breakpoint
CREATE TABLE `sports` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text NOT NULL,
	`category` text NOT NULL,
	`espn_slug` text,
	`sportsdb_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sports_slug_unique` ON `sports` (`slug`);--> statement-breakpoint
CREATE TABLE `user_sport_preferences` (
	`user_id` text NOT NULL,
	`sport_id` text NOT NULL,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `sport_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);