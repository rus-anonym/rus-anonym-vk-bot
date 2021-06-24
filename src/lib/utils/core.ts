import { Command } from "./lib/command";
import Logger from "./lib/logger";
import User from "./lib/user";

class Utils {
	public logger = new Logger();
	public commands: Command[] = [];
	public user = new User();
}

export default new Utils();
