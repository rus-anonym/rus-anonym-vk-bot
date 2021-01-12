import Schemes from "./schemes";
import { typedModel } from "ts-mongoose";

const message = typedModel("message", Schemes.message, "messages");

export default { message };
