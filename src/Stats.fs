module StudyBuddy.Stats

open System
open Feliz
open StudyBuddy.Types

/// Get sessions from the last N days
let private sessionsInRange (days: int) (sessions: StudySession list) =
    let cutoff = DateTime.Now.AddDays(float -days)
    sessions |> List.filter (fun s -> s.StartedAt >= cutoff)

/// Total study minutes
let private totalMinutes (sessions: StudySession list) =
    sessions |> List.sumBy (fun s -> s.DurationMinutes)

/// Format hours and minutes
let private formatHours (minutes: int) =
    let h = minutes / 60
    let m = minutes % 60
    if h = 0 then sprintf "%d min" m
    elif m = 0 then sprintf "%d h" h
    else sprintf "%d h %d min" h m

/// Per-subject breakdown
let private subjectBreakdown (subjects: Subject list) (sessions: StudySession list) =
    sessions
    |> List.groupBy (fun s -> s.SubjectId)
    |> List.map (fun (subjectId, ss) ->
        let subject = subjects |> List.tryFind (fun s -> s.Id = subjectId)
        let name = subject |> Option.map (fun s -> s.Name) |> Option.defaultValue "Unknown"
        let color = subject |> Option.map (fun s -> s.Color) |> Option.defaultValue "#95a5a6"
        let mins = ss |> List.sumBy (fun s -> s.DurationMinutes)
        (name, color, mins))
    |> List.sortByDescending (fun (_, _, m) -> m)

/// SVG horizontal bar chart
let private barChart (data: (string * string * int) list) =
    if data.IsEmpty then Html.none
    else
        let maxVal = data |> List.map (fun (_, _, v) -> v) |> List.max |> max 1
        let barHeight = 32.0
        let gap = 12.0
        let labelWidth = 120.0
        let chartWidth = 500.0
        let totalHeight = float data.Length * (barHeight + gap)

        Html.div [
            prop.className "chart-container"
            prop.children [
                Html.svg [
                    prop.width (int (labelWidth + chartWidth + 60.0))
                    prop.height (int totalHeight)
                    prop.custom("viewBox", sprintf "0 0 %g %g" (labelWidth + chartWidth + 60.0) totalHeight)
                    prop.style [ style.maxWidth (length.percent 100) ]
                    prop.children [
                        yield! data |> List.mapi (fun i (name, color, value) ->
                            let y = float i * (barHeight + gap)
                            let barWidth = (float value / float maxVal) * chartWidth

                            Html.g [
                                prop.children [
                                    // Label
                                    Html.text [
                                        prop.x (labelWidth - 8.0)
                                        prop.y (y + barHeight / 2.0)
                                        prop.custom("fill", "var(--text-secondary)")
                                        prop.fontSize 13
                                        prop.textAnchor.endOfText
                                        prop.dominantBaseline.central
                                        prop.text (if name.Length > 14 then name.[..11] + "..." else name)
                                    ]
                                    // Bar background
                                    Html.rect [
                                        prop.x labelWidth
                                        prop.y y
                                        prop.width chartWidth
                                        prop.height barHeight
                                        prop.rx 4; prop.ry 4
                                        prop.custom("fill", "rgba(255,255,255,0.05)")
                                    ]
                                    // Bar fill
                                    Html.rect [
                                        prop.x labelWidth
                                        prop.y y
                                        prop.width (max barWidth 4.0)
                                        prop.height barHeight
                                        prop.rx 4; prop.ry 4
                                        prop.custom("fill", color)
                                        prop.style [
                                            style.transitionProperty "width"
                                            style.transitionDurationSeconds 0.6
                                        ]
                                    ]
                                    // Value label
                                    Html.text [
                                        prop.x (labelWidth + barWidth + 8.0)
                                        prop.y (y + barHeight / 2.0)
                                        prop.custom("fill", "var(--text-secondary)")
                                        prop.fontSize 12
                                        prop.dominantBaseline.central
                                        prop.text (formatHours value)
                                    ]
                                ]
                            ]
                        )
                    ]
                ]
            ]
        ]

/// Stat card component
let private statCard (label: string) (value: string) (icon: string) =
    Html.div [
        prop.className "stat-card"
        prop.children [
            Html.div [ prop.className "stat-icon"; prop.text icon ]
            Html.div [
                prop.className "stat-content"
                prop.children [
                    Html.div [ prop.className "stat-value"; prop.text value ]
                    Html.div [ prop.className "stat-label"; prop.text label ]
                ]
            ]
        ]
    ]

