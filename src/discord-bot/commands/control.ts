import Util from "../../Util";
import DiscordUtil from "../DiscordUtil";

import Fs from "node:fs";
import Path from "node:path";
import Os from "node:os";
import { ApplicationCommandOptionType } from "discord.js";
import startProcess from "../../util/startProcess";
import stopProcess from "../../util/stopProcess";

const command: DiscordBot.Command = {
	name: "control",
	description: "Gérer les processus de la Raspberry",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "list",
			description: "Voir la liste des processus de la Raspberry",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "logs",
			description: "Voir les logs d'un processus de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "process",
					description: "Le nom du processus",
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "start",
			description: "Lancer un processus de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "process",
					description: "Le nom du processus à lancer",
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "stop",
			description: "Arrêter un processus de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "process",
					description: "Le nom du processus à arrêter",
					autocomplete: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "restart",
			description: "Relancer un processus de la Raspberry",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "process",
					description: "Le nom du processus à relancer",
					autocomplete: true,
				},
			],
		},
	],

	async run(interaction) {
		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "list": {
				interaction.reply({
					embeds: [
						{
							author: {
								name: "Processus",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							fields: Util.processes.map((processConfig) => ({
								name: processConfig.name,
								value: processConfig.cronTime
									? `__**Prochaine exécution :**__ ${
											Util.runningJobs.has(processConfig.name)
												? Util.runningJobs
														.get(processConfig.name)
														.nextDate()
														.toLocaleString({ dateStyle: "short", timeStyle: "short" })
												: "désactivée"
									  }`
									: `__**En cours d'exécution :**__ ${Util.runningProcesses.has(processConfig.name) ? "oui" : "non"}`,
							})),
						},
					],
				});
				break;
			}

			case "logs": {
				const process = interaction.options.getString("process", true);
				const processConfig = Util.processes.find((p) => p.name === process);

				if (!processConfig) {
					interaction.reply({
						content: "Ce processus n'existe pas",
						ephemeral: true,
					});
					return;
				}

				try {
					const stdout = Fs.readFileSync(Path.join(Os.homedir(), processConfig.workingDirectory, "out.log"), {
						encoding: "utf8",
					});

					interaction.reply({
						embeds: [
							{
								author: {
									name: `Logs du processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `\`\`\`${stdout}\`\`\``,
							},
						],
					});
				} catch (err) {
					interaction.reply({
						content: `Impossible de lire les logs du processus ${processConfig.name}`,
						ephemeral: true,
					});
				}
				break;
			}

			case "start": {
				const process = interaction.options.getString("process", true);
				const processConfig = Util.processes.find((p) => p.name === process);

				if (!processConfig) {
					interaction.reply({
						content: "Ce processus n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (processConfig.cronTime) {
					if (Util.runningJobs.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus est déjà lancé",
							ephemeral: true,
						});
						return;
					}
				} else {
					if (Util.runningProcesses.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus est déjà lancé",
							ephemeral: true,
						});
						return;
					}
				}

				try {
					await startProcess(processConfig);

					interaction.reply({
						embeds: [
							{
								author: {
									name: `Processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `Le processus **\`${processConfig.name}\`** a été lancé avec succès`,
							},
						],
					});
				} catch (err) {
					interaction.reply({
						content: `Impossible de lancer le processus ${processConfig.name}`,
						ephemeral: true,
					});
				}

				break;
			}

			case "stop": {
				const process = interaction.options.getString("process", true);
				const processConfig = Util.processes.find((p) => p.name === process);

				if (!processConfig) {
					interaction.reply({
						content: "Ce processus n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (processConfig.cronTime) {
					if (!Util.runningJobs.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus n'est pas lancé",
							ephemeral: true,
						});
						return;
					}
				} else {
					if (!Util.runningProcesses.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus n'est pas lancé",
							ephemeral: true,
						});
						return;
					}
				}

				stopProcess(processConfig);

				interaction.reply({
					embeds: [
						{
							author: {
								name: `Processus ${processConfig.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							description: `Le processus **\`${processConfig.name}\`** a été arrêté avec succès`,
						},
					],
				});
				break;
			}

			case "restart": {
				const process = interaction.options.getString("process", true);
				const processConfig = Util.processes.find((p) => p.name === process);

				if (!processConfig) {
					interaction.reply({
						content: "Ce processus n'existe pas",
						ephemeral: true,
					});
					return;
				}

				if (processConfig.cronTime) {
					if (!Util.runningJobs.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus n'est pas lancé",
							ephemeral: true,
						});
						return;
					}
				} else {
					if (!Util.runningProcesses.has(processConfig.name)) {
						interaction.reply({
							content: "Ce processus n'est pas lancé",
							ephemeral: true,
						});
						return;
					}
				}

				try {
					stopProcess(processConfig);
					await startProcess(processConfig);

					interaction.reply({
						embeds: [
							{
								author: {
									name: `Processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `Le processus **\`${processConfig.name}\`** a été relancé avec succès`,
							},
						],
					});
				} catch (err) {
					interaction.reply({
						content: `Impossible de relancer le processus ${processConfig.name}`,
						ephemeral: true,
					});
				}
				break;
			}
		}
	},
};

export default command;
