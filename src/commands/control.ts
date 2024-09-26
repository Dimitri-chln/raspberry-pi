import Util from "../Util";

import { ApplicationCommandOptionType } from "discord.js";

const command: RaspberryPi.Command = {
	name: "control",
	description: "Gérer les services de la Raspberry",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "list",
			description: "Voir la liste des services de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "logs",
			description: "Voir les logs d'un service de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "service",
					description: "Le nom du service",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "start",
			description: "Lancer un service de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "service",
					description: "Le nom du service à lancer",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "stop",
			description: "Arrêter un service de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "service",
					description: "Le nom du service à arrêter",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "restart",
			description: "Relancer un service de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "service",
					description: "Le nom du service à relancer",
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "reload",
			description: "Recharger un service de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "service",
					description: "Le nom du service à recharger",
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
								name: "Services",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							fields: await Promise.all(
								Util.services.map(async (service) => {
									return {
										name: service.name,
										value: `>>> __**En cours d'exécution :**__ ${service.isActive() ? "✅" : "❌"}`,
									};
								}),
							),
						},
					],
				});
				break;
			}

			case "logs": {
				const serviceName = interaction.options.getString("service", true);
				const service = Util.services.get(serviceName);

				if (!service) {
					interaction.reply({
						content: "Ce service n'existe pas",
						ephemeral: true,
					});
					return;
				}

				try {
					const logs = await service.logs(50);

					interaction.reply({
						embeds: [
							{
								author: {
									name: `Logs du service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `\`\`\`${logs.slice(-2500)}\`\`\``,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.reply({
						content: `Impossible de lire les logs du service ${service.name}`,
						ephemeral: true,
					});
				}
				break;
			}

			case "start": {
				const serviceName = interaction.options.getString("service", true);
				const service = Util.services.get(serviceName);

				if (!service) {
					interaction.reply({
						content: "Ce service n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (service.isActive()) {
					interaction.reply({
						content: "Ce processus est déjà lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Service ${service.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le service **\`${service.name}\`** est en cours de lancement ${loadingEmoji}`,
						},
					],
				});

				try {
					await service.start();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** a été lancé avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** n'a pas pu être lancé`,
							},
						],
					});
				}

				break;
			}

			case "stop": {
				const serviceName = interaction.options.getString("service", true);
				const service = Util.services.get(serviceName);

				if (!service) {
					interaction.reply({
						content: "Ce service n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (!service.isActive()) {
					interaction.reply({
						content: "Ce service n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Service ${service.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le service **\`${service.name}\`** est en cours d'arrêt ${loadingEmoji}`,
						},
					],
				});

				try {
					await service.stop();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** a été arrêté avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** n'a pas pu être arrêté`,
							},
						],
					});
				}
				break;
			}

			case "restart": {
				const serviceName = interaction.options.getString("service", true);
				const service = Util.services.get(serviceName);

				if (!service) {
					interaction.reply({
						content: "Ce service n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (!service.isActive()) {
					interaction.reply({
						content: "Ce processus n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Service ${service.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le service **\`${service.name}\`** est en cours de relancement ${loadingEmoji}`,
						},
					],
				});

				try {
					service.restart();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** a été relancé avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** n'a pas pu être relancé`,
							},
						],
					});
				}
				break;
			}

			case "reload": {
				const serviceName = interaction.options.getString("service", true);
				const service = Util.services.get(serviceName);

				if (!service) {
					interaction.reply({
						content: "Ce service n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (!service.isActive()) {
					interaction.reply({
						content: "Ce processus n'est pas lancé",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Service ${service.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: Util.config.DEFAULT_EMBED_COLOR,
							description: `Le service **\`${service.name}\`** est en cours de rechargement ${loadingEmoji}`,
						},
					],
				});

				try {
					service.restart();

					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** a été rechargé avec succès`,
							},
						],
					});
				} catch (err) {
					console.error(err);
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Service ${service.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: Util.config.DEFAULT_EMBED_COLOR,
								description: `Le service **\`${service.name}\`** n'a pas pu être rechargé`,
							},
						],
					});
				}
				break;
			}
		}
	},
};

export default command;
