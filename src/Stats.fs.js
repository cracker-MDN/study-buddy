import { dayOfWeek, equals, date as date_2, compare, now, addDays } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { op_UnaryNegation_Int32 } from "./fable_modules/fable-library-js.4.24.0/Int32.js";
import { ofArray, singleton, mapIndexed, length, max as max_1, isEmpty, tryFind, map, sortByDescending, sumBy, filter } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { map as map_1, defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { List_groupBy } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";
import { int32ToString, createObj, comparePrimitives, stringHash } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { defaultOf } from "./fable_modules/Feliz.2.9.0/../.././fable_modules/fable-library-js.4.24.0/Util.js";
import { max } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { createElement } from "react";
import { append, singleton as singleton_1, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.24.0/Range.js";
import { item } from "./fable_modules/fable-library-js.4.24.0/Array.js";

function sessionsInRange(days, sessions) {
    const cutoff = addDays(now(), op_UnaryNegation_Int32(days));
    return filter((s) => (compare(s.StartedAt, cutoff) >= 0), sessions);
}

function totalMinutes(sessions) {
    return sumBy((s) => s.DurationMinutes, sessions, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
}

function formatHours(minutes) {
    const h = ~~(minutes / 60) | 0;
    const m = (minutes % 60) | 0;
    if (h === 0) {
        return toText(printf("%d min"))(m);
    }
    else if (m === 0) {
        return toText(printf("%d h"))(h);
    }
    else {
        return toText(printf("%d h %d min"))(h)(m);
    }
}

function subjectBreakdown(subjects, sessions) {
    return sortByDescending((tupledArg_1) => tupledArg_1[2], map((tupledArg) => {
        const subject = tryFind((s_1) => (s_1.Id === tupledArg[0]), subjects);
        return [defaultArg(map_1((s_2) => s_2.Name, subject), "Unknown"), defaultArg(map_1((s_3) => s_3.Color, subject), "#95a5a6"), sumBy((s_4) => s_4.DurationMinutes, tupledArg[1], {
            GetZero: () => 0,
            Add: (x_1, y_1) => (x_1 + y_1),
        })];
    }, List_groupBy((s) => s.SubjectId, sessions, {
        Equals: (x, y) => (x === y),
        GetHashCode: stringHash,
    })), {
        Compare: comparePrimitives,
    });
}

function barChart(data) {
    let elems_2, arg, elems_1;
    if (isEmpty(data)) {
        return defaultOf();
    }
    else {
        const maxVal = max(1, max_1(map((tupledArg) => tupledArg[2], data), {
            Compare: comparePrimitives,
        })) | 0;
        const totalHeight = length(data) * (32 + 12);
        return createElement("div", createObj(ofArray([["className", "chart-container"], (elems_2 = [createElement("svg", createObj(ofArray([["width", ~~((120 + 500) + 60)], ["height", ~~totalHeight], ["viewBox", (arg = ((120 + 500) + 60), toText(printf("0 0 %g %g"))(arg)(totalHeight))], ["style", {
            maxWidth: 100 + "%",
        }], (elems_1 = toList(delay(() => mapIndexed((i, tupledArg_1) => {
            let elems;
            const name = tupledArg_1[0];
            const value_12 = tupledArg_1[2] | 0;
            const y_1 = i * (32 + 12);
            const barWidth = (value_12 / maxVal) * 500;
            return createElement("g", createObj(singleton((elems = [createElement("text", {
                x: 120 - 8,
                y: y_1 + (32 / 2),
                fill: "var(--text-secondary)",
                fontSize: 13,
                textAnchor: "end",
                dominantBaseline: "central",
                children: (name.length > 14) ? (name.slice(undefined, 11 + 1) + "...") : name,
            }), createElement("rect", {
                x: 120,
                y: y_1,
                width: 500,
                height: 32,
                rx: 4,
                ry: 4,
                fill: "rgba(255,255,255,0.05)",
            }), createElement("rect", {
                x: 120,
                y: y_1,
                width: max(barWidth, 4),
                height: 32,
                rx: 4,
                ry: 4,
                fill: tupledArg_1[1],
                style: {
                    transitionProperty: "width",
                    transitionDuration: 0.6 + "s",
                },
            }), createElement("text", {
                x: (120 + barWidth) + 8,
                y: y_1 + (32 / 2),
                fill: "var(--text-secondary)",
                fontSize: 12,
                dominantBaseline: "central",
                children: formatHours(value_12),
            })], ["children", reactApi.Children.toArray(Array.from(elems))]))));
        }, data))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
    }
}

function statCard(label, value, icon) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "stat-card"], (elems_1 = [createElement("div", {
        className: "stat-icon",
        children: icon,
    }), createElement("div", createObj(ofArray([["className", "stat-content"], (elems = [createElement("div", {
        className: "stat-value",
        children: value,
    }), createElement("div", {
        className: "stat-label",
        children: label,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function weeklyActivity(sessions) {
    let elems_3, elems_2;
    const today = date_2(now());
    const days = toList(delay(() => collect((i) => {
        const date = addDays(today, op_UnaryNegation_Int32(i));
        return singleton_1([date, sumBy((s_1) => s_1.DurationMinutes, filter((s) => equals(date_2(s.StartedAt), date), sessions), {
            GetZero: () => 0,
            Add: (x, y) => (x + y),
        })]);
    }, rangeDouble(6, -1, 0))));
    const maxMins = max(1, max_1(map((tuple) => tuple[1], days), {
        Compare: comparePrimitives,
    })) | 0;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return createElement("div", createObj(ofArray([["className", "weekly-chart"], (elems_3 = [createElement("h3", {
        children: "This Week",
    }), createElement("div", createObj(ofArray([["className", "week-bars"], (elems_2 = toList(delay(() => collect((matchValue) => {
        let elems_1, elems;
        const mins = matchValue[1] | 0;
        const date_1 = matchValue[0];
        const heightPct = (mins / maxMins) * 100;
        const dayName = item(dayOfWeek(date_1), dayNames);
        return singleton_1(createElement("div", createObj(ofArray([["className", "week-bar-col"], (elems_1 = [createElement("div", createObj(ofArray([["className", "week-bar-track"], (elems = [createElement("div", {
            className: "week-bar-fill",
            style: {
                height: heightPct + "%",
                backgroundColor: equals(date_1, today) ? "#e74c3c" : "#3498db",
            },
        })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("span", {
            className: "week-bar-label",
            children: dayName,
        }), createElement("span", {
            className: "week-bar-value",
            children: (mins > 0) ? toText(printf("%dm"))(mins) : "",
        })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
    }, days))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

/**
 * Main statistics view
 */
export function view(model, _dispatch) {
    let elems_3;
    const recentSessions = sessionsInRange(30, model.Sessions);
    const weekSessions = sessionsInRange(7, model.Sessions);
    const total = totalMinutes(recentSessions) | 0;
    const sessionCount = length(recentSessions) | 0;
    const avgPerSession = ((sessionCount === 0) ? 0 : ~~(total / sessionCount)) | 0;
    const breakdown = subjectBreakdown(model.Subjects, recentSessions);
    return createElement("div", createObj(ofArray([["className", "stats-page"], (elems_3 = toList(delay(() => append(singleton_1(createElement("h2", {
        children: "Study Statistics",
    })), delay(() => append(singleton_1(createElement("p", {
        className: "stats-subtitle",
        children: "Last 30 days",
    })), delay(() => {
        let elems;
        return append(singleton_1(createElement("div", createObj(ofArray([["className", "stat-cards"], (elems = [statCard("Total Study Time", formatHours(total), "⏱️"), statCard("Sessions", int32ToString(sessionCount), "📋"), statCard("Avg / Session", formatHours(avgPerSession), "📊"), statCard("Subjects", int32ToString(length(breakdown)), "📚")], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => append(singleton_1(weeklyActivity(weekSessions)), delay(() => {
            let elems_1, elems_2;
            return !isEmpty(breakdown) ? singleton_1(createElement("div", createObj(ofArray([["className", "breakdown-section"], (elems_1 = [createElement("h3", {
                children: "Time per Subject",
            }), barChart(breakdown)], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))) : singleton_1(createElement("div", createObj(ofArray([["className", "empty-state"], (elems_2 = [createElement("p", {
                children: "Complete some study sessions to see your statistics!",
            })], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))));
        }))));
    })))))), ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

