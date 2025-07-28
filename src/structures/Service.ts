import ChildProcess from "node:child_process";
import EventEmitter from "node:events";

export default class Service<ExtraEvents extends Record<keyof ExtraEvents, any[]> = {}> extends EventEmitter<
	RaspberryPi.Events.Service | ExtraEvents
> {
	/**
	 * The name of the service
	 */
	readonly name: string;
	/**
	 * The PID of the service if running
	 */
	private _pid?: number;
	/**
	 * `journalctl` process which reads logs from the service
	 */
	private logWatcher: ChildProcess.ChildProcess;

	constructor(name: string) {
		if (!/^[\w-]+(?:@[\w+-]+)?$/.test(name))
			throw new Error(`Name must only contain alphanumeric characters and dashes (-), received "${name}"`);

		super();
		this.name = name;

		this.on("start", () => console.log(`Service ${this.name} started`));
		this.on("stop", () => console.log(`Service ${this.name} stopped`));
		this.on("restart", () => console.log(`Service ${this.name} restarted`));
		this.on("reload", () => console.log(`Service ${this.name} reloaded`));
	}

	get pid() {
		return this._pid;
	}

	isActive(): boolean {
		const systemctl = ChildProcess.spawnSync("systemctl", ["--user", "is-active", "--quiet", this.name]);
		return systemctl.status === 0;
	}

	async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl --user start ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);

				ChildProcess.exec(`systemctl --user show --property MainPID --value ${this.name}`, (error, stdout, stderr) => {
					if (error) return reject(error);
					this._pid = parseInt(stdout);
					this.emit("start");
					resolve();
				});
			});
		});
	}

	async stop(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl --user stop ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);
				this._pid = null;
				this.emit("stop");
				resolve();
			});
		});
	}

	async restart(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl --user restart ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);

				ChildProcess.exec(`systemctl --user show --property MainPID --value ${this.name}`, (error, stdout, stderr) => {
					if (error) return reject(error);
					this._pid = parseInt(stdout);
					this.emit("restart");
					resolve();
				});
			});
		});
	}

	async reload(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl --user reload ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);
				this.emit("reload");
				resolve();
			});
		});
	}

	async logs(lines: number): Promise<string> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(
				`journalctl --user --unit=${this.name} --lines=${lines} --no-pager`,
				(error, stdout, stderr) => {
					if (error) return reject(error);
					resolve(stdout);
				},
			);
		});
	}

	watchLogs(): void {
		this.logWatcher = ChildProcess.spawn("journalctl", ["--user", `--unit=${this.name}`, "--follow", "--no-pager"]);

		this.logWatcher.on("error", (error) => {
			throw new Error(`Child process journalctl encountered an error: ${error}`);
		});

		this.logWatcher.stdout.on("data", (data: Buffer) => {
			for (const line of data.toString("utf8").split("\n")) {
				this.emit("log", line);
			}
		});
	}

	stopLogs(): void {
		this.logWatcher.kill();
		this.logWatcher = null;
	}
}
