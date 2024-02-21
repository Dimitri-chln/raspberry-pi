import { Collection } from "discord.js";

import { Command } from "./types";

export default class Util {
	static readonly commands: Collection<string, Command> = new Collection();
}
