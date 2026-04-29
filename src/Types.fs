module StudyBuddy.Types

open System

/// Represents a study subject/course with its display color
type Subject =
    { Id: Guid
      Name: string
      Color: string }

/// A completed study session
type StudySession =
    { Id: Guid
      SubjectId: Guid
      StartedAt: DateTime
      DurationMinutes: int
      Notes: string }

/// Timer state
type TimerStatus =
    | Idle
    | Running
    | Paused
    | Finished

/// Pomodoro phase
type PomodoroPhase =
    | Work
    | ShortBreak
    | LongBreak

/// User-configurable timer settings
type TimerSettings =
    { WorkMinutes: int
      ShortBreakMinutes: int
      LongBreakMinutes: int
      LongBreakAfter: int }

    static member Default =
        { WorkMinutes = 25
          ShortBreakMinutes = 5
          LongBreakMinutes = 15
          LongBreakAfter = 4 }

/// The active tab in the application
type ActiveTab =
    | TimerTab
    | SessionsTab
    | StatsTab
    | SettingsTab

/// Root application model
type Model =
    { Subjects: Subject list
      Sessions: StudySession list
      Settings: TimerSettings
      ActiveTab: ActiveTab
      // Timer state
      TimerStatus: TimerStatus
      TimerPhase: PomodoroPhase
      SecondsRemaining: int
      SelectedSubjectId: Guid option
      CompletedPomodoros: int
      // UI state
      NewSubjectName: string
      NewSubjectColor: string
      SessionNotes: string
      EditingSubjectId: Guid option
      EditingSubjectName: string }

/// All possible messages
type Msg =
    // Navigation
    | SwitchTab of ActiveTab
    // Timer
    | StartTimer
    | PauseTimer
    | ResumeTimer
    | ResetTimer
    | Tick
    | TimerFinished
    | SelectSubject of Guid option
    | SetSessionNotes of string
    // Subjects
    | SetNewSubjectName of string
    | SetNewSubjectColor of string
    | AddSubject
    | RemoveSubject of Guid
    | StartEditSubject of Guid
    | SetEditingSubjectName of string
    | SaveEditSubject
    | CancelEditSubject
    // Settings
    | SetWorkMinutes of int
    | SetShortBreakMinutes of int
    | SetLongBreakMinutes of int
    | SetLongBreakAfter of int
    // Data
    | ClearAllSessions
    | RemoveSession of Guid

/// Preset subject colors
module Colors =
    let palette =
        [| "#3498db"; "#e74c3c"; "#2ecc71"; "#f39c12"
           "#9b59b6"; "#1abc9c"; "#e67e22"; "#34495e"
           "#16a085"; "#c0392b"; "#8e44ad"; "#d35400" |]

    let random () =
        let rng = Random()
        palette.[rng.Next(palette.Length)]
