import Fs from "node:fs";
import Path from "node:path";

import Util from "../Util";
import Service from "../structures/Service";

const task: RaspberryPi.Task = {
	intervalMs: 10_000,

	async action() {
		const serviceNames = Fs.readdirSync(process.env.SERVICES_PATH)
			.map((serviceGroupName) => Fs.readdirSync(Path.join(process.env.SERVICES_PATH, serviceGroupName)))
			.flat();

		// Remove services that don't exist anymore
		Util.services.sweep((_, serviceName) => !serviceNames.includes(serviceName));

		// Add new services
		serviceNames
			.filter((serviceName) => !Util.services.has(serviceName))
			.forEach((serviceName) => Util.services.set(serviceName, new Service(serviceName)));
	},
};

export default task;
