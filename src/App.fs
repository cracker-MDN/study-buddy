module StudyBuddy.App

open System
open Feliz
open StudyBuddy.Types
open StudyBuddy.Storage

/// Initialize the application state from localStorage
let init () =
    let subjects = loadSubjects ()
    let sessions = loadSessions ()
    let settings = loadSettings ()

    { Subjects = subjects
      Sessions = sessions
      Settings = settings
      ActiveTab = TimerTab
      TimerStatus = Idle
      TimerPhase = Work
      SecondsRemaining = settings.WorkMinutes * 60
      SelectedSubjectId = subjects |> List.tryHead |> Option.map (fun s -> s.Id)
      CompletedPomodoros = 0
      NewSubjectName = ""
      NewSubjectColor = Colors.random ()
      SessionNotes = ""
      EditingSubjectId = None
      EditingSubjectName = "" }

/// Determine the next Pomodoro phase
let private nextPhase (model: Model) =
    match model.TimerPhase with
    | Work ->
        let newCompleted = model.CompletedPomodoros + 1
        if newCompleted % model.Settings.LongBreakAfter = 0 then
            (LongBreak, newCompleted)
        else
            (ShortBreak, newCompleted)
    | ShortBreak | LongBreak ->
        (Work, model.CompletedPomodoros)

/// Record a completed work session
let private recordSession (model: Model) =
    match model.SelectedSubjectId, model.TimerPhase with
    | Some subjectId, Work ->
        let session =
            { Id = Guid.NewGuid()
              SubjectId = subjectId
              StartedAt = DateTime.Now.AddMinutes(float -model.Settings.WorkMinutes)
              DurationMinutes = model.Settings.WorkMinutes
              Notes = model.SessionNotes.Trim() }
        let newSessions = session :: model.Sessions
        saveSessions newSessions
        newSessions
    | _ ->
        model.Sessions

