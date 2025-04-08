namespace RaspberryPi {
	namespace Discord {
		import("discord.js");
		import {
			ApplicationCommandOptionChoice,
			ApplicationCommandOptionData,
			ApplicationCommandOptionType,
			AutocompleteInteraction,
			ChatInputCommandInteraction,
		} from "discord.js";

		interface Event {
			name: string;
			once: boolean;
			run: (...args: any[]) => Promise<void>;
		}

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
	}

	namespace Events {
		interface Service {
			start: [];
			stop: [];
			restart: [];
			reload: [];
			log: [string];
		}

		interface MinecraftServer {
			loading: [number];
			loaded: [];
		}
	}

	namespace Minecraft {
		type ServerPropertiesDifficulty = "peaceful" | "easy" | "normal" | "hard";
		type ServerPropertiesPermissionLevel = 1 | 2 | 3 | 4;
		type ServerPropertiesGamemode = "survival" | "creative" | "adventure" | "spectator";
		type ServerPropertiesLevelType =
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
		type ServerPropertiesRegionFileCompression = "deflate" | "lz4" | "none";

		interface ServerProperties {
			"accepts-transfers‌": boolean;
			"allow-flight": boolean;
			"allow-nether": boolean;
			"broadcast-console-to-ops": boolean;
			"broadcast-rcon-to-ops": boolean;
			"difficulty": ServerPropertiesDifficulty;
			"enable-command-block": boolean;
			"enable-jmx-monitoring": boolean;
			"enable-rcon": boolean;
			"enable-status": boolean;
			"enable-query": boolean;
			"enforce-secure-profile": boolean;
			"enforce-whitelist": boolean;
			"entity-broadcast-range-percentage": number;
			"force-gamemode": boolean;
			"function-permission-level": ServerPropertiesPermissionLevel;
			"gamemode": ServerPropertiesGamemode;
			"generate-structures": boolean;
			"generator-settings": object;
			"hardcore": boolean;
			"hide-online-players": boolean;
			"initial-disabled-packs": string;
			"initial-enabled-packs": string;
			"level-name": string;
			"level-seed": string;
			"level-type": ServerPropertiesLevelType;
			"log-ips": boolean;
			"max-chained-neighbor-updates": number;
			"max-players": number;
			"max-tick-time": number;
			"max-world-size": number;
			"motd": string;
			"network-compression-threshold": number;
			"online-mode": boolean;
			"op-permission-level": ServerPropertiesPermissionLevel;
			"player-idle-timeout": number;
			"prevent-proxy-connections": boolean;
			"previews-chat": boolean;
			"pvp": boolean;
			"query.port": number;
			"rate-limit": number;
			"rcon.password": string;
			"rcon.port": number;
			"region-file-compression": ServerPropertiesRegionFileCompression;
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

		type ServerVersion = string;

		interface ResourcePackMetadata {
			uuid: string;
			checksum: string;
		}

		interface ServerBackupMetadata {
			name: string;
			version: ServerVersion;
			resourcePack?: ResourcePackMetadata;
		}

		interface ServerMetadata {
			name: string;
			version: ServerVersion;
			resourcePack?: ResourcePackMetadata;
			backups: ServerBackupMetadata[];
		}
	}

	interface Task {
		intervalMs: number;
		action: () => Promise<void>;
	}
}
