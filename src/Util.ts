import config from "./config.json";

import Fs from "node:fs";
import Path from "node:path";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

import Service from "./structures/Service";
import MinecraftServer from "./structures/MinecraftServer";

export default class Util {
	static readonly config = config;
	static readonly servicesPath = process.env.SERVICES_PATH;
	static readonly minecraftServersPath = process.env.MINECRAFT_SERVERS_PATH;

	static readonly services: Collection<string, Service> = new Collection(
		Fs.readdirSync(process.env.SERVICES_PATH)
			.map((serviceGroupName) =>
				Fs.readdirSync(Path.join(process.env.SERVICES_PATH, serviceGroupName)).map(
					(serviceName) => [serviceName, new Service(serviceName)] as [string, Service],
				),
			)
			.flat(),
	);

	static readonly minecraftServers: Collection<string, MinecraftServer> = new Collection(
		Fs.readdirSync(process.env.MINECRAFT_SERVERS_PATH).map(
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
