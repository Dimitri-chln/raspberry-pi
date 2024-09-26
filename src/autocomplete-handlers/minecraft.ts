import Util from "../Util";

import { ApplicationCommandOptionType } from "discord.js";

const autocompleteHandler: RaspberryPi.AutocompleteHandler = {
	name: "minecraft",
	options: [
		{
			subCommandGroup: null,
			subCommand: "start",
			name: "server",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const minecraftServers = Util.minecraftServers.filter((minecraftServer) => !minecraftServer.isActive());

				return minecraftServers.map((minecraftServer) => ({
					name: minecraftServer.serverName,
					value: minecraftServer.serverName,
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
				const minecraftServerName = interaction.options.getString("server", false);
				const minecraftServer = Util.minecraftServers.get(minecraftServerName);
				if (!minecraftServer) return;

				const backups = await minecraftServer.backups();

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
				const minecraftServers = Util.minecraftServers.filter((minecraftServer) => minecraftServer.isActive());

				return minecraftServers.map((minecraftServer) => ({
					name: minecraftServer.serverName,
					value: minecraftServer.serverName,
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
				const minecraftServers = Util.minecraftServers.filter((minecraftServer) => !minecraftServer.isActive());

				return minecraftServers.map((minecraftServer) => ({
					name: minecraftServer.serverName,
					value: minecraftServer.serverName,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "reload",
			name: "server",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const minecraftServers = Util.minecraftServers.filter((minecraftServer) => minecraftServer.isActive());

				return minecraftServers.map((minecraftServer) => ({
					name: minecraftServer.serverName,
					value: minecraftServer.serverName,
				}));
			},
		},
	],
};

export default autocompleteHandler;
