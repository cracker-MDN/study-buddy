module StudyBuddy.SessionLog

open System
open Feliz
open StudyBuddy.Types

/// Format a DateTime nicely
let private formatDate (dt: DateTime) =
    sprintf "%04d-%02d-%02d %02d:%02d" dt.Year dt.Month dt.Day dt.Hour dt.Minute

/// Format duration in a human-readable way
let private formatDuration (minutes: int) =
    if minutes < 60 then sprintf "%d min" minutes
    else
        let h = minutes / 60
        let m = minutes % 60
        if m = 0 then sprintf "%dh" h
        else sprintf "%dh %dm" h m

/// Find subject by id
let private findSubject (subjects: Subject list) (id: Guid) =
    subjects |> List.tryFind (fun s -> s.Id = id)

/// Render a single session card
let private sessionCard (subjects: Subject list) (session: StudySession) (dispatch: Msg -> unit) =
    let subject = findSubject subjects session.SubjectId
    let subjectName = subject |> Option.map (fun s -> s.Name) |> Option.defaultValue "Unknown"
    let subjectColor = subject |> Option.map (fun s -> s.Color) |> Option.defaultValue "#95a5a6"

    Html.div [
        prop.className "session-card"
        prop.children [
            Html.div [
                prop.className "session-color-bar"
                prop.style [ style.backgroundColor subjectColor ]
            ]
            Html.div [
                prop.className "session-info"
                prop.children [
                    Html.div [
                        prop.className "session-header"
                        prop.children [
                            Html.span [
                                prop.className "session-subject"
                                prop.text subjectName
                            ]
                            Html.span [
                                prop.className "session-duration"
                                prop.text (formatDuration session.DurationMinutes)
                            ]
                        ]
                    ]
                    Html.div [
                        prop.className "session-date"
                        prop.text (formatDate session.StartedAt)
                    ]
                    if session.Notes <> "" then
                        Html.div [
                            prop.className "session-notes"
                            prop.text session.Notes
                        ]
                ]
            ]
            Html.button [
                prop.className "btn-icon btn-delete"
                prop.title "Delete session"
                prop.text "\u00D7"
                prop.onClick (fun _ -> dispatch (RemoveSession session.Id))
            ]
        ]
    ]

/// Group sessions by date for display
let private groupByDate (sessions: StudySession list) =
    sessions
    |> List.sortByDescending (fun s -> s.StartedAt)
    |> List.groupBy (fun s -> s.StartedAt.Date)

/// Summary stats for a day
let private daySummary (sessions: StudySession list) =
    let totalMinutes = sessions |> List.sumBy (fun s -> s.DurationMinutes)
    let count = List.length sessions
    sprintf "%d session%s \u2022 %s total" count (if count = 1 then "" else "s") (formatDuration totalMinutes)

/// Summary card showing total study time for today
let private todaySummaryCard (sessions: StudySession list) =
    let today = DateTime.Today
    let todaySessions = sessions |> List.filter (fun s -> s.StartedAt.Date = today)
    let totalMinutes = todaySessions |> List.sumBy (fun s -> s.DurationMinutes)
    let count = List.length todaySessions

    Html.div [
        prop.className "today-summary-card"
        prop.children [
            Html.div [ prop.className "today-summary-icon"; prop.text "\U0001F4C5" ]
            Html.div [
                prop.className "today-summary-body"
                prop.children [
                    Html.div [ prop.className "today-summary-value"; prop.text (formatDuration totalMinutes) ]
                    Html.div [ prop.className "today-summary-label"; prop.text "studied today" ]
                ]
            ]
            Html.div [
                prop.className "today-summary-sessions"
                prop.text (sprintf "%d session%s" count (if count = 1 then "" else "s"))
            ]
        ]
    ]

/// Main session log view
let view (model: Model) (dispatch: Msg -> unit) =
    let grouped = groupByDate model.Sessions

    Html.div [
        prop.className "sessions-page"
        prop.children [
            Html.div [
                prop.className "page-header"
                prop.children [
                    Html.h2 [ prop.text "Study Log" ]
                    if not model.Sessions.IsEmpty then
                        Html.button [
                            prop.className "btn btn-danger btn-small"
                            prop.text "Clear All"
                            prop.onClick (fun _ -> dispatch ClearAllSessions)
                        ]
                ]
            ]

            todaySummaryCard model.Sessions

            if model.Sessions.IsEmpty then
                Html.div [
                    prop.className "empty-state"
                    prop.children [
                        Html.div [ prop.className "empty-icon"; prop.text "\U0001F4DA" ]
                        Html.p [ prop.text "No study sessions yet." ]
                        Html.p [ prop.className "empty-hint"; prop.text "Start a Pomodoro timer to log your first session!" ]
                    ]
                ]
            else
                Html.div [
                    prop.className "sessions-list"
                    prop.children [
                        for (date, sessions) in grouped do
                            Html.div [
                                prop.className "date-group"
                                prop.children [
                                    Html.div [
                                        prop.className "date-header"
                                        prop.children [
                                            Html.span [
                                                prop.className "date-label"
                                                prop.text (sprintf "%04d-%02d-%02d" date.Year date.Month date.Day)
                                            ]
                                            Html.span [
                                                prop.className "date-summary"
                                                prop.text (daySummary sessions)
                                            ]
                                        ]
                                    ]
                                    yield! sessions |> List.map (fun s -> sessionCard model.Subjects s dispatch)
                                ]
                            ]
                    ]
                ]
        ]
    ]
