module StudyBuddy.Timer

open System
open Feliz
open StudyBuddy.Types

/// Format seconds as MM:SS
let private formatTime (seconds: int) =
    let m = seconds / 60
    let s = seconds % 60
    sprintf "%02d:%02d" m s

/// Get total seconds for the current phase
let totalSecondsForPhase (settings: TimerSettings) (phase: PomodoroPhase) =
    match phase with
    | Work -> settings.WorkMinutes * 60
    | ShortBreak -> settings.ShortBreakMinutes * 60
    | LongBreak -> settings.LongBreakMinutes * 60

/// Get a friendly label for the current phase
let private phaseLabel (phase: PomodoroPhase) =
    match phase with
    | Work -> "Focus Time"
    | ShortBreak -> "Short Break"
    | LongBreak -> "Long Break"

/// Color for each phase
let private phaseColor (phase: PomodoroPhase) =
    match phase with
    | Work -> "#e74c3c"
    | ShortBreak -> "#2ecc71"
    | LongBreak -> "#3498db"

/// Circular progress ring SVG
let private progressRing (progress: float) (color: string) (timeText: string) (label: string) =
    let radius = 120.0
    let stroke = 8.0
    let circumference = 2.0 * System.Math.PI * radius
    let offset = circumference * (1.0 - progress)
    let size = (radius + stroke) * 2.0
    let center = radius + stroke

    Html.div [
        prop.style [
            style.display.flex
            style.justifyContent.center
            style.alignItems.center
            style.marginBottom 24
        ]
        prop.children [
            Html.svg [
                prop.width (int size)
                prop.height (int size)
                prop.custom("viewBox", sprintf "0 0 %g %g" size size)
                prop.children [
                    // Background circle
                    Html.circle [
                        prop.cx center; prop.cy center; prop.r radius
                        prop.custom("fill", "none")
                        prop.stroke "rgba(255,255,255,0.1)"
                        prop.strokeWidth stroke
                    ]
                    // Progress circle
                    Html.circle [
                        prop.cx center; prop.cy center; prop.r radius
                        prop.custom("fill", "none")
                        prop.stroke color
                        prop.strokeWidth stroke
                        prop.custom("strokeLinecap", "round")
                        prop.custom("strokeDasharray", sprintf "%g %g" circumference circumference)
                        prop.custom("strokeDashoffset", offset)
                        prop.custom ("transform", sprintf "rotate(-90 %g %g)" center center)
                        prop.style [
                            style.transitionProperty "stroke-dashoffset"
                            style.transitionDurationSeconds 0.5
                        ]
                    ]
                    // Time text
                    Html.text [
                        prop.x center; prop.y (center - 10.0)
                        prop.custom("fill", "white")
                        prop.fontSize 48
                        prop.custom("fontWeight", "bold")
                        prop.textAnchor.middle
                        prop.dominantBaseline.central
                        prop.custom("fontFamily", "monospace")
                        prop.text timeText
                    ]
                    // Phase label
                    Html.text [
                        prop.x center; prop.y (center + 30.0)
                        prop.custom("fill", "rgba(255,255,255,0.7)")
                        prop.fontSize 16
                        prop.textAnchor.middle
                        prop.dominantBaseline.central
                        prop.text label
                    ]
                ]
            ]
        ]
    ]

/// Subject selector dropdown
let private subjectSelector (subjects: Subject list) (selected: Guid option) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "subject-selector"
        prop.children [
            Html.label [
                prop.className "label-text"
                prop.text "Studying:"
            ]
            Html.select [
                prop.className "select-input"
                prop.value (
                    match selected with
                    | Some id -> string id
                    | None -> ""
                )
                prop.onChange (fun (value: string) ->
                    if value = "" then dispatch (SelectSubject None)
                    else dispatch (SelectSubject(Some(System.Guid.Parse value)))
                )
                prop.children [
                    Html.option [
                        prop.value ""
                        prop.text "-- Select subject --"
                    ]
                    yield! subjects |> List.map (fun subj ->
                        Html.option [
                            prop.value (string subj.Id)
                            prop.text subj.Name
                        ]
                    )
                ]
            ]
        ]
    ]

/// Pomodoro count indicator (dots)
let private pomodoroIndicator (completed: int) (total: int) =
    Html.div [
        prop.className "pomodoro-dots"
        prop.children [
            for i in 1 .. total do
                Html.span [
                    prop.className (if i <= (completed % total) || (completed > 0 && completed % total = 0 && i = total) then "dot filled" else "dot")
                    prop.text "\u25CF"
                ]
        ]
    ]

/// Timer control buttons
let private timerControls (status: TimerStatus) (canStart: bool) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "timer-controls"
        prop.children [
            match status with
            | Idle ->
                Html.button [
                    prop.className "btn btn-primary btn-large"
                    prop.text "Start Focus"
                    prop.disabled (not canStart)
                    prop.onClick (fun _ -> dispatch StartTimer)
                ]
            | Running ->
                Html.button [
                    prop.className "btn btn-warning btn-large"
                    prop.text "Pause"
                    prop.onClick (fun _ -> dispatch PauseTimer)
                ]
            | Paused ->
                Html.button [
                    prop.className "btn btn-primary btn-large"
                    prop.text "Resume"
                    prop.onClick (fun _ -> dispatch ResumeTimer)
                ]
                Html.button [
                    prop.className "btn btn-secondary btn-large"
                    prop.text "Reset"
                    prop.onClick (fun _ -> dispatch ResetTimer)
                ]
            | Finished ->
                Html.button [
                    prop.className "btn btn-primary btn-large"
                    prop.text "Continue"
                    prop.onClick (fun _ -> dispatch ResetTimer)
                ]
        ]
    ]

/// Notes input for the current session
let private notesInput (notes: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "notes-section"
        prop.children [
            Html.textarea [
                prop.className "notes-input"
                prop.placeholder "Session notes (optional)..."
                prop.value notes
                prop.rows 2
                prop.onChange (fun (value: string) -> dispatch (SetSessionNotes value))
            ]
        ]
    ]

/// Main timer view
let view (model: Model) (dispatch: Msg -> unit) =
    let totalSeconds = totalSecondsForPhase model.Settings model.TimerPhase
    let progress =
        if totalSeconds = 0 then 0.0
        else float model.SecondsRemaining / float totalSeconds
    let color = phaseColor model.TimerPhase

    Html.div [
        prop.className "timer-page"
        prop.children [
            progressRing progress color (formatTime model.SecondsRemaining) (phaseLabel model.TimerPhase)
            pomodoroIndicator model.CompletedPomodoros model.Settings.LongBreakAfter
            subjectSelector model.Subjects model.SelectedSubjectId dispatch
            notesInput model.SessionNotes dispatch
            timerControls model.TimerStatus model.SelectedSubjectId.IsSome dispatch
        ]
    ]
