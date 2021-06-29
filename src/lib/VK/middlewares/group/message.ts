import { MessageContext } from "vk-io";

// import InternalUtils from "../../../utils/core";
// import VK from "../../../VK/core";

function userMessageHandler(message: MessageContext): void {
	console.log(message);
}

export default userMessageHandler;
