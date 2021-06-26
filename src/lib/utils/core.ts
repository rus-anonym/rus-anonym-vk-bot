import { Command } from "./lib/command";
import Logger from "./lib/logger";
import User from "./lib/user";
import DB from "./lib/db";

class Utils {
	public logger = new Logger();
	public commands: Command[] = [];
	public user = new User();
	public DB = new DB();
}

export default new Utils();
