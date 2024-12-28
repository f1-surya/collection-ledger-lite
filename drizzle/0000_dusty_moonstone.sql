CREATE TABLE `addons_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`connection` integer,
	FOREIGN KEY (`connection`) REFERENCES `connections_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `areas_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `base_packs_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lcoPrice` integer NOT NULL,
	`customerPrice` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `connections_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`boxNumber` text NOT NULL,
	`area` integer,
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
CREATE INDEX `boxNumberIndex` ON `connections_table` (`boxNumber`);--> statement-breakpoint
CREATE INDEX `areaIndex` ON `connections_table` (`area`);--> statement-breakpoint
CREATE TABLE `payments_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connection` integer NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`currentPack` integer NOT NULL,
	`to` integer,
	`type` text DEFAULT 'payment' NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`customerPrice` integer NOT NULL,
	`lcoPrice` integer NOT NULL,
	FOREIGN KEY (`connection`) REFERENCES `connections_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currentPack`) REFERENCES `base_packs_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to`) REFERENCES `base_packs_table`(`id`) ON UPDATE no action ON DELETE no action
);
