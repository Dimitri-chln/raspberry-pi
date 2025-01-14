import Util from "../Util";

import { ApplicationCommandOptionType } from "discord.js";

const autocompleteHandler: RaspberryPi.Discord.AutocompleteHandler = {
	name: "service",
	options: [
		{
			subCommandGroup: null,
			subCommand: "logs",
			name: "service",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const services = Util.services;

				return services.map((service) => ({
					name: service.name,
					value: service.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "start",
			name: "service",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const services = Util.services.filter((service) => !service.isActive());

				return services.map((service) => ({
					name: service.name,
					value: service.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "stop",
			name: "service",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const services = Util.services.filter((service) => service.isActive());

				return services.map((service) => ({
					name: service.name,
					value: service.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "restart",
			name: "service",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const services = Util.services.filter((service) => service.isActive());

				return services.map((service) => ({
					name: service.name,
					value: service.name,
				}));
			},
		},
		{
			subCommandGroup: null,
			subCommand: "reload",
			name: "service",
			type: ApplicationCommandOptionType.String,
			filterType: "CONTAINS",

			run: async (interaction, value) => {
				const services = Util.services.filter((service) => service.isActive());

				return services.map((service) => ({
					name: service.name,
					value: service.name,
				}));
			},
		},
	],
};

export default autocompleteHandler;
