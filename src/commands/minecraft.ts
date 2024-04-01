import { Command } from "../types";
import Util from "../Util";

import Fs from "fs";
import Path from "path";
import { exec } from "child_process";
import { ApplicationCommandOptionType } from "discord.js";
import ServerProperties from "../util/ServerProperties";

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
				{
					type: ApplicationCommandOptionType.String,
					name: "backup",
					description: "Le nom d'une backup à lancer",
					required: false,
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
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "backup",
			description: "Créer une backup (en créatif) d'un serveur Minecraft de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "server",
					description: "Le nom du serveur à sauvegarder",
					required: true,
					autocomplete: true,
				},
			],
		},
	],

	async run(interaction) {
		const servers = Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH);
		const loadingEmoji = interaction.client.emojis.cache.get(Util.config.LOADING_EMOJI_ID);

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
				const backup = interaction.options.getString("server", false);

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

				if (Util.minecraftServers.size >= Util.config.MAX_MINECRAFT_ONLINE_SERVERS) {
					interaction.reply({
						content: "Le nombre maximal de serveurs en ligne a été atteint",
						ephemeral: true,
					});
					return;
				}

				const serverProperties = new ServerProperties(
					Fs.readFileSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "server.properties")).toString(),
				);

				if (backup) {
					if (!Fs.existsSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups")))
						Fs.mkdirSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups"));

					const backups = Fs.readdirSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups"));

					if (!backups.includes(backup)) {
						interaction.reply({
							content: "Cette backup n'existe pas",
							ephemeral: true,
						});
						return;
					}

					serverProperties.data["level-name"] = `backups/${backup}`;
				} else {
					serverProperties.data["level-name"] = "world";
				}

				Fs.writeFileSync(
					Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "server.properties"),
					serverProperties.stringify(),
				);

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
								description: `Le serveur **\`${server}\`** est en cours de lancement ${loadingEmoji}`,
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
					if (!Number.isInteger(code)) return;

					Util.minecraftServers.delete(server);
					console.log(`Minecraft server ${server} stopped with exit code ${code}`);
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

				childProcess.stdin.write("/stop\n", (error) => {
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
									: `Le serveur **\`${server}\`** est en cours de sauvegarde ${loadingEmoji}`,
							},
						],
					});
				});
				break;
			}

			case "backup": {
				const server = interaction.options.getString("server", true);

				if (!servers.includes(server)) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Création d'une nouvelle backup pour le serveur **\`${server}\`** ${loadingEmoji}`,
						},
					],
				});

				if (!Fs.existsSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups")))
					Fs.mkdirSync(Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups"));

				const now = new Date();
				const yearString = now.getFullYear().toString().padStart(4, "0");
				const monthString = now.getMonth().toString().padStart(2, "0");
				const dayString = now.getDate().toString().padStart(2, "0");
				const backupName = `backup-${yearString}-${monthString}-${dayString}-${now.getTime().toString(16)}`;

				Fs.cpSync(
					Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "world"),
					Path.join(process.env.MINECRAFT_SERVERS_PATH, server, "backups", backupName),
					{
						recursive: true,
					},
				);

				interaction.editReply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Une nouvelle backup pour le serveur **\`${server}\`** a été créée (**\`${backupName}\`**)`,
						},
					],
				});
			}
		}
	},
};

export default command;
