import { empty as empty_1 } from "../fable-library-js.4.24.0/Map.js";
import { comparePrimitives } from "../fable-library-js.4.24.0/Util.js";
import { ExtraCoders } from "./Types.fs.js";

export const empty = new ExtraCoders("", empty_1({
    Compare: comparePrimitives,
}));

