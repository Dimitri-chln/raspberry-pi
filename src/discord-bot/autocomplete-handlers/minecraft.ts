import Util from "../Util";

import Fs from "fs";
import Path from "path";
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
				const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);

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
				const server = interaction.options.getString("server", false);

				if (!server || !Fs.existsSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server))) return;

				const backups = Fs.readdirSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups"));

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
				const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);

				return servers.map((server) => ({
					name: server,
					value: server,
				}));
			},
		},
	],
};

export default autocompleteHandler;
