import Util from "../Util";

import { exec } from "node:child_process";
import { ApplicationCommandOptionType } from "discord.js";

const command: DiscordBot.Command = {
	name: "control",
	description: "Gérer la Raspberry",
	options: [],

	async run(interaction) {},
};

export default command;
