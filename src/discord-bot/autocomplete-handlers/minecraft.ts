import Util from "../Util";

import Fs from "node:fs";
import Path from "node:path";
import Os from "node:os";
import { ApplicationCommandOptionType } from "discord.js";

const autocompleteHandler: DiscordBot.AutocompleteHandler = {
	name: "minecraft",
	options: [
		{
			subCommandGroup: null,
			subCommand: "start",
			name: "server",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const minecraftServersPath = `${Os.homedir()}/${Util.config.MINECRAFT_SERVERS_PATH}`;
				const servers = Fs.readdirSync(minecraftServersPath);

				return servers.map((server) => ({
					name: server,
					value: server,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "start",
			name: "backup",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const minecraftServersPath = `${Os.homedir()}/${Util.config.MINECRAFT_SERVERS_PATH}`;
				const server = interaction.options.getString("server", false);

				if (!server || !Fs.existsSync(Path.join(minecraftServersPath, server))) return;

				const backups = Fs.readdirSync(Path.join(minecraftServersPath, server, "backups"));

				return backups.map((backup) => ({
					name: backup,
					value: backup,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "stop",
			name: "server",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const servers = Util.minecraftServers;

				return servers.map((_, server) => ({
					name: server,
					value: server,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "backup",
			name: "server",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const minecraftServersPath = `${Os.homedir()}/${Util.config.MINECRAFT_SERVERS_PATH}`;
				const servers = Fs.readdirSync(minecraftServersPath);

				return servers.map((server) => ({
					name: server,
					value: server,
				}));
			},
		},
	],
};

export default autocompleteHandler;
