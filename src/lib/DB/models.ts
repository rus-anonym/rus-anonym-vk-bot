import Schemes from "./schemes";
import { typedModel } from "ts-mongoose";

const user = typedModel("user", Schemes.user, "users");
const chat = typedModel("chat", Schemes.chat, "chats");
const message = typedModel("message", Schemes.message, "messages");

export default { user, chat, message };
