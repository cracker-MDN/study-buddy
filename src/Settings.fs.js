import { createElement } from "react";
import { equals, round, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { isEmpty, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { collect, singleton, append, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { Msg } from "./Types.fs.js";

function numberInput(label, value, min, max, onChange, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "setting-row"], (elems = [createElement("label", {
        className: "setting-label",
        children: label,
    }), createElement("input", {
        className: "setting-input",
        type: "number",
        value: value,
        min: min,
        max: max,
        onChange: (ev) => {
            const value_16 = ev.target.valueAsNumber;
            if (!(value_16 == null) && !Number.isNaN(value_16)) {
                dispatch(onChange(round(value_16)));
            }
        },
    }), createElement("span", {
        className: "setting-unit",
        children: "min",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function subjectItem(subject, isEditing, editName, dispatch) {
    let elems_1;
    return createElement("div", createObj(ofArray([["className", "subject-item"], (elems_1 = toList(delay(() => append(singleton(createElement("div", {
        className: "subject-color-dot",
        style: {
            backgroundColor: subject.Color,
        },
    })), delay(() => (isEditing ? append(singleton(createElement("input", {
        className: "subject-edit-input",
        value: editName,
        autoFocus: true,
        onChange: (ev) => {
            dispatch(new Msg(14, [ev.target.value]));
        },
        onKeyDown: (e) => {
            switch (e.key) {
                case "Enter": {
                    dispatch(new Msg(15, []));
                    break;
                }
                case "Escape": {
                    dispatch(new Msg(16, []));
                    break;
                }
                default:
                    undefined;
            }
        },
    })), delay(() => append(singleton(createElement("button", {
        className: "btn-icon btn-save",
        title: "Save",
        children: "✓",
        onClick: (_arg) => {
            dispatch(new Msg(15, []));
        },
    })), delay(() => singleton(createElement("button", {
        className: "btn-icon",
        title: "Cancel",
        children: "✗",
        onClick: (_arg_1) => {
            dispatch(new Msg(16, []));
        },
    })))))) : append(singleton(createElement("span", {
        className: "subject-name",
        children: subject.Name,
    })), delay(() => {
        let elems;
        return singleton(createElement("div", createObj(ofArray([["className", "subject-actions"], (elems = [createElement("button", {
            className: "btn-icon",
            title: "Edit",
            children: "✎",
            onClick: (_arg_2) => {
                dispatch(new Msg(13, [subject.Id]));
            },
        }), createElement("button", {
            className: "btn-icon btn-delete",
            title: "Delete",
            children: "×",
            onClick: (_arg_3) => {
                dispatch(new Msg(12, [subject.Id]));
            },
        })], ["children", reactApi.Children.toArray(Array.from(elems))])]))));
    }))))))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function addSubjectForm(name, color, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "add-subject-form"], (elems = [createElement("input", {
        className: "subject-name-input",
        placeholder: "New subject name...",
        value: name,
        onChange: (ev) => {
            dispatch(new Msg(9, [ev.target.value]));
        },
        onKeyDown: (e) => {
            if ((e.key === "Enter") && (name.trim() !== "")) {
                dispatch(new Msg(11, []));
            }
        },
    }), createElement("input", {
        className: "subject-color-input",
        type: "color",
        value: color,
        onChange: (ev_1) => {
            dispatch(new Msg(10, [ev_1.target.value]));
        },
    }), createElement("button", {
        className: "btn btn-primary btn-small",
        children: "Add",
        disabled: name.trim() === "",
        onClick: (_arg) => {
            dispatch(new Msg(11, []));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

/**
 * Main settings view
 */
export function view(model, dispatch) {
    let elems_3, elems, elems_2;
    return createElement("div", createObj(ofArray([["className", "settings-page"], (elems_3 = [createElement("h2", {
        children: "Settings",
    }), createElement("div", createObj(ofArray([["className", "settings-section"], (elems = [createElement("h3", {
        children: "Pomodoro Timer",
    }), numberInput("Work duration", model.Settings.WorkMinutes, 1, 120, (Item) => (new Msg(17, [Item])), dispatch), numberInput("Short break", model.Settings.ShortBreakMinutes, 1, 30, (Item_1) => (new Msg(18, [Item_1])), dispatch), numberInput("Long break", model.Settings.LongBreakMinutes, 1, 60, (Item_2) => (new Msg(19, [Item_2])), dispatch), numberInput("Long break after", model.Settings.LongBreakAfter, 2, 10, (Item_3) => (new Msg(20, [Item_3])), dispatch)], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "settings-section"], (elems_2 = toList(delay(() => append(singleton(createElement("h3", {
        children: "Subjects",
    })), delay(() => append(singleton(addSubjectForm(model.NewSubjectName, model.NewSubjectColor, dispatch)), delay(() => {
        let elems_1;
        return isEmpty(model.Subjects) ? singleton(createElement("p", {
            className: "empty-hint",
            children: "Add your first subject to start tracking study time.",
        })) : singleton(createElement("div", createObj(ofArray([["className", "subjects-list"], (elems_1 = toList(delay(() => collect((subject) => singleton(subjectItem(subject, equals(model.EditingSubjectId, subject.Id), model.EditingSubjectName, dispatch)), model.Subjects))), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
    })))))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

