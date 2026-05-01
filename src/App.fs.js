import { saveSettings, saveSubjects, saveSessions, loadSettings, loadSessions, loadSubjects } from "./Storage.fs.js";
import { Msg, TimerSettings, Subject, StudySession, Model, Colors_random, PomodoroPhase, TimerStatus as TimerStatus_5, ActiveTab } from "./Types.fs.js";
import { defaultArg, map } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { ofArray, empty, map as map_1, tryFind, filter, singleton, append, cons, tryHead } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { newGuid } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { now, addMinutes } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { op_UnaryNegation_Int32 } from "./fable_modules/fable-library-js.4.24.0/Int32.js";
import { view as view_4, totalSecondsForPhase } from "./Timer.fs.js";
import { createObj, equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { createElement } from "react";
import { empty as empty_1, singleton as singleton_1, append as append_1, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { toString } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { view as view_1 } from "./SessionLog.fs.js";
import { view as view_2 } from "./Stats.fs.js";
import { view as view_3 } from "./Settings.fs.js";

/**
 * Initialize the application state from localStorage
 */
export function init() {
    const subjects = loadSubjects();
    const sessions = loadSessions();
    const settings = loadSettings();
    return new Model(subjects, sessions, settings, new ActiveTab(0, []), new TimerStatus_5(0, []), new PomodoroPhase(0, []), settings.WorkMinutes * 60, map((s) => s.Id, tryHead(subjects)), 0, "", Colors_random(), "", undefined, "");
}

function nextPhase(model) {
    const matchValue = model.TimerPhase;
    switch (matchValue.tag) {
        case 1:
        case 2:
            return [new PomodoroPhase(0, []), model.CompletedPomodoros];
        default: {
            const newCompleted = (model.CompletedPomodoros + 1) | 0;
            if ((newCompleted % model.Settings.LongBreakAfter) === 0) {
                return [new PomodoroPhase(2, []), newCompleted];
            }
            else {
                return [new PomodoroPhase(1, []), newCompleted];
            }
        }
    }
}

function recordSession(model) {
    const matchValue = model.SelectedSubjectId;
    let matchResult, subjectId;
    if (matchValue != null) {
        if (model.TimerPhase.tag === 0) {
            matchResult = 0;
            subjectId = matchValue;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const newSessions = cons(new StudySession(newGuid(), subjectId, addMinutes(now(), op_UnaryNegation_Int32(model.Settings.WorkMinutes)), model.Settings.WorkMinutes, model.SessionNotes.trim()), model.Sessions);
            saveSessions(newSessions);
            return newSessions;
        }
        default:
            return model.Sessions;
    }
}

/**
 * Update function — pure state transitions
 */
export function update(msg, model) {
    switch (msg.tag) {
        case 1:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, new TimerStatus_5(1, []), model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 2:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, new TimerStatus_5(2, []), model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 3:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, new TimerStatus_5(1, []), model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 4:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, new TimerStatus_5(0, []), model.TimerPhase, totalSecondsForPhase(model.Settings, model.TimerPhase), model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 5:
            if (equals(model.TimerStatus, new TimerStatus_5(1, [])) && (model.SecondsRemaining > 0)) {
                return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining - 1, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
            }
            else if (equals(model.TimerStatus, new TimerStatus_5(1, [])) && (model.SecondsRemaining === 0)) {
                const newSessions = recordSession(model);
                const patternInput = nextPhase(model);
                const newPhase = patternInput[0];
                return new Model(model.Subjects, newSessions, model.Settings, model.ActiveTab, new TimerStatus_5(3, []), newPhase, totalSecondsForPhase(model.Settings, newPhase), model.SelectedSubjectId, patternInput[1], model.NewSubjectName, model.NewSubjectColor, "", model.EditingSubjectId, model.EditingSubjectName);
            }
            else {
                return model;
            }
        case 6:
            return model;
        case 7:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, msg.fields[0], model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 8:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, msg.fields[0], model.EditingSubjectId, model.EditingSubjectName);
        case 9:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, msg.fields[0], model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 10:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, msg.fields[0], model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        case 11: {
            const trimmed = model.NewSubjectName.trim();
            if (trimmed === "") {
                return model;
            }
            else {
                const subject = new Subject(newGuid(), trimmed, model.NewSubjectColor);
                const newSubjects = append(model.Subjects, singleton(subject));
                saveSubjects(newSubjects);
                return new Model(newSubjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, (model.SelectedSubjectId == null) ? subject.Id : model.SelectedSubjectId, model.CompletedPomodoros, "", Colors_random(), model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
            }
        }
        case 12: {
            const id_1 = msg.fields[0];
            const newSubjects_1 = filter((s) => (s.Id !== id_1), model.Subjects);
            saveSubjects(newSubjects_1);
            return new Model(newSubjects_1, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, equals(model.SelectedSubjectId, id_1) ? map((s_1) => s_1.Id, tryHead(newSubjects_1)) : model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 13: {
            const id_2 = msg.fields[0];
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, id_2, defaultArg(map((s_3) => s_3.Name, tryFind((s_2) => (s_2.Id === id_2), model.Subjects)), ""));
        }
        case 14:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, msg.fields[0]);
        case 15: {
            const matchValue = model.EditingSubjectId;
            if (matchValue == null) {
                return model;
            }
            else {
                const id_3 = matchValue;
                const trimmed_1 = model.EditingSubjectName.trim();
                if (trimmed_1 === "") {
                    return model;
                }
                else {
                    const newSubjects_2 = map_1((s_4) => {
                        if (s_4.Id === id_3) {
                            return new Subject(s_4.Id, trimmed_1, s_4.Color);
                        }
                        else {
                            return s_4;
                        }
                    }, model.Subjects);
                    saveSubjects(newSubjects_2);
                    return new Model(newSubjects_2, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, undefined, "");
                }
            }
        }
        case 16:
            return new Model(model.Subjects, model.Sessions, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, undefined, "");
        case 17: {
            const v = msg.fields[0] | 0;
            let newSettings;
            const bind$0040 = model.Settings;
            newSettings = (new TimerSettings(v, bind$0040.ShortBreakMinutes, bind$0040.LongBreakMinutes, bind$0040.LongBreakAfter));
            saveSettings(newSettings);
            return new Model(model.Subjects, model.Sessions, newSettings, model.ActiveTab, model.TimerStatus, model.TimerPhase, (equals(model.TimerStatus, new TimerStatus_5(0, [])) && equals(model.TimerPhase, new PomodoroPhase(0, []))) ? (v * 60) : model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 18: {
            const v_1 = msg.fields[0] | 0;
            let newSettings_1;
            const bind$0040_1 = model.Settings;
            newSettings_1 = (new TimerSettings(bind$0040_1.WorkMinutes, v_1, bind$0040_1.LongBreakMinutes, bind$0040_1.LongBreakAfter));
            saveSettings(newSettings_1);
            return new Model(model.Subjects, model.Sessions, newSettings_1, model.ActiveTab, model.TimerStatus, model.TimerPhase, (equals(model.TimerStatus, new TimerStatus_5(0, [])) && equals(model.TimerPhase, new PomodoroPhase(1, []))) ? (v_1 * 60) : model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 19: {
            const v_2 = msg.fields[0] | 0;
            let newSettings_2;
            const bind$0040_2 = model.Settings;
            newSettings_2 = (new TimerSettings(bind$0040_2.WorkMinutes, bind$0040_2.ShortBreakMinutes, v_2, bind$0040_2.LongBreakAfter));
            saveSettings(newSettings_2);
            return new Model(model.Subjects, model.Sessions, newSettings_2, model.ActiveTab, model.TimerStatus, model.TimerPhase, (equals(model.TimerStatus, new TimerStatus_5(0, [])) && equals(model.TimerPhase, new PomodoroPhase(2, []))) ? (v_2 * 60) : model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 20: {
            let newSettings_3;
            const bind$0040_3 = model.Settings;
            newSettings_3 = (new TimerSettings(bind$0040_3.WorkMinutes, bind$0040_3.ShortBreakMinutes, bind$0040_3.LongBreakMinutes, msg.fields[0]));
            saveSettings(newSettings_3);
            return new Model(model.Subjects, model.Sessions, newSettings_3, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 21: {
            saveSessions(empty());
            return new Model(model.Subjects, empty(), model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        case 22: {
            const newSessions_1 = filter((s_5) => (s_5.Id !== msg.fields[0]), model.Sessions);
            saveSessions(newSessions_1);
            return new Model(model.Subjects, newSessions_1, model.Settings, model.ActiveTab, model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
        }
        default:
            return new Model(model.Subjects, model.Sessions, model.Settings, msg.fields[0], model.TimerStatus, model.TimerPhase, model.SecondsRemaining, model.SelectedSubjectId, model.CompletedPomodoros, model.NewSubjectName, model.NewSubjectColor, model.SessionNotes, model.EditingSubjectId, model.EditingSubjectName);
    }
}

function navbar(activeTab, timerStatus, dispatch) {
    let elems_2;
    const tabButton = (tab, icon, label) => {
        let elems_1, elems;
        const showPulse = equals(tab, new ActiveTab(0, [])) && equals(timerStatus, new TimerStatus_5(1, []));
        return createElement("button", createObj(ofArray([["className", equals(activeTab, tab) ? "nav-tab active" : "nav-tab"], ["onClick", (_arg) => {
            dispatch(new Msg(0, [tab]));
        }], (elems_1 = [createElement("div", createObj(ofArray([["className", "nav-icon-wrap"], (elems = toList(delay(() => append_1(singleton_1(createElement("span", {
            className: "nav-icon",
            children: icon,
        })), delay(() => (showPulse ? singleton_1(createElement("span", {
            className: "nav-pulse",
        })) : empty_1()))))), ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("span", {
            className: "nav-label",
            children: label,
        })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
    };
    return createElement("nav", createObj(ofArray([["className", "navbar"], (elems_2 = [tabButton(new ActiveTab(0, []), "⏱️", "Timer"), tabButton(new ActiveTab(1, []), "📋", "Log"), tabButton(new ActiveTab(2, []), "📊", "Stats"), tabButton(new ActiveTab(3, []), "⚙️", "Settings")], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

/**
 * Main application view
 */
export function view(model, dispatch) {
    let elems_3, elems, elems_2, elems_1;
    return createElement("div", createObj(ofArray([["className", "app-container"], (elems_3 = [createElement("header", createObj(ofArray([["className", "app-header"], (elems = [createElement("h1", {
        children: "StudyBuddy",
    }), createElement("span", {
        className: "app-subtitle",
        children: "Pomodoro Study Tracker",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("main", createObj(ofArray([["className", "app-main"], (elems_2 = [createElement("div", createObj(ofArray([["key", toString(model.ActiveTab)], ["className", "tab-content"], (elems_1 = toList(delay(() => {
        const matchValue = model.ActiveTab;
        return (matchValue.tag === 1) ? singleton_1(view_1(model, dispatch)) : ((matchValue.tag === 2) ? singleton_1(view_2(model, dispatch)) : ((matchValue.tag === 3) ? singleton_1(view_3(model, dispatch)) : singleton_1(view_4(model, dispatch))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))), navbar(model.ActiveTab, model.TimerStatus, dispatch)], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

