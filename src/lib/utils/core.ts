import { Command } from "./lib/command";
import Logger from "./lib/logger";

class Utils {
	public logger = new Logger();
	public commands: Command[] = [];
}

export default new Utils();
