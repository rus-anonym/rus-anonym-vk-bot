import { UserCommand, GroupCommand } from "./lib/commands";
import UtilsLogger from "./lib/logger";
import UtilsUser from "./lib/user";
import UtilsGroup from "./lib/group";
import UtilsCommands from "./lib/utilsCommands";

class Utils {
	public logger = new UtilsLogger();
	public commands = new UtilsCommands();
	public userCommands: UserCommand[] = [];
	public groupCommands: GroupCommand[] = [];
	public user = new UtilsUser();
	public group = new UtilsGroup();
}

export default new Utils();
