PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_connections_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`boxNumber` text NOT NULL,
	`area` integer NOT NULL,
	`phoneNumber` text,
	`basePack` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`lastPayment` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	`created_at` text DEFAULT (CURRENT_DATE),
	FOREIGN KEY (`area`) REFERENCES `areas_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`basePack`) REFERENCES `base_packs_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_connections_table`("id", "name", "boxNumber", "area", "phoneNumber", "basePack", "status", "lastPayment", "updated_at", "created_at") SELECT "id", "name", "boxNumber", "area", "phoneNumber", "basePack", "status", "lastPayment", "updated_at", "created_at" FROM `connections_table`;--> statement-breakpoint
DROP TABLE `connections_table`;--> statement-breakpoint
ALTER TABLE `__new_connections_table` RENAME TO `connections_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `boxNumberIndex` ON `connections_table` (`boxNumber`);--> statement-breakpoint
CREATE INDEX `areaIndex` ON `connections_table` (`area`);