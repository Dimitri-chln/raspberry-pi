export default class ServerProperties {
	private _data: Partial<RaspberryPi.MinecraftServerProperties>;

	constructor(file: string) {
		this._data = this._parse(file);
	}

	get<K extends keyof RaspberryPi.MinecraftServerProperties>(property: K): RaspberryPi.MinecraftServerProperties[K] {
		return this._data[property] as RaspberryPi.MinecraftServerProperties[K];
	}

	set<K extends keyof RaspberryPi.MinecraftServerProperties>(
		property: K,
		value: RaspberryPi.MinecraftServerProperties[K],
	) {
		this._data[property] = value;
	}

	stringify() {
		const output = [];

		for (const key in this._data) {
			if (this._data.hasOwnProperty(key)) {
				output.push(`${key}=${this._stringifyValue(this._data[key])}`);
			}
		}

		const headerComments = `# Minecraft server properties\n# ${new Date().toUTCString()}\n`;

		return headerComments + output.join("\n");
	}

	private _parse(input: string): Partial<RaspberryPi.MinecraftServerProperties> {
		const output: Partial<RaspberryPi.MinecraftServerProperties> = {};

		input.split(/[\r\n]+/g).forEach((line) => {
			if (line[0] === "#" || line.indexOf("=") < 0) return; // just a comment

			const parts = line.split("=");
			const key = parts[0].trim();
			const val = parts[1].trim();

			if (!key) return;

			output[key] = this._parseValue(val);
		});

		return output;
	}

	private _parseValue(val: string) {
		if (val === "") return null;

		try {
			return JSON.parse(val);
		} catch (e) {
			// do nothing, this is just a short way to extract values like:
			// true, false, [Numbers], etc.
			return val;
		}
	}

	private _stringifyValue(val: string) {
		if (val === null) return "";
		if (typeof val === "string") return val;
		return JSON.stringify(val);
	}
}
