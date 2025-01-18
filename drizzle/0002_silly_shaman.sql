CREATE TABLE `channels_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lcoPrice` integer NOT NULL,
	`customerPrice` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_addons_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel` integer NOT NULL,
	`connection` integer NOT NULL,
	FOREIGN KEY (`channel`) REFERENCES `channels_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`connection`) REFERENCES `connections_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_addons_table`("id", "channel", "connection") SELECT "id", "channel", "connection" FROM `addons_table`;--> statement-breakpoint
DROP TABLE `addons_table`;--> statement-breakpoint
ALTER TABLE `__new_addons_table` RENAME TO `addons_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `connectionIndex` ON `addons_table` (`connection`);--> statement-breakpoint
CREATE INDEX `month` ON `payments_table` (`month`);--> statement-breakpoint
CREATE INDEX `year` ON `payments_table` (`year`);