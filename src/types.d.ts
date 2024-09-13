namespace RaspberryPi {
	import("node:child_process");
	import { ChildProcess } from "node:child_process";
	import("cron");
	import { CronJob } from "cron";

	interface ProcessConfig {
		name: string;
		workingDirectory: string;
		autoStart: boolean;
		restartOnFailure: boolean;
		cronTime?: string;
	}
}

namespace DiscordBot {
	import("discord.js");
	import {
		ApplicationCommandOptionChoice,
		ApplicationCommandOptionData,
		ApplicationCommandOptionType,
		AutocompleteInteraction,
		ChatInputCommandInteraction,
	} from "discord.js";

	interface Command {
		name: string;
		description: string;
		options: ApplicationCommandOptionData[];
		run(interaction: ChatInputCommandInteraction): Promise<void>;
	}

	interface AutocompleteHandler {
		name: string;
		options: AutocompleteHandlerOption[];
	}

	interface AutocompleteHandlerStringOption {
		subCommandGroup: string;
		subCommand: string;
		name: string;
		type: ApplicationCommandOptionType.String;
		filterType: "STARTS_WITH" | "CONTAINS";
		run: (interaction: AutocompleteInteraction, value: string) => Promise<ApplicationCommandOptionChoice[]>;
	}

	interface AutocompleteHandlerNumberOption {
		subCommandGroup: string;
		subCommand: string;
		name: string;
		type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
		filterType: "STARTS_WITH" | "CONTAINS";
		run: (interaction: AutocompleteInteraction, value: number) => Promise<ApplicationCommandOptionChoice[]>;
	}

	type AutocompleteHandlerOption = AutocompleteHandlerStringOption | AutocompleteHandlerNumberOption;

	type MinecraftServerPropertiesDifficulty = "peaceful" | "easy" | "normal" | "hard";
	type MinecraftServerPropertiesPermissionLevel = 1 | 2 | 3 | 4;
	type MinecraftServerPropertiesGamemode = "survival" | "creative" | "adventure" | "spectator";
	type MinecraftServerPropertiesLevelType =
		| "minecraft\\:normal"
		| "normal"
		| "minecraft\\:flat"
		| "flat"
		| "minecraft\\:large_biomes"
		| "large_biomes"
		| "minecraft\\:amplified"
		| "amplified"
		| "minecraft\\:single_biome_surface"
		| "single_biome_surface";
	type MinecraftServerPropertiesRegionFileCompression = "deflate" | "lz4" | "none";

	interface MinecraftServerProperties {
		"accepts-transfers‌": boolean;
		"allow-flight": boolean;
		"allow-nether": boolean;
		"broadcast-console-to-ops": boolean;
		"broadcast-rcon-to-ops": boolean;
		"difficulty": MinecraftServerPropertiesDifficulty;
		"enable-command-block": boolean;
		"enable-jmx-monitoring": boolean;
		"enable-rcon": boolean;
		"enable-status": boolean;
		"enable-query": boolean;
		"enforce-secure-profile": boolean;
		"enforce-whitelist": boolean;
		"entity-broadcast-range-percentage": number;
		"force-gamemode": boolean;
		"function-permission-level": MinecraftServerPropertiesPermissionLevel;
		"gamemode": MinecraftServerPropertiesGamemode;
		"generate-structures": boolean;
		"generator-settings": object;
		"hardcore": boolean;
		"hide-online-players": boolean;
		"initial-disabled-packs": string;
		"initial-enabled-packs": string;
		"level-name": string;
		"level-seed": string;
		"level-type": MinecraftServerPropertiesLevelType;
		"log-ips": boolean;
		"max-chained-neighbor-updates": number;
		"max-players": number;
		"max-tick-time": number;
		"max-world-size": number;
		"motd": string;
		"network-compression-threshold": number;
		"online-mode": boolean;
		"op-permission-level": MinecraftServerPropertiesPermissionLevel;
		"player-idle-timeout": number;
		"prevent-proxy-connections": boolean;
		"previews-chat": boolean;
		"pvp": boolean;
		"query.port": number;
		"rate-limit": number;
		"rcon.password": string;
		"rcon.port": number;
		"region-file-compression": MinecraftServerPropertiesRegionFileCompression;
		"resource-pack": string;
		"resource-pack-id": string;
		"resource-pack-prompt": string;
		"resource-pack-sha1": string;
		"require-resource-pack": boolean;
		"server-ip": string;
		"server-port": number;
		"simulation-distance": number;
		"snooper-enabled": boolean;
		"spawn-animals": boolean;
		"spawn-monsters": boolean;
		"spawn-npcs": boolean;
		"spawn-protection": number;
		"sync-chunk-writes": boolean;
		"text-filtering-config": unknown;
		"use-native-transport": boolean;
		"view-distance": number;
		"white-list": boolean;
	}
}
