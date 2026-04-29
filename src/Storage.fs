// Persistence layer — all user data is stored in browser localStorage as JSON.
//
// Strategy:
//   Each of the three mutable collections (subjects, sessions, settings) gets its own
//   localStorage key (see the *Key literals below).  On every state change that touches
//   one of these collections, App.update calls the corresponding save* function so the
//   data survives page refreshes without a backend.
//
// Serialisation:
//   Thoth.Json provides type-safe encode/decode pipelines.  The Encode and Decode
//   sub-modules below are kept private to this file; callers use only the six public
//   load*/save* functions.  Decode failures (e.g. a corrupt or missing key) are
//   silently swallowed and fall back to an empty list / TimerSettings.Default so the
//   app always starts in a valid state.
//
// Limitations:
//   localStorage is synchronous, has a ~5 MB per-origin cap, and is scoped to the
//   browser profile — there is no cross-device sync.  Clearing site data in the
//   browser will wipe all sessions and settings.

module StudyBuddy.Storage

open System
open Fable.Core
open Browser
open Thoth.Json
open StudyBuddy.Types

/// JSON encoders for our domain types
module Encode =
    let subject (s: Subject) =
        Encode.object
            [ "id", Encode.guid s.Id
              "name", Encode.string s.Name
              "color", Encode.string s.Color ]

    let session (s: StudySession) =
        Encode.object
            [ "id", Encode.guid s.Id
              "subjectId", Encode.guid s.SubjectId
              "startedAt", Encode.datetime s.StartedAt
              "durationMinutes", Encode.int s.DurationMinutes
              "notes", Encode.string s.Notes ]

    let settings (s: TimerSettings) =
        Encode.object
            [ "workMinutes", Encode.int s.WorkMinutes
              "shortBreakMinutes", Encode.int s.ShortBreakMinutes
              "longBreakMinutes", Encode.int s.LongBreakMinutes
              "longBreakAfter", Encode.int s.LongBreakAfter ]

/// JSON decoders for our domain types
module Decode =
    let subject: Decoder<Subject> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              Name = get.Required.Field "name" Decode.string
              Color = get.Required.Field "color" Decode.string })

    let session: Decoder<StudySession> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              SubjectId = get.Required.Field "subjectId" Decode.guid
              StartedAt = get.Required.Field "startedAt" Decode.datetime
              DurationMinutes = get.Required.Field "durationMinutes" Decode.int
              Notes = get.Required.Field "notes" Decode.string })

    let settings: Decoder<TimerSettings> =
        Decode.object (fun get ->
            { WorkMinutes = get.Required.Field "workMinutes" Decode.int
              ShortBreakMinutes = get.Required.Field "shortBreakMinutes" Decode.int
              LongBreakMinutes = get.Required.Field "longBreakMinutes" Decode.int
              LongBreakAfter = get.Required.Field "longBreakAfter" Decode.int })

/// Keys for localStorage
[<Literal>]
let private SubjectsKey = "studybuddy_subjects"

[<Literal>]
let private SessionsKey = "studybuddy_sessions"

[<Literal>]
let private SettingsKey = "studybuddy_settings"

/// Save a value to localStorage
let private save (key: string) (value: string) =
    window.localStorage.setItem (key, value)

/// Load a value from localStorage
let private load (key: string) =
    window.localStorage.getItem key
    |> Option.ofObj

/// Save subjects list
let saveSubjects (subjects: Subject list) =
    subjects
    |> List.map Encode.subject
    |> Encode.list
    |> Encode.toString 0
    |> save SubjectsKey

/// Load subjects list
let loadSubjects () : Subject list =
    load SubjectsKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.subject) json with
        | Ok subjects -> Some subjects
        | Error _ -> None)
    |> Option.defaultValue []

/// Save sessions list
let saveSessions (sessions: StudySession list) =
    sessions
    |> List.map Encode.session
    |> Encode.list
    |> Encode.toString 0
    |> save SessionsKey

/// Load sessions list
let loadSessions () : StudySession list =
    load SessionsKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.session) json with
        | Ok sessions -> Some sessions
        | Error _ -> None)
    |> Option.defaultValue []

/// Save timer settings
let saveSettings (settings: TimerSettings) =
    settings
    |> Encode.settings
    |> Encode.toString 0
    |> save SettingsKey

/// Load timer settings
let loadSettings () : TimerSettings =
    load SettingsKey
    |> Option.bind (fun json ->
        match Decode.fromString Decode.settings json with
        | Ok s -> Some s
        | Error _ -> None)
    |> Option.defaultValue TimerSettings.Default
