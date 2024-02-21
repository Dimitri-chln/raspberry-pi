import { AutocompleteHandler, Command } from "./types";
import config from "./config.json";
import { Collection } from "discord.js";
import { ChildProcess } from "child_process";

export default class Util {
	static readonly config = config;

	static readonly commands: Collection<string, Command> = new Collection();
	static readonly autocompleteHandlers: Collection<string, AutocompleteHandler> = new Collection();

	static readonly minecraftServers: Collection<string, ChildProcess> = new Collection();
}
