import { Command } from "./lib/command";
import UtilsLogger from "./lib/logger";
import UtilsUser from "./lib/user";

class Utils {
	public logger = new UtilsLogger();
	public commands: Command[] = [];
	public user = new UtilsUser();
}

export default new Utils();
