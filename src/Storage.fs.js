import { list as list_1, toString, datetime, guid, object } from "./fable_modules/Thoth.Json.10.2.0/Encode.fs.js";
import { list as list_2, fromString, int, datetime as datetime_1, string, guid as guid_1, object as object_1 } from "./fable_modules/Thoth.Json.10.2.0/Decode.fs.js";
import { TimerSettings_get_Default, TimerSettings, StudySession, Subject } from "./Types.fs.js";
import { uncurry2 } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { bind, defaultArg, ofNullable } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { empty, map } from "./fable_modules/fable-library-js.4.24.0/List.js";

export function Encode_subject(s) {
    return object([["id", guid(s.Id)], ["name", s.Name], ["color", s.Color]]);
}

export function Encode_session(s) {
    return object([["id", guid(s.Id)], ["subjectId", guid(s.SubjectId)], ["startedAt", datetime(s.StartedAt)], ["durationMinutes", s.DurationMinutes], ["notes", s.Notes]]);
}

export function Encode_settings(s) {
    return object([["workMinutes", s.WorkMinutes], ["shortBreakMinutes", s.ShortBreakMinutes], ["longBreakMinutes", s.LongBreakMinutes], ["longBreakAfter", s.LongBreakAfter]]);
}

export const Decode_subject = (path_3) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2;
    return new Subject((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("name", string)), (objectArg_2 = get$.Required, objectArg_2.Field("color", string)));
}, path_3, v));

export const Decode_session = (path_4) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4;
    return new StudySession((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("subjectId", guid_1)), (objectArg_2 = get$.Required, objectArg_2.Field("startedAt", datetime_1)), (objectArg_3 = get$.Required, objectArg_3.Field("durationMinutes", uncurry2(int))), (objectArg_4 = get$.Required, objectArg_4.Field("notes", string)));
}, path_4, v));

export const Decode_settings = (path) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3;
    return new TimerSettings((objectArg = get$.Required, objectArg.Field("workMinutes", uncurry2(int))), (objectArg_1 = get$.Required, objectArg_1.Field("shortBreakMinutes", uncurry2(int))), (objectArg_2 = get$.Required, objectArg_2.Field("longBreakMinutes", uncurry2(int))), (objectArg_3 = get$.Required, objectArg_3.Field("longBreakAfter", uncurry2(int))));
}, path, v));

function save(key, value) {
    window.localStorage.setItem(key, value);
}

function load(key) {
    return ofNullable(window.localStorage.getItem(key));
}

/**
 * Save subjects list
 */
export function saveSubjects(subjects) {
    save("studybuddy_subjects", toString(0, list_1(map(Encode_subject, subjects))));
}

/**
 * Load subjects list
 */
export function loadSubjects() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_subject), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("studybuddy_subjects")), empty());
}

/**
 * Save sessions list
 */
export function saveSessions(sessions) {
    save("studybuddy_sessions", toString(0, list_1(map(Encode_session, sessions))));
}

/**
 * Load sessions list
 */
export function loadSessions() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_session), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("studybuddy_sessions")), empty());
}

/**
 * Save timer settings
 */
export function saveSettings(settings) {
    save("studybuddy_settings", toString(0, Encode_settings(settings)));
}

/**
 * Load timer settings
 */
export function loadSettings() {
    return defaultArg(bind((json) => {
        const matchValue = fromString(uncurry2(Decode_settings), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("studybuddy_settings")), TimerSettings_get_Default());
}

