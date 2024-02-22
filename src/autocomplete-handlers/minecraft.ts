import { AutocompleteHandler } from "../types";
import { ApplicationCommandOptionType } from "discord.js";

import Fs from "fs";

const autocompleteHandler: AutocompleteHandler = {
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
			subCommand: "stop",
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
