param(
  [Parameter(Mandatory = $true)]
  [string]$SceneId,
  [string]$DialogId = '',
  [string]$Evidence = 'all',
  [int]$AutoAdvanceMs = 0,
  [string]$StopWhen = ''
)

$env:TEMP = 'G:\GSD\.qa-artifacts'
$env:TMP = 'G:\GSD\.qa-artifacts'
$env:PLAYWRIGHT_BROWSERS_PATH = 'G:\GSD\.qa-browsers'
$env:QA_SCENE = $SceneId
$env:QA_DIALOG_ID = $DialogId
$env:QA_EVIDENCE = $Evidence
$env:QA_AUTO_ADVANCE_MS = [string]$AutoAdvanceMs
$env:QA_STOP_WHEN = $StopWhen

New-Item -ItemType Directory -Force -Path 'G:\GSD\.qa-artifacts' | Out-Null
New-Item -ItemType Directory -Force -Path 'G:\GSD\.qa-browsers' | Out-Null

Remove-Item -LiteralPath ("G:\GSD\.qa-artifacts\qa-scene-{0}.json" -f $SceneId) -ErrorAction SilentlyContinue
Remove-Item -LiteralPath ("G:\GSD\.qa-artifacts\qa-scene-{0}.png" -f $SceneId) -ErrorAction SilentlyContinue

try {
  Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173' | Out-Null
} catch {
  Start-Process py -ArgumentList '-m', 'http.server', '4173' -WorkingDirectory 'G:\GSD\game' | Out-Null
  Start-Sleep -Seconds 2
}

node G:\GSD\content\tools\browser_playtest_scene_jump.js
