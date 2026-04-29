module StudyBuddy.Settings

open System
open Feliz
open StudyBuddy.Types

/// Number input with label
let private numberInput (label: string) (value: int) (min: int) (max: int) (onChange: int -> Msg) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "setting-row"
        prop.children [
            Html.label [ prop.className "setting-label"; prop.text label ]
            Html.input [
                prop.className "setting-input"
                prop.type'.number
                prop.value value
                prop.min min
                prop.max max
                prop.onChange (fun (v: int) -> dispatch (onChange v))
            ]
            Html.span [ prop.className "setting-unit"; prop.text "min" ]
        ]
    ]

/// Render a single subject item in the management list
let private subjectItem (subject: Subject) (isEditing: bool) (editName: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "subject-item"
        prop.children [
            Html.div [
                prop.className "subject-color-dot"
                prop.style [ style.backgroundColor subject.Color ]
            ]
            if isEditing then
                Html.input [
                    prop.className "subject-edit-input"
                    prop.value editName
                    prop.autoFocus true
                    prop.onChange (fun (v: string) -> dispatch (SetEditingSubjectName v))
                    prop.onKeyDown (fun e ->
                        if e.key = "Enter" then dispatch SaveEditSubject
                        elif e.key = "Escape" then dispatch CancelEditSubject
                    )
                ]
                Html.button [
                    prop.className "btn-icon btn-save"
                    prop.title "Save"
                    prop.text "\u2713"
                    prop.onClick (fun _ -> dispatch SaveEditSubject)
                ]
                Html.button [
                    prop.className "btn-icon"
                    prop.title "Cancel"
                    prop.text "\u2717"
                    prop.onClick (fun _ -> dispatch CancelEditSubject)
                ]
            else
                Html.span [ prop.className "subject-name"; prop.text subject.Name ]
                Html.div [
                    prop.className "subject-actions"
                    prop.children [
                        Html.button [
                            prop.className "btn-icon"
                            prop.title "Edit"
                            prop.text "\u270E"
                            prop.onClick (fun _ -> dispatch (StartEditSubject subject.Id))
                        ]
                        Html.button [
                            prop.className "btn-icon btn-delete"
                            prop.title "Delete"
                            prop.text "\u00D7"
                            prop.onClick (fun _ -> dispatch (RemoveSubject subject.Id))
                        ]
                    ]
                ]
        ]
    ]

/// Add new subject form
let private addSubjectForm (name: string) (color: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "add-subject-form"
        prop.children [
            Html.input [
                prop.className "subject-name-input"
                prop.placeholder "New subject name..."
                prop.value name
                prop.onChange (fun (v: string) -> dispatch (SetNewSubjectName v))
                prop.onKeyDown (fun e ->
                    if e.key = "Enter" && name.Trim() <> "" then dispatch AddSubject
                )
            ]
            Html.input [
                prop.className "subject-color-input"
                prop.type'.color
                prop.value color
                prop.onChange (fun (v: string) -> dispatch (SetNewSubjectColor v))
            ]
            Html.button [
                prop.className "btn btn-primary btn-small"
                prop.text "Add"
                prop.disabled (name.Trim() = "")
                prop.onClick (fun _ -> dispatch AddSubject)
            ]
        ]
    ]

/// Main settings view
let view (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "settings-page"
        prop.children [
            Html.h2 [ prop.text "Settings" ]

            // Timer settings section
            Html.div [
                prop.className "settings-section"
                prop.children [
                    Html.h3 [ prop.text "Pomodoro Timer" ]
                    numberInput "Work duration" model.Settings.WorkMinutes 1 120 SetWorkMinutes dispatch
                    numberInput "Short break" model.Settings.ShortBreakMinutes 1 30 SetShortBreakMinutes dispatch
                    numberInput "Long break" model.Settings.LongBreakMinutes 1 60 SetLongBreakMinutes dispatch
                    numberInput "Long break after" model.Settings.LongBreakAfter 2 10 SetLongBreakAfter dispatch
                ]
            ]

            // Subjects section
            Html.div [
                prop.className "settings-section"
                prop.children [
                    Html.h3 [ prop.text "Subjects" ]
                    addSubjectForm model.NewSubjectName model.NewSubjectColor dispatch

                    if model.Subjects.IsEmpty then
                        Html.p [
                            prop.className "empty-hint"
                            prop.text "Add your first subject to start tracking study time."
                        ]
                    else
                        Html.div [
                            prop.className "subjects-list"
                            prop.children [
                                for subject in model.Subjects do
                                    let isEditing = model.EditingSubjectId = Some subject.Id
                                    subjectItem subject isEditing model.EditingSubjectName dispatch
                            ]
                        ]
                ]
            ]
        ]
    ]
