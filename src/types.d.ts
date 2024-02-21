import { ApplicationCommandOptionData, ChatInputCommandInteraction } from "discord.js";

declare interface Command {
	name: string;
	description: string;
	options: ApplicationCommandOptionData[];
	run(interaction: ChatInputCommandInteraction): Promise<void>;
}