/// Update function — pure state transitions
let update (msg: Msg) (model: Model) : Model =
    match msg with
    // Navigation
    | SwitchTab tab ->
        { model with ActiveTab = tab }

    // Timer messages
    | StartTimer ->
        { model with TimerStatus = Running }

    | PauseTimer ->
        { model with TimerStatus = Paused }

    | ResumeTimer ->
        { model with TimerStatus = Running }

    | ResetTimer ->
        let seconds = Timer.totalSecondsForPhase model.Settings model.TimerPhase
        { model with
            TimerStatus = Idle
            SecondsRemaining = seconds }

    | Tick ->
        if model.TimerStatus = Running && model.SecondsRemaining > 0 then
            { model with SecondsRemaining = model.SecondsRemaining - 1 }
        elif model.TimerStatus = Running && model.SecondsRemaining = 0 then
            // Timer finished
            let newSessions = recordSession model
            let (newPhase, newCompleted) = nextPhase model
            let newSeconds = Timer.totalSecondsForPhase model.Settings newPhase
            { model with
                TimerStatus = Finished
                Sessions = newSessions
                TimerPhase = newPhase
                SecondsRemaining = newSeconds
                CompletedPomodoros = newCompleted
                SessionNotes = "" }
        else
            model

    | TimerFinished ->
        model // Handled in Tick

    | SelectSubject id ->
        { model with SelectedSubjectId = id }

    | SetSessionNotes notes ->
        { model with SessionNotes = notes }

    // Subject management
    | SetNewSubjectName name ->
        { model with NewSubjectName = name }

    | SetNewSubjectColor color ->
        { model with NewSubjectColor = color }

    | AddSubject ->
        let trimmed = model.NewSubjectName.Trim()
        if trimmed = "" then model
        else
            let subject =
                { Id = Guid.NewGuid()
                  Name = trimmed
                  Color = model.NewSubjectColor }
            let newSubjects = model.Subjects @ [ subject ]
            saveSubjects newSubjects
            { model with
                Subjects = newSubjects
                NewSubjectName = ""
                NewSubjectColor = Colors.random ()
                SelectedSubjectId =
                    if model.SelectedSubjectId.IsNone then Some subject.Id
                    else model.SelectedSubjectId }

    | RemoveSubject id ->
        let newSubjects = model.Subjects |> List.filter (fun s -> s.Id <> id)
        saveSubjects newSubjects
        { model with
            Subjects = newSubjects
            SelectedSubjectId =
                if model.SelectedSubjectId = Some id then
                    newSubjects |> List.tryHead |> Option.map (fun s -> s.Id)
                else
                    model.SelectedSubjectId }

    | StartEditSubject id ->
        let name =
            model.Subjects
            |> List.tryFind (fun s -> s.Id = id)
            |> Option.map (fun s -> s.Name)
            |> Option.defaultValue ""
        { model with EditingSubjectId = Some id; EditingSubjectName = name }

    | SetEditingSubjectName name ->
        { model with EditingSubjectName = name }

    | SaveEditSubject ->
        match model.EditingSubjectId with
        | Some id ->
            let trimmed = model.EditingSubjectName.Trim()
            if trimmed = "" then model
            else
                let newSubjects =
                    model.Subjects
                    |> List.map (fun s ->
                        if s.Id = id then { s with Name = trimmed } else s)
                saveSubjects newSubjects
                { model with
                    Subjects = newSubjects
                    EditingSubjectId = None
                    EditingSubjectName = "" }
        | None -> model

    | CancelEditSubject ->
        { model with EditingSubjectId = None; EditingSubjectName = "" }

    // Settings
    | SetWorkMinutes v ->
        let newSettings = { model.Settings with WorkMinutes = v }
        saveSettings newSettings
        let newSeconds =
            if model.TimerStatus = Idle && model.TimerPhase = Work then v * 60
            else model.SecondsRemaining
        { model with Settings = newSettings; SecondsRemaining = newSeconds }

    | SetShortBreakMinutes v ->
        let newSettings = { model.Settings with ShortBreakMinutes = v }
        saveSettings newSettings
        let newSeconds =
            if model.TimerStatus = Idle && model.TimerPhase = ShortBreak then v * 60
            else model.SecondsRemaining
        { model with Settings = newSettings; SecondsRemaining = newSeconds }

    | SetLongBreakMinutes v ->
        let newSettings = { model.Settings with LongBreakMinutes = v }
        saveSettings newSettings
        let newSeconds =
            if model.TimerStatus = Idle && model.TimerPhase = LongBreak then v * 60
            else model.SecondsRemaining
        { model with Settings = newSettings; SecondsRemaining = newSeconds }

    | SetLongBreakAfter v ->
        let newSettings = { model.Settings with LongBreakAfter = v }
        saveSettings newSettings
        { model with Settings = newSettings }

    // Data management
    | ClearAllSessions ->
        saveSessions []
        { model with Sessions = [] }

    | RemoveSession id ->
        let newSessions = model.Sessions |> List.filter (fun s -> s.Id <> id)
        saveSessions newSessions
        { model with Sessions = newSessions }

/// Tab navigation bar
let private navbar (activeTab: ActiveTab) (dispatch: Msg -> unit) =
    let tabButton (tab: ActiveTab) (icon: string) (label: string) =
        Html.button [
            prop.className (if activeTab = tab then "nav-tab active" else "nav-tab")
            prop.onClick (fun _ -> dispatch (SwitchTab tab))
            prop.children [
                Html.span [ prop.className "nav-icon"; prop.text icon ]
                Html.span [ prop.className "nav-label"; prop.text label ]
            ]
        ]

    Html.nav [
        prop.className "navbar"
        prop.children [
            tabButton TimerTab "\u23F1\uFE0F" "Timer"
            tabButton SessionsTab "\U0001F4CB" "Log"
            tabButton StatsTab "\U0001F4CA" "Stats"
            tabButton SettingsTab "\u2699\uFE0F" "Settings"
        ]
    ]

/// Main application view
let view (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "app-container"
        prop.children [
            Html.header [
                prop.className "app-header"
                prop.children [
                    Html.h1 [ prop.text "StudyBuddy" ]
                    Html.span [ prop.className "app-subtitle"; prop.text "Pomodoro Study Tracker" ]
                ]
            ]

            Html.main [
                prop.className "app-main"
                prop.children [
                    match model.ActiveTab with
                    | TimerTab -> Timer.view model dispatch
                    | SessionsTab -> SessionLog.view model dispatch
                    | StatsTab -> Stats.view model dispatch
                    | SettingsTab -> Settings.view model dispatch
                ]
            ]

            navbar model.ActiveTab dispatch
        ]
    ]
