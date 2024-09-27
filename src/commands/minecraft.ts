import Util from "../Util";

import { ApplicationCommandOptionType } from "discord.js";

const command: RaspberryPi.Command = {
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
			name: "reload",
			description: "Recharger un serveur Minecraft de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "server",
					description: "Le nom du serveur à recharger",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "backup",
			description: "Créer une backup d'un serveur Minecraft de la Raspberry",
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
							fields: await Promise.all(
								Util.minecraftServers.map(async (minecraftServer) => ({
									name: minecraftServer.serverName,
									value: `>>> __**En ligne :**__ ${minecraftServer.isActive() ? "✅" : "❌"}`,
								})),
							),
						},
					],
				});
				break;
			}

			case "start": {
				const minecraftServerName = interaction.options.getString("server", true);
				const backup = interaction.options.getString("backup", false);
				const minecraftServer = Util.minecraftServers.get(minecraftServerName);

				if (!minecraftServer) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (minecraftServer.isActive()) {
					interaction.reply({
						content: "Ce serveur est déjà lancé",
						ephemeral: true,
					});
					return;
				}

				const onlineServers = Util.minecraftServers.filter((s) => s.isActive());
				if (onlineServers.size >= Util.config.MAX_MINECRAFT_ONLINE_SERVERS) {
					interaction.reply({
						content: "Le nombre maximal de serveurs en ligne a été atteint",
						ephemeral: true,
					});
					return;
				}

				if (backup) {
					const backups = await minecraftServer.backups();
					if (!backups.includes(backup)) {
						interaction.reply({
							content: "Cette backup n'existe pas",
							ephemeral: true,
						});
						return;
					}

					await minecraftServer.loadBackup(backup);
				} else {
					await minecraftServer.loadWorld();
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le serveur **\`${minecraftServerName}\`** est en cours de lancement ${loadingEmoji}`,
						},
					],
				});

				try {
					await minecraftServer.start();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** a été lancé avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** n'a pas pu être lancé`,
							},
						],
					});
				}
				break;
			}

			case "stop": {
				const minecraftServerName = interaction.options.getString("server", true);
				const minecraftServer = Util.minecraftServers.get(minecraftServerName);

				if (!minecraftServer) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (!minecraftServer.isActive()) {
					interaction.reply({
						content: "Ce serveur n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le serveur **\`${minecraftServerName}\`** est en cours de sauvegarde ${loadingEmoji}`,
						},
					],
				});

				try {
					await minecraftServer.stop();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** a été arrêté avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** n'a pas pu être arrêté`,
							},
						],
					});
				}
				break;
			}

			case "reload": {
				const minecraftServerName = interaction.options.getString("server", true);
				const minecraftServer = Util.minecraftServers.get(minecraftServerName);

				if (!minecraftServer) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (!minecraftServer.isActive()) {
					interaction.reply({
						content: "Ce serveur n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le serveur **\`${minecraftServerName}\`** est en cours de rechargement ${loadingEmoji}`,
						},
					],
				});

				try {
					await minecraftServer.reload();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** a été rechargé avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le serveur **\`${minecraftServerName}\`** n'a pas pu être rechargé`,
							},
						],
					});
				}
				break;
			}

			case "backup": {
				const minecraftServerName = interaction.options.getString("server", true);
				const minecraftServer = Util.minecraftServers.get(minecraftServerName);

				if (!minecraftServer) {
					interaction.reply({
						content: "Ce serveur n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (minecraftServer.isActive()) {
					interaction.reply({
						content: "Ce serveur est en ligne, réessaye une fois qu'il sera arrêté",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: "Serveurs Minecraft",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Création d'une nouvelle backup pour le serveur **\`${minecraftServerName}\`** ${loadingEmoji}`,
						},
					],
				});

				try {
					const backupName = await minecraftServer.createBackup();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Une nouvelle backup pour le serveur **\`${minecraftServerName}\`** a été créée\n> **\`${backupName}\`**`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: "Serveurs Minecraft",
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Une erreur est survenie lors de la création nouvelle backup pour le serveur **\`${minecraftServerName}\`**`,
							},
						],
					});
				}
			}
		}
	},
};

export default command;
