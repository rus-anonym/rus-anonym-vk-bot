import { UserCommand, GroupCommand } from "./lib/commands";
import UtilsLogger from "./lib/logger";
import UtilsUser from "./lib/user";

class Utils {
	public logger = new UtilsLogger();
	public userCommands: UserCommand[] = [];
	public groupCommands: GroupCommand[] = [];
	public user = new UtilsUser();
}

export default new Utils();
