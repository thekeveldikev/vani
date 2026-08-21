CREATE TABLE `blob_chunks` (
	`vault_id` text NOT NULL,
	`blob_id` text NOT NULL,
	`chunk_no` integer NOT NULL,
	`iv` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_blob_chunks_key` ON `blob_chunks` (`vault_id`,`blob_id`,`chunk_no`);--> statement-breakpoint
CREATE TABLE `updates` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vault_id` text NOT NULL,
	`update_id` text NOT NULL,
	`iv` text NOT NULL,
	`object_key` text NOT NULL,
	`cipher_length` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_updates_vault_update` ON `updates` (`vault_id`,`update_id`);--> statement-breakpoint
CREATE INDEX `idx_updates_vault_seq` ON `updates` (`vault_id`,`seq`);--> statement-breakpoint
CREATE TABLE `vaults` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
