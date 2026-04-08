CREATE TABLE `admin_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`adminUsername` varchar(64) NOT NULL DEFAULT 'admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ip` varchar(64) NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 1,
	`lockedUntil` timestamp,
	`lastAttempt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xss_hits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`pageUrl` text,
	`originUrl` text,
	`referer` text,
	`userAgent` text,
	`ip` varchar(64),
	`cookies` text,
	`dom` text,
	`localStorage` text,
	`sessionStorage` text,
	`browserTime` varchar(64),
	`inIframe` boolean DEFAULT false,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xss_hits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xss_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`label` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xss_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `xss_tokens_token_unique` UNIQUE(`token`)
);
