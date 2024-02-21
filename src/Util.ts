import { Command } from "./types";
import config from "./config.json";
import { Collection } from "discord.js";
import { ChildProcess } from "child_process";

export default class Util {
	static readonly commands: Collection<string, Command> = new Collection();
	static readonly config = config;
	static readonly minecraftServers: Collection<string, ChildProcess> = new Collection();
}
