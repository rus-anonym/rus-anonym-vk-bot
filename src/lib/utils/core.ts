import UtilsUserCommands from "./lib/commands/plugins/user";
import UtilsSlaveCommands from "./lib/commands/plugins/slave";
import UtilsGroupCommands from "./lib/commands/plugins/group";
import UtilsLogger from "./lib/logger";
import UtilsUser from "./lib/user";
import UtilsGroup from "./lib/group";
import UtilsCommands from "./lib/utilsCommands";

class Utils {
	public logger = new UtilsLogger();
	public commands = new UtilsCommands();
	public userCommands = new UtilsUserCommands();
	public slaveCommands = new UtilsSlaveCommands();
	public groupCommands = new UtilsGroupCommands();
	public user = new UtilsUser();
	public group = new UtilsGroup();
}

export default new Utils();
