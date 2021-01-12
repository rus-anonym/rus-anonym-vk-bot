import { ExtractDoc } from "ts-mongoose";
import Schemes from "./schemes";

export type MessageDocument = ExtractDoc<typeof Schemes.message>;
