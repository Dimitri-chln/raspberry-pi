import { Command } from "../types";
import { ApplicationCommandOptionType } from "discord.js";
import Util from "../Util";

import Fs from "fs";
import Path from "path";
import { exec } from "child_process";

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
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "server",
					description: "Le nom du serveur à lancer",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "stop",
			description: "Arrêter un serveur Minecraft de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "server",
					description: "Le nom du serveur à lancer",
					required: true,
					autocomplete: true,
				},
			],
		},
	],

	async run(interaction) {
		const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);

		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "list": {
				interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							fields: servers.map((server) => ({
								name: server,
								value: `__**En ligne :**__ ${Util.minecraftServers.has(server) ? "oui" : "non"}`,
								inline: true,
							})),
						},
					],
				});
				break;
			}

			case "start": {
				const server = interaction.options.getString("server", true);

				if (!servers.includes(server)) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (Util.minecraftServers.has(server)) {
					interaction.reply({
						content: "Ce serveur est déjà lancé",
						ephemeral: true,
					});
					return;
				}

				const childProcess = exec(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "start.sh"), {
					cwd: Path.join(process.env.MINECRAFT_SERVERS_PATH, server),
				});

				childProcess.on("spawn", () => {
					Util.minecraftServers.set(server, childProcess);
					console.log(`Minecraft server ${server} is starting`);

					interaction.reply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${server}\`** est en cours de lancement...`,
							},
						],
					});
				});

				childProcess.stdout.on("data", (data) => {
					console.log(`[minecraft:${server}] ${data}`.trim());

					if (/Done \(\d+.\d+s\)!/.test(data)) {
						interaction.editReply({
							embeds: [
								{
									author: {
										name: "Serveurs Minecraft",
										icon_url: interaction.client.user.displayAvatarURL(),
									},
									color: Util.config.DEFAULT_EMBED_COLOR,
									description: `Le serveur **\`${server}\`** a été lancé avec succès`,
								},
							],
						});
					}
				});

				childProcess.stderr.on("data", (data) => console.error(`[minecraft:${server}] ${data}`.trim()));

				childProcess.on("exit", (code, signal) => {
					Util.minecraftServers.delete(server);
					console.log(`Minecraft server ${server} stopped with exit code ${code}`);

					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${server}\`** a été arrêté`,
							},
						],
					});
				});
				break;
			}

			case "stop": {
				const server = interaction.options.getString("server", true);

				if (!servers.includes(server)) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				const childProcess = Util.minecraftServers.get(server);
				if (!childProcess) {
					interaction.reply({
						content: "Ce serveur n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				childProcess.on("exit", (code, signal) => {
					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${server}\`** a été arrêté avec succès`,
							},
						],
					});
				});

				childProcess.stdin.write("/stop", (error) => {
					if (error) console.error(error);

					interaction.reply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: error
									? `Le serveur **\`${server}\`** n'a pas pu être arrêté`
									: `Le serveur **\`${server}\`** est en cours de sauvegarde...`,
							},
						],
					});
				});
				break;
			}
		}
	},
};

export default command;
