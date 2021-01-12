import { user } from "../../core";
import Models from "../../../DB/models";

user.main.updates.on("message", async function (message) {
	console.log(message);
	const savedMessage = new Models.message({
		id: message.id,
		events: [message.toJSON()],
		messageData: [
			(
				await user
					.getVK()
					.api.messages.getById({ message_ids: message.id, extended: 1 })
			).items[0],
		],
	});
	console.log(savedMessage);
	await savedMessage.save();
});
