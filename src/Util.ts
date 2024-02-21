import { Collection } from "discord.js";
import { Command } from "./types";
import config from "./config.json";

export default class Util {
	static readonly commands: Collection<string, Command> = new Collection();
	static readonly config = config;
}
