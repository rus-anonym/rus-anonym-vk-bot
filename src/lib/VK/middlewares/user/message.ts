import { MessageContext as messages } from "vk-io";

async function handler(message: messages) {
	console.log(message);
}

export default handler;
