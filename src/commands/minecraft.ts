import { Command } from "../types";
import { ApplicationCommandOptionType } from "discord.js";
import Util from "../Util";

import Fs from "fs";

const command: Command = {
	name: "minecraft",
	description: "Gérer les serveurs Minecraft de la Raspberry",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "list",
			description: "Voir la liste des serveurs Minecraft de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "start",
			description: "Démarrer un serveur Minecraft de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "stop",
			description: "Arrêter un serveur Minecraft de la Raspberry",
		},
	],

	async run(interaction) {
		const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);

		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "liste": {
				interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							fields: servers.map((server) => {
								return {
									name: server,
									value: `En ligne : ???`,
								};
							}),
						},
					],
				});
				break;
			}

			case "start": {
				break;
			}

			case "stop": {
				break;
			}
		}
	},
};

export default command;