/// Calculate current consecutive-day study streak
let private studyStreak (sessions: StudySession list) =
    let today = DateTime.Now.Date
    let studiedDays =
        sessions
        |> List.map (fun s -> s.StartedAt.Date)
        |> List.distinct
        |> Set.ofList

    let rec countStreak (date: DateTime) acc =
        if studiedDays.Contains(date) then countStreak (date.AddDays(-1.0)) (acc + 1)
        else acc

    if studiedDays.Contains(today) then countStreak today 0
    elif studiedDays.Contains(today.AddDays(-1.0)) then countStreak (today.AddDays(-1.0)) 0
    else 0

/// Streak banner card
let private streakBanner (streak: int) =
    let message =
        if streak = 0 then "Study today to start a streak!"
        elif streak = 1 then "Keep it going tomorrow!"
        elif streak < 7 then "Building momentum!"
        elif streak < 30 then "You're on fire!"
        else "Legendary consistency!"

    Html.div [
        prop.className "streak-banner"
        prop.children [
            Html.div [ prop.className "streak-icon"; prop.text "\U0001F525" ]
            Html.div [
                prop.className "streak-body"
                prop.children [
                    Html.div [ prop.className "streak-value"; prop.text (string streak) ]
                    Html.div [ prop.className "streak-sublabel"; prop.text (sprintf "day%s in a row" (if streak = 1 then "" else "s")) ]
                ]
            ]
            Html.div [ prop.className "streak-message"; prop.text message ]
        ]
    ]

/// Daily study minutes for a week view
let private weeklyActivity (sessions: StudySession list) =
    let today = DateTime.Now.Date
    let days =
        [ for i in 6 .. -1 .. 0 do
            let date = today.AddDays(float -i)
            let dayMins =
                sessions
                |> List.filter (fun s -> s.StartedAt.Date = date)
                |> List.sumBy (fun s -> s.DurationMinutes)
            (date, dayMins) ]

    let maxMins = days |> List.map snd |> List.max |> max 1
    let dayNames = [| "Sun"; "Mon"; "Tue"; "Wed"; "Thu"; "Fri"; "Sat" |]

    Html.div [
        prop.className "weekly-chart"
        prop.children [
            Html.h3 [ prop.text "This Week" ]
            Html.div [
                prop.className "week-bars"
                prop.children [
                    for (date, mins) in days do
                        let heightPct = (float mins / float maxMins) * 100.0
                        let dayName = dayNames.[int date.DayOfWeek]
                        Html.div [
                            prop.className "week-bar-col"
                            prop.children [
                                Html.div [
                                    prop.className "week-bar-track"
                                    prop.children [
                                        Html.div [
                                            prop.className "week-bar-fill"
                                            prop.style [
                                                style.height (length.percent heightPct)
                                                style.backgroundColor (if date = today then "#e74c3c" else "#3498db")
                                            ]
                                        ]
                                    ]
                                ]
                                Html.span [ prop.className "week-bar-label"; prop.text dayName ]
                                Html.span [
                                    prop.className "week-bar-value"
                                    prop.text (if mins > 0 then sprintf "%dm" mins else "")
                                ]
                            ]
                        ]
                ]
            ]
        ]
    ]

/// Main statistics view
let view (model: Model) (_dispatch: Msg -> unit) =
    let recentSessions = sessionsInRange 30 model.Sessions
    let weekSessions = sessionsInRange 7 model.Sessions
    let total = totalMinutes recentSessions
    let sessionCount = List.length recentSessions
    let avgPerSession =
        if sessionCount = 0 then 0
        else total / sessionCount
    let breakdown = subjectBreakdown model.Subjects recentSessions
    let streak = studyStreak model.Sessions

    Html.div [
        prop.className "stats-page"
        prop.children [
            Html.h2 [ prop.text "Study Statistics" ]
            Html.p [ prop.className "stats-subtitle"; prop.text "Last 30 days" ]

            streakBanner streak

            Html.div [
                prop.className "stat-cards"
                prop.children [
                    statCard "Total Study Time" (formatHours total) "\u23F1\uFE0F"
                    statCard "Sessions" (string sessionCount) "\U0001F4CB"
                    statCard "Avg / Session" (formatHours avgPerSession) "\U0001F4CA"
                    statCard "Subjects" (string (List.length breakdown)) "\U0001F4DA"
                ]
            ]

            weeklyActivity weekSessions

            if not breakdown.IsEmpty then
                Html.div [
                    prop.className "breakdown-section"
                    prop.children [
                        Html.h3 [ prop.text "Time per Subject" ]
                        barChart breakdown
                    ]
                ]
            else
                Html.div [
                    prop.className "empty-state"
                    prop.children [
                        Html.p [ prop.text "Complete some study sessions to see your statistics!" ]
                    ]
                ]
        ]
    ]
