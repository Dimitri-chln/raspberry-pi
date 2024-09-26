import ChildProcess from "node:child_process";

export default class Service {
	readonly name: string;
	private _pid?: number;

	constructor(name: string) {
		if (!/^[\w]+$/.test(name)) throw new Error("Name must only contain alphanumeric characters");
		this.name = name;
	}

	get pid() {
		return this._pid;
	}

	isActive(): boolean {
		const systemctl = ChildProcess.spawnSync(`systemctl is-active --quiet ${this.name}`);
		return systemctl.status === 0;
	}

	async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl start ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);

				ChildProcess.exec(`systemctl show --property MainPID --value ${this.name}`, (error, stdout, stderr) => {
					if (error) return reject(error);
					this._pid = parseInt(stdout);
					resolve();
				});
			});
		});
	}

	async stop(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl stop ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);
				this._pid = null;
				resolve();
			});
		});
	}

	async restart(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl restart ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);

				ChildProcess.exec(`systemctl show --property MainPID --value ${this.name}`, (error, stdout, stderr) => {
					if (error) return reject(error);
					this._pid = parseInt(stdout);
					resolve();
				});
			});
		});
	}

	async reload(): Promise<void> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`systemctl reload ${this.name}`, (error, stdout, stderr) => {
				if (error) return reject(error);
				resolve();
			});
		});
	}

	async logs(lines: number): Promise<string> {
		return new Promise((resolve, reject) => {
			ChildProcess.exec(`journalctl --unit=${this.name} --lines=${lines} --no-pager`, (error, stdout, stderr) => {
				if (error) return reject(error);
				resolve(stdout);
			});
		});
	}
}
