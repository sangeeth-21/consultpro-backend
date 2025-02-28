ALTER TABLE `posts` RENAME TO `bookings`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `bookings` ADD `sno` integer PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `uid` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `userid` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `calendar_date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `fileurl` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `sno` integer PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `uuid` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phoneno` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `status` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_uid_unique` ON `bookings` (`uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_uuid_unique` ON `users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `id`;--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `content`;--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `user_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `id`;