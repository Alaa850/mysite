Option Explicit

Dim shell, scriptPath, command
Set shell = CreateObject("WScript.Shell")
scriptPath = CreateObject("Scripting.FileSystemObject").BuildPath(CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName), "start-production-connector.ps1")
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """"
shell.Run command, 0, False
