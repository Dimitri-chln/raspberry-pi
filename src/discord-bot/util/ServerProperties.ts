import { MinecraftServerProperties } from "../types";

export default class ServerProperties {
	data: Partial<MinecraftServerProperties>;

	constructor(file: string) {
		this.data = this._parse(file);
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

	private _parse(input: string): Partial<MinecraftServerProperties> {
		const output: Partial<MinecraftServerProperties> = {};

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

	private _stringifyValue(val: string) {
		if (val === null) return "";
		if (typeof val === "string") return val;
		return JSON.stringify(val);
	}

	stringify() {
		const output = [];

		for (const key in this.data) {
			if (this.data.hasOwnProperty(key)) {
				output.push(`${key}=${this._stringifyValue(this.data[key])}`);
			}
		}

		const headerComments = `# Minecraft server properties\n# ${new Date().toUTCString()}\n`;

		return headerComments + output.join("\n");
	}
}
