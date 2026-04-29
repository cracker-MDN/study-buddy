import { createElement } from "react";
import React from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { view, update, init } from "./App.fs.js";
import { useEffectWithDeps } from "./fable_modules/Feliz.2.9.0/./ReactInterop.js";
import { equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { Msg, TimerStatus } from "./Types.fs.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createRoot } from "react-dom/client";

/**
 * The root React component with manual Elmish-style state management
 */
export function AppComponent() {
    const patternInput = reactApi.useState(init);
    const model = patternInput[0];
    const dispatch = (msg) => {
        patternInput[1](update(msg, model));
    };
    useEffectWithDeps(() => {
        if (equals(model.TimerStatus, new TimerStatus(1, []))) {
            const intervalId = window.setInterval(() => {
                dispatch(new Msg(5, []));
            }, 1000);
            return {
                Dispose() {
                    window.clearInterval(intervalId);
                },
            };
        }
        else {
            return {
                Dispose() {
                },
            };
        }
    }, [model.TimerStatus]);
    const dependencies_1 = [model.TimerStatus];
    reactApi.useEffect(() => {
        if (equals(model.TimerStatus, new TimerStatus(3, []))) {
            (function(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;var c=new C();var o=c.createOscillator();var g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=800;g.gain.value=0.3;o.start();setTimeout(function(){o.stop();c.close();},500);}catch(e){}})();
        }
    }, dependencies_1);
    const dependencies_3 = [model.SecondsRemaining, model.TimerStatus];
    reactApi.useEffect(() => {
        if (equals(model.TimerStatus, new TimerStatus(1, [])) ? true : equals(model.TimerStatus, new TimerStatus(2, []))) {
            const m = ~~(model.SecondsRemaining / 60) | 0;
            const s = (model.SecondsRemaining % 60) | 0;
            let phase;
            const matchValue = model.TimerPhase;
            phase = ((matchValue.tag === 1) ? "Break" : ((matchValue.tag === 2) ? "Long Break" : "Focus"));
            document.title = toText(printf("%02d:%02d - %s | StudyBuddy"))(m)(s)(phase);
        }
        else {
            document.title = "StudyBuddy - Pomodoro Study Tracker";
        }
    }, dependencies_3);
    return view(model, dispatch);
}

export const root = createRoot(document.getElementById("app"));

root.render(createElement(AppComponent, null));

