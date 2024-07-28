import Util from "../../Util";

import { ApplicationCommandOptionType } from "discord.js";

const autocompleteHandler: DiscordBot.AutocompleteHandler = {
	name: "control",
	options: [
		{
			subCommandGroup: null,
			subCommand: "logs",
			name: "process",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const processes = Util.processes;

				return processes.map((processConfig) => ({
					name: processConfig.name,
					value: processConfig.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "start",
			name: "process",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const processes = Util.processes.filter(
					(processConfig) =>
						!Util.runningProcesses.has(processConfig.name) && !Util.runningJobs.has(processConfig.name),
				);

				return processes.map((processConfig) => ({
					name: processConfig.name,
					value: processConfig.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "stop",
			name: "process",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const processes = Util.processes.filter(
					(processConfig) => Util.runningProcesses.has(processConfig.name) || Util.runningJobs.has(processConfig.name),
				);

				return processes.map((processConfig) => ({
					name: processConfig.name,
					value: processConfig.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "restart",
			name: "process",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const processes = Util.processes.filter(
					(processConfig) => Util.runningProcesses.has(processConfig.name) || Util.runningJobs.has(processConfig.name),
				);

				return processes.map((processConfig) => ({
					name: processConfig.name,
					value: processConfig.name,
				}));
			},
		},
	],
};

export default autocompleteHandler;
