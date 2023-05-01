; Pressing the ` key will close Firefox, relaunch it, and go to http://127.0.0.1:8080/
`::
    ; Close Firefox
    Process, Close, firefox.exe

    ; Wait for Firefox to fully close
    Sleep, 1000

    ; Launch Firefox
    Run, firefox.exe

    ; Wait for Firefox to fully launch
    Sleep, 1000

    ; Go to http://127.0.0.1:8080/
    Send, ^t
    Sleep, 100
    Send, http://127.0.0.1:8080/
    Sleep, 100
    Send, {Enter}
    Sleep, 100
Return
