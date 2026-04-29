import { class_type } from "../fable-library-js.4.24.0/Reflection.js";
import { render } from "react-dom";

export class ReactDOM {
    constructor() {
    }
}

export function ReactDOM_$reflection() {
    return class_type("Feliz.ReactDOM", undefined, ReactDOM);
}

export function ReactDOM_render_Z3D10464(element, container) {
    return render(element(), container);
}

export class ReactDOMServer {
    constructor() {
    }
}

export function ReactDOMServer_$reflection() {
    return class_type("Feliz.ReactDOMServer", undefined, ReactDOMServer);
}

