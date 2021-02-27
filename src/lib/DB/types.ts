import { ExtractDoc } from "ts-mongoose";
import Schemes from "./schemes";

export type UserDocument = ExtractDoc<typeof Schemes.user>;
export type ChatDocument = ExtractDoc<typeof Schemes.chat>;
export type MessageDocument = ExtractDoc<typeof Schemes.message>;
