import config from "./config.json";
import { ChildProcess } from "node:child_process";
import { Collection } from "discord.js";

export default class DiscordUtil {
	static readonly config = config;

	static readonly commands: Collection<string, DiscordBot.Command> = new Collection();
	static readonly autocompleteHandlers: Collection<string, DiscordBot.AutocompleteHandler> = new Collection();

	static readonly minecraftServers: Collection<string, ChildProcess> = new Collection();
}
