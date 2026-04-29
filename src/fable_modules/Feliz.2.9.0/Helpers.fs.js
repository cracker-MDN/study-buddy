import { iterate } from "../fable-library-js.4.24.0/Seq.js";
import { disposeSafe } from "../fable-library-js.4.24.0/Util.js";
import { toArray } from "../fable-library-js.4.24.0/Option.js";

export function optDispose(disposeOption) {
    return {
        Dispose() {
            iterate((d) => {
                let copyOfStruct = d;
                disposeSafe(copyOfStruct);
            }, toArray(disposeOption));
        },
    };
}

