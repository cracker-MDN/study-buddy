module StudyBuddy.Main

open Fable.Core
open Fable.Core.JsInterop
open Feliz
open Browser
open StudyBuddy.Types
open StudyBuddy.App

/// The root React component with manual Elmish-style state management
[<ReactComponent>]
let AppComponent () =
    let (model, setModel) = React.useState (fun () -> init ())

    let dispatch msg =
        setModel (update msg model)

    // Timer tick effect - runs every second when timer is active
    React.useEffect (
        (fun () ->
            if model.TimerStatus = Running then
                let intervalId =
                    window.setInterval (
                        (fun () -> dispatch Tick),
                        1000
                    )
                { new System.IDisposable with
                    member _.Dispose() =
                        window.clearInterval intervalId }
            else
                { new System.IDisposable with
                    member _.Dispose() = () }
        ),
        [| box model.TimerStatus |]
    )

    // Play a sound notification when timer finishes
    React.useEffect (
        (fun () ->
            if model.TimerStatus = Finished then
                emitJsExpr () "(function(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;var c=new C();var o=c.createOscillator();var g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=800;g.gain.value=0.3;o.start();setTimeout(function(){o.stop();c.close();},500);}catch(e){}})()"
        ),
        [| box model.TimerStatus |]
    )

    // Update document title with timer
    React.useEffect (
        (fun () ->
            if model.TimerStatus = Running || model.TimerStatus = Paused then
                let m = model.SecondsRemaining / 60
                let s = model.SecondsRemaining % 60
                let phase =
                    match model.TimerPhase with
                    | Work -> "Focus"
                    | ShortBreak -> "Break"
                    | LongBreak -> "Long Break"
                document.title <- sprintf "%02d:%02d - %s | StudyBuddy" m s phase
            else
                document.title <- "StudyBuddy - Pomodoro Study Tracker"
        ),
        [| box model.SecondsRemaining; box model.TimerStatus |]
    )

    view model dispatch

/// Mount the application
let root = ReactDOM.createRoot (document.getElementById "app")
root.render (AppComponent ())
