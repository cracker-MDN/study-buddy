import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createElement } from "react";
import { createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { map, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { Msg } from "./Types.fs.js";
import { parse } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { map as map_1, singleton, append, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.24.0/Range.js";

function formatTime(seconds) {
    const m = ~~(seconds / 60) | 0;
    const s = (seconds % 60) | 0;
    return toText(printf("%02d:%02d"))(m)(s);
}

/**
 * Get total seconds for the current phase
 */
export function totalSecondsForPhase(settings, phase) {
    switch (phase.tag) {
        case 1:
            return (settings.ShortBreakMinutes * 60) | 0;
        case 2:
            return (settings.LongBreakMinutes * 60) | 0;
        default:
            return (settings.WorkMinutes * 60) | 0;
    }
}

function phaseLabel(phase) {
    switch (phase.tag) {
        case 1:
            return "Short Break";
        case 2:
            return "Long Break";
        default:
            return "Focus Time";
    }
}

function phaseColor(phase) {
    switch (phase.tag) {
        case 1:
            return "#2ecc71";
        case 2:
            return "#3498db";
        default:
            return "#e74c3c";
    }
}

function progressRing(progress, color, timeText, label) {
    let elems_1, elems;
    const circumference = (2 * 3.141592653589793) * 120;
    const offset = circumference * (1 - progress);
    const size = (120 + 8) * 2;
    const center = 120 + 8;
    return createElement("div", createObj(ofArray([["style", {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    }], (elems_1 = [createElement("svg", createObj(ofArray([["width", ~~size], ["height", ~~size], ["viewBox", toText(printf("0 0 %g %g"))(size)(size)], (elems = [createElement("circle", {
        cx: center,
        cy: center,
        r: 120,
        fill: "none",
        stroke: "rgba(255,255,255,0.1)",
        strokeWidth: 8,
    }), createElement("circle", {
        cx: center,
        cy: center,
        r: 120,
        fill: "none",
        stroke: color,
        strokeWidth: 8,
        strokeLinecap: "round",
        strokeDasharray: toText(printf("%g %g"))(circumference)(circumference),
        strokeDashoffset: offset,
        transform: toText(printf("rotate(-90 %g %g)"))(center)(center),
        style: {
            transitionProperty: "stroke-dashoffset",
            transitionDuration: 0.5 + "s",
        },
    }), createElement("text", {
        x: center,
        y: center - 10,
        fill: "white",
        fontSize: 48,
        fontWeight: "bold",
        textAnchor: "middle",
        dominantBaseline: "central",
        fontFamily: "monospace",
        children: timeText,
    }), createElement("text", {
        x: center,
        y: center + 30,
        fill: "rgba(255,255,255,0.7)",
        fontSize: 16,
        textAnchor: "middle",
        dominantBaseline: "central",
        children: label,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function subjectSelector(subjects, selected, dispatch) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "subject-selector"], (elems_1 = [createElement("label", {
        className: "label-text",
        children: "Studying:",
    }), createElement("select", createObj(ofArray([["className", "select-input"], ["value", (selected == null) ? "" : selected], ["onChange", (ev) => {
        const value_10 = ev.target.value;
        if (value_10 === "") {
            dispatch(new Msg(7, [undefined]));
        }
        else {
            dispatch(new Msg(7, [parse(value_10)]));
        }
    }], (elems = toList(delay(() => append(singleton(createElement("option", {
        value: "",
        children: "-- Select subject --",
    })), delay(() => map((subj) => createElement("option", {
        value: subj.Id,
        children: subj.Name,
    }), subjects))))), ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function pomodoroIndicator(completed, total) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "pomodoro-dots"], (elems = toList(delay(() => map_1((i) => createElement("span", {
        className: ((i <= (completed % total)) ? true : (((completed > 0) && ((completed % total) === 0)) && (i === total))) ? "dot filled" : "dot",
        children: "●",
    }), rangeDouble(1, 1, total)))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function timerControls(status, canStart, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "timer-controls"], (elems = toList(delay(() => ((status.tag === 1) ? singleton(createElement("button", {
        className: "btn btn-warning btn-large",
        children: "Pause",
        onClick: (_arg_1) => {
            dispatch(new Msg(2, []));
        },
    })) : ((status.tag === 2) ? append(singleton(createElement("button", {
        className: "btn btn-primary btn-large",
        children: "Resume",
        onClick: (_arg_2) => {
            dispatch(new Msg(3, []));
        },
    })), delay(() => singleton(createElement("button", {
        className: "btn btn-secondary btn-large",
        children: "Reset",
        onClick: (_arg_3) => {
            dispatch(new Msg(4, []));
        },
    })))) : ((status.tag === 3) ? singleton(createElement("button", {
        className: "btn btn-primary btn-large",
        children: "Continue",
        onClick: (_arg_4) => {
            dispatch(new Msg(4, []));
        },
    })) : singleton(createElement("button", {
        className: "btn btn-primary btn-large",
        children: "Start Focus",
        disabled: !canStart,
        onClick: (_arg) => {
            dispatch(new Msg(1, []));
        },
    }))))))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function notesInput(notes, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "notes-section"], (elems = [createElement("textarea", {
        className: "notes-input",
        placeholder: "Session notes (optional)...",
        value: notes,
        rows: 2,
        onChange: (ev) => {
            dispatch(new Msg(8, [ev.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

/**
 * Main timer view
 */
export function view(model, dispatch) {
    let elems;
    const totalSeconds = totalSecondsForPhase(model.Settings, model.TimerPhase) | 0;
    return createElement("div", createObj(ofArray([["className", "timer-page"], (elems = [progressRing((totalSeconds === 0) ? 0 : (model.SecondsRemaining / totalSeconds), phaseColor(model.TimerPhase), formatTime(model.SecondsRemaining), phaseLabel(model.TimerPhase)), pomodoroIndicator(model.CompletedPomodoros, model.Settings.LongBreakAfter), subjectSelector(model.Subjects, model.SelectedSubjectId, dispatch), notesInput(model.SessionNotes, dispatch), timerControls(model.TimerStatus, model.SelectedSubjectId != null, dispatch)], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

