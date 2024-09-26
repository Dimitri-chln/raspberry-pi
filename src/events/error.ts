import Util from "../Util";

const event: RaspberryPi.Event = {
	name: "error",
	once: false,

	run: async (error: Error) => {
		console.error(error);
	},
};

export default event;
