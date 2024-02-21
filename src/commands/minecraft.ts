import { Command } from "../types";
import { ApplicationCommandOptionType } from "discord.js";

import Fs from "fs";

const command: Command = {
	name: "minecraft",
	description: "Gérer les serveurs Minecraft de la Raspberry",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "liste",
			description: "Voir la liste des serveurs Minecraft de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "démarrer",
			description: "Démarrer un serveur Minecraft de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "arrêter",
			description: "Arrêter un serveur Minecraft de la Raspberry",
		},
	],

	async run(interaction) {
		const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);

		interaction.reply(servers.join(", "));
	},
};

export default command;
