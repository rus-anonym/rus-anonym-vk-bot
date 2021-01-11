import { user } from "../../core";

user.main.updates.on("message", async function (message) {
	console.log(message);
});
