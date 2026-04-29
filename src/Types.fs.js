import { Union, Record } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { option_type, list_type, union_type, int32_type, record_type, string_type, class_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { nonSeeded } from "./fable_modules/fable-library-js.4.24.0/Random.js";
import { item } from "./fable_modules/fable-library-js.4.24.0/Array.js";

export class Subject extends Record {
    constructor(Id, Name, Color) {
        super();
        this.Id = Id;
        this.Name = Name;
        this.Color = Color;
    }
}

export function Subject_$reflection() {
    return record_type("StudyBuddy.Types.Subject", [], Subject, () => [["Id", class_type("System.Guid")], ["Name", string_type], ["Color", string_type]]);
}

export class StudySession extends Record {
    constructor(Id, SubjectId, StartedAt, DurationMinutes, Notes) {
        super();
        this.Id = Id;
        this.SubjectId = SubjectId;
        this.StartedAt = StartedAt;
        this.DurationMinutes = (DurationMinutes | 0);
        this.Notes = Notes;
    }
}

export function StudySession_$reflection() {
    return record_type("StudyBuddy.Types.StudySession", [], StudySession, () => [["Id", class_type("System.Guid")], ["SubjectId", class_type("System.Guid")], ["StartedAt", class_type("System.DateTime")], ["DurationMinutes", int32_type], ["Notes", string_type]]);
}

export class TimerStatus extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Idle", "Running", "Paused", "Finished"];
    }
}

export function TimerStatus_$reflection() {
    return union_type("StudyBuddy.Types.TimerStatus", [], TimerStatus, () => [[], [], [], []]);
}

export class PomodoroPhase extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Work", "ShortBreak", "LongBreak"];
    }
}

export function PomodoroPhase_$reflection() {
    return union_type("StudyBuddy.Types.PomodoroPhase", [], PomodoroPhase, () => [[], [], []]);
}

export class TimerSettings extends Record {
    constructor(WorkMinutes, ShortBreakMinutes, LongBreakMinutes, LongBreakAfter) {
        super();
        this.WorkMinutes = (WorkMinutes | 0);
        this.ShortBreakMinutes = (ShortBreakMinutes | 0);
        this.LongBreakMinutes = (LongBreakMinutes | 0);
        this.LongBreakAfter = (LongBreakAfter | 0);
    }
}

export function TimerSettings_$reflection() {
    return record_type("StudyBuddy.Types.TimerSettings", [], TimerSettings, () => [["WorkMinutes", int32_type], ["ShortBreakMinutes", int32_type], ["LongBreakMinutes", int32_type], ["LongBreakAfter", int32_type]]);
}

export function TimerSettings_get_Default() {
    return new TimerSettings(25, 5, 15, 4);
}

export class ActiveTab extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["TimerTab", "SessionsTab", "StatsTab", "SettingsTab"];
    }
}

export function ActiveTab_$reflection() {
    return union_type("StudyBuddy.Types.ActiveTab", [], ActiveTab, () => [[], [], [], []]);
}

export class Model extends Record {
    constructor(Subjects, Sessions, Settings, ActiveTab, TimerStatus, TimerPhase, SecondsRemaining, SelectedSubjectId, CompletedPomodoros, NewSubjectName, NewSubjectColor, SessionNotes, EditingSubjectId, EditingSubjectName) {
        super();
        this.Subjects = Subjects;
        this.Sessions = Sessions;
        this.Settings = Settings;
        this.ActiveTab = ActiveTab;
        this.TimerStatus = TimerStatus;
        this.TimerPhase = TimerPhase;
        this.SecondsRemaining = (SecondsRemaining | 0);
        this.SelectedSubjectId = SelectedSubjectId;
        this.CompletedPomodoros = (CompletedPomodoros | 0);
        this.NewSubjectName = NewSubjectName;
        this.NewSubjectColor = NewSubjectColor;
        this.SessionNotes = SessionNotes;
        this.EditingSubjectId = EditingSubjectId;
        this.EditingSubjectName = EditingSubjectName;
    }
}

export function Model_$reflection() {
    return record_type("StudyBuddy.Types.Model", [], Model, () => [["Subjects", list_type(Subject_$reflection())], ["Sessions", list_type(StudySession_$reflection())], ["Settings", TimerSettings_$reflection()], ["ActiveTab", ActiveTab_$reflection()], ["TimerStatus", TimerStatus_$reflection()], ["TimerPhase", PomodoroPhase_$reflection()], ["SecondsRemaining", int32_type], ["SelectedSubjectId", option_type(class_type("System.Guid"))], ["CompletedPomodoros", int32_type], ["NewSubjectName", string_type], ["NewSubjectColor", string_type], ["SessionNotes", string_type], ["EditingSubjectId", option_type(class_type("System.Guid"))], ["EditingSubjectName", string_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["SwitchTab", "StartTimer", "PauseTimer", "ResumeTimer", "ResetTimer", "Tick", "TimerFinished", "SelectSubject", "SetSessionNotes", "SetNewSubjectName", "SetNewSubjectColor", "AddSubject", "RemoveSubject", "StartEditSubject", "SetEditingSubjectName", "SaveEditSubject", "CancelEditSubject", "SetWorkMinutes", "SetShortBreakMinutes", "SetLongBreakMinutes", "SetLongBreakAfter", "ClearAllSessions", "RemoveSession"];
    }
}

export function Msg_$reflection() {
    return union_type("StudyBuddy.Types.Msg", [], Msg, () => [[["Item", ActiveTab_$reflection()]], [], [], [], [], [], [], [["Item", option_type(class_type("System.Guid"))]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", class_type("System.Guid")]], [["Item", class_type("System.Guid")]], [["Item", string_type]], [], [], [["Item", int32_type]], [["Item", int32_type]], [["Item", int32_type]], [["Item", int32_type]], [], [["Item", class_type("System.Guid")]]]);
}

export const Colors_palette = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e", "#16a085", "#c0392b", "#8e44ad", "#d35400"];

export function Colors_random() {
    const rng = nonSeeded();
    return item(rng.Next1(Colors_palette.length), Colors_palette);
}

