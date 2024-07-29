import Util from "../../Util";
import DiscordUtil from "../DiscordUtil";

import Fs from "node:fs";
import Path from "node:path";
import Os from "node:os";
import ChildProcess from "node:child_process";
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
					required: true,
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
					required: true,
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
					required: true,
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
					required: true,
					autocomplete: true,
				},
			],
		},
	],

	async run(interaction) {
		const loadingEmoji = interaction.client.emojis.cache.get(DiscordUtil.config.LOADING_EMOJI_ID);

		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "list": {
				const pids = Util.runningProcesses.map((runningProcess) => runningProcess.pid);
				const output = ChildProcess.execSync(`ps -h -o pid,rss,%mem -p ${pids.join(",")}`, { encoding: "utf8" });
				const memoryUsage: MemoryUsage = Object.fromEntries(
					output.split("\n").map((line) => {
						const [pid, rss, mem] = line.trim().split(/\s+/g);
						return [parseInt(pid), { rss: parseInt(rss), mem: parseFloat(mem) }];
					}),
				);

				interaction.reply({
					embeds: [
						{
							author: {
								name: "Processus",
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							fields: Util.processes.map((processConfig) => {
								const runningJob = Util.runningJobs.get(processConfig.name);
								const runningProcess = Util.runningProcesses.get(processConfig.name);

								return {
									name: processConfig.name,
									value: processConfig.cronTime
										? `__**Prochaine exécution :**__ ${
												runningJob ? `<t:${Math.round(runningJob.nextDate().valueOf() / 1000)}:R>` : "désactivée"
										  }`
										: `__**En cours d'exécution :**__ ${runningProcess ? "✅" : "❌"}\n__**Mémoire utilisée :**__ ${
												runningProcess
													? `${memoryUsage[runningProcess.pid].rss.toLocaleString("fr")} Kb (${
															memoryUsage[runningProcess.pid].mem
													  }%)`
													: "0 Kb (0%)"
										  }`,
								};
							}),
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
								description: `\`\`\`${stdout.slice(-2500)}\`\`\``,
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

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Processus ${processConfig.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							description: `Le processus **\`${processConfig.name}\`** est en cours de lancement ${loadingEmoji}`,
						},
					],
				});

				try {
					await startProcess(processConfig);

					interaction.editReply({
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
					await interaction.editReply({
						embeds: [
							{
								author: {
									name: `Processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `Le processus **\`${processConfig.name}\`** n'a pas pu être lancé`,
							},
						],
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

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Processus ${processConfig.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							description: `Le processus **\`${processConfig.name}\`** est en cours d'arrêt ${loadingEmoji}`,
						},
					],
				});

				try {
					await stopProcess(processConfig);

					interaction.editReply({
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
				} catch (err) {
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `Le processus **\`${processConfig.name}\`** n'a pas pu être arrêté`,
							},
						],
					});
				}
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

				await interaction.reply({
					embeds: [
						{
							author: {
								name: `Processus ${processConfig.name}`,
								icon_url: interaction.client.user.displayAvatarURL(),
							},
							color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
							description: `Le processus **\`${processConfig.name}\`** est en cours de relancement ${loadingEmoji}`,
						},
					],
				});

				try {
					await stopProcess(processConfig);

					try {
						await startProcess(processConfig);

						interaction.editReply({
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
						interaction.editReply({
							embeds: [
								{
									author: {
										name: `Processus ${processConfig.name}`,
										icon_url: interaction.client.user.displayAvatarURL(),
									},
									color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
									description: `Le processus **\`${processConfig.name}\`** n'a pas pu être relancé`,
								},
							],
						});
					}
				} catch (err) {
					interaction.editReply({
						embeds: [
							{
								author: {
									name: `Processus ${processConfig.name}`,
									icon_url: interaction.client.user.displayAvatarURL(),
								},
								color: DiscordUtil.config.DEFAULT_EMBED_COLOR,
								description: `Le processus **\`${processConfig.name}\`** n'a pas pu être arrêté`,
							},
						],
					});
				}
				break;
			}
		}
	},
};

interface MemoryUsage {
	[pid: number]: {
		rss: number;
		mem: number;
	};
}

export default command;
