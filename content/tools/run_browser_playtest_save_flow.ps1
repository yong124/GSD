$env:TEMP = 'G:\GSD\.qa-artifacts'
$env:TMP = 'G:\GSD\.qa-artifacts'
$env:PLAYWRIGHT_BROWSERS_PATH = 'G:\GSD\.qa-browsers'

New-Item -ItemType Directory -Force -Path 'G:\GSD\.qa-artifacts' | Out-Null
New-Item -ItemType Directory -Force -Path 'G:\GSD\.qa-browsers' | Out-Null

Remove-Item -LiteralPath 'G:\GSD\.qa-artifacts\qa-save-flow.json' -ErrorAction SilentlyContinue

try {
  Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173' | Out-Null
} catch {
  Start-Process py -ArgumentList '-m', 'http.server', '4173' -WorkingDirectory 'G:\GSD\game' | Out-Null
  Start-Sleep -Seconds 2
}

node G:\GSD\content\tools\browser_playtest_save_flow.js
