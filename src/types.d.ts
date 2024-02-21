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
