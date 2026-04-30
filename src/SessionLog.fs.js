import { today as today_1, equals, compare, date as date_1, minute, hour, day, month, year } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { map as map_1, isEmpty, filter, length, sumBy, sortByDescending, ofArray, tryFind } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { map, defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { createElement } from "react";
import { dateHash, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { collect, empty, singleton, append, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { Msg } from "./Types.fs.js";
import { List_groupBy } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";

function formatDate(dt) {
    const arg = year(dt) | 0;
    const arg_1 = month(dt) | 0;
    const arg_2 = day(dt) | 0;
    const arg_3 = hour(dt) | 0;
    const arg_4 = minute(dt) | 0;
    return toText(printf("%04d-%02d-%02d %02d:%02d"))(arg)(arg_1)(arg_2)(arg_3)(arg_4);
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return toText(printf("%d min"))(minutes);
    }
    else {
        const h = ~~(minutes / 60) | 0;
        const m = (minutes % 60) | 0;
        if (m === 0) {
            return toText(printf("%dh"))(h);
        }
        else {
            return toText(printf("%dh %dm"))(h)(m);
        }
    }
}

function findSubject(subjects, id) {
    return tryFind((s) => (s.Id === id), subjects);
}

function sessionCard(subjects, session, dispatch) {
    let elems_2, elems_1;
    const subject = findSubject(subjects, session.SubjectId);
    const subjectName = defaultArg(map((s) => s.Name, subject), "Unknown");
    return createElement("div", createObj(ofArray([["className", "session-card"], (elems_2 = [createElement("div", {
        className: "session-color-bar",
        style: {
            backgroundColor: defaultArg(map((s_1) => s_1.Color, subject), "#95a5a6"),
        },
    }), createElement("div", createObj(ofArray([["className", "session-info"], (elems_1 = toList(delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "session-header"], (elems = [createElement("span", {
            className: "session-subject",
            children: subjectName,
        }), createElement("span", {
            className: "session-duration",
            children: formatDuration(session.DurationMinutes),
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => append(singleton(createElement("div", {
            className: "session-date",
            children: formatDate(session.StartedAt),
        })), delay(() => ((session.Notes !== "") ? singleton(createElement("div", {
            className: "session-notes",
            children: session.Notes,
        })) : empty())))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("button", {
        className: "btn-icon btn-delete",
        title: "Delete session",
        children: "×",
        onClick: (_arg) => {
            dispatch(new Msg(22, [session.Id]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

function groupByDate(sessions) {
    return List_groupBy((s_1) => date_1(s_1.StartedAt), sortByDescending((s) => s.StartedAt, sessions, {
        Compare: compare,
    }), {
        Equals: equals,
        GetHashCode: dateHash,
    });
}

function daySummary(sessions) {
    const totalMinutes = sumBy((s) => s.DurationMinutes, sessions, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    }) | 0;
    const count = length(sessions) | 0;
    const arg_1 = (count === 1) ? "" : "s";
    const arg_2 = formatDuration(totalMinutes);
    return toText(printf("%d session%s • %s total"))(count)(arg_1)(arg_2);
}

function todaySummaryCard(sessions) {
    let elems_1, elems, arg_1;
    const today = today_1();
    const todaySessions = filter((s) => equals(date_1(s.StartedAt), today), sessions);
    const totalMinutes = sumBy((s_1) => s_1.DurationMinutes, todaySessions, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    }) | 0;
    const count = length(todaySessions) | 0;
    return createElement("div", createObj(ofArray([["className", "today-summary-card"], (elems_1 = [createElement("div", {
        className: "today-summary-icon",
        children: "📅",
    }), createElement("div", createObj(ofArray([["className", "today-summary-body"], (elems = [createElement("div", {
        className: "today-summary-value",
        children: formatDuration(totalMinutes),
    }), createElement("div", {
        className: "today-summary-label",
        children: "studied today",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", {
        className: "today-summary-sessions",
        children: (arg_1 = ((count === 1) ? "" : "s"), toText(printf("%d session%s"))(count)(arg_1)),
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

/**
 * Main session log view
 */
export function view(model, dispatch) {
    let elems_5;
    const grouped = groupByDate(model.Sessions);
    return createElement("div", createObj(ofArray([["className", "sessions-page"], (elems_5 = toList(delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "page-header"], (elems = toList(delay(() => append(singleton(createElement("h2", {
            children: "Study Log",
        })), delay(() => (!isEmpty(model.Sessions) ? singleton(createElement("button", {
            className: "btn btn-danger btn-small",
            children: "Clear All",
            onClick: (_arg) => {
                dispatch(new Msg(21, []));
            },
        })) : empty()))))), ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => append(singleton(todaySummaryCard(model.Sessions)), delay(() => {
            let elems_1, elems_4;
            return isEmpty(model.Sessions) ? singleton(createElement("div", createObj(ofArray([["className", "empty-state"], (elems_1 = [createElement("div", {
                className: "empty-icon",
                children: "📚",
            }), createElement("p", {
                children: "No study sessions yet.",
            }), createElement("p", {
                className: "empty-hint",
                children: "Start a Pomodoro timer to log your first session!",
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))) : singleton(createElement("div", createObj(ofArray([["className", "sessions-list"], (elems_4 = toList(delay(() => collect((matchValue) => {
                let elems_3;
                const sessions = matchValue[1];
                const date = matchValue[0];
                return singleton(createElement("div", createObj(ofArray([["className", "date-group"], (elems_3 = toList(delay(() => {
                    let elems_2, arg, arg_1, arg_2;
                    return append(singleton(createElement("div", createObj(ofArray([["className", "date-header"], (elems_2 = [createElement("span", {
                        className: "date-label",
                        children: (arg = (year(date) | 0), (arg_1 = (month(date) | 0), (arg_2 = (day(date) | 0), toText(printf("%04d-%02d-%02d"))(arg)(arg_1)(arg_2)))),
                    }), createElement("span", {
                        className: "date-summary",
                        children: daySummary(sessions),
                    })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])))), delay(() => map_1((s) => sessionCard(model.Subjects, s, dispatch), sessions)));
                })), ["children", reactApi.Children.toArray(Array.from(elems_3))])]))));
            }, grouped))), ["children", reactApi.Children.toArray(Array.from(elems_4))])]))));
        }))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_5))])])));
}

