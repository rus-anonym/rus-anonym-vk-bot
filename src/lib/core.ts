import VK from "./VK/core";
import DB from "./DB/core";

DB.connection.once("open", function MongoDBConnected() {
	VK.user.main.updates.start();
	VK.group.main.updates.start();
});
