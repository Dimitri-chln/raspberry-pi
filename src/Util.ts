import config from "./config.json";

import Fs from "node:fs";
import Path from "node:path";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import MinecraftServer from "./structures/MinecraftServer";
import Service from "./structures/Service";

export default class Util {
	static readonly config = config;

	static readonly services: Collection<string, Service> = new Collection(
		Fs.readdirSync(config.SERVICES_PATH)
			.map((serviceGroupName) =>
				Fs.readdirSync(Path.join(config.SERVICES_PATH, serviceGroupName)).map(
					(serviceName) => [serviceName, new Service(serviceName)] as [string, Service],
				),
			)
			.flat(),
	);

	static readonly minecraftServers: Collection<string, MinecraftServer> = new Collection(
		Fs.readdirSync(config.MINECRAFT_SERVERS_PATH).map(
			(serverName) => [serverName, new MinecraftServer(serverName)] as [string, MinecraftServer],
		),
	);

	static readonly client = new Client({
		intents: [
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.DirectMessageReactions,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildEmojisAndStickers,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.MessageContent,
		],
		partials: [Partials.Message, Partials.Channel, Partials.Reaction],
		allowedMentions: {
			repliedUser: true,
			parse: ["users"],
		},
	});

	static readonly commands: Collection<string, RaspberryPi.Command> = new Collection();
	static readonly autocompleteHandlers: Collection<string, RaspberryPi.AutocompleteHandler> = new Collection();
}
