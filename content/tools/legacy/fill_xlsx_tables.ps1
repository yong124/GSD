param(
    [string]$InputPath = "G:\GSD\game\data\game_data.js",
    [string]$WorkbookPath = "G:\GSD\content\script.xlsx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-GameData {
    param([string]$Path)

    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $trimmed = $raw.Trim()
    if ($trimmed.StartsWith("window.GAME_DATA")) {
        $trimmed = [regex]::Replace($trimmed, "^window\.GAME_DATA\s*=\s*", "")
        $trimmed = [regex]::Replace($trimmed, ";\s*$", "")
    }
    return $trimmed | ConvertFrom-Json
}

function Normalize-Value {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [bool]) { return $(if ($Value) { "true" } else { "false" }) }
    if ($Value -is [System.Array]) { return ($Value | ConvertTo-Json -Compress -Depth 20) }
    if ($Value -is [pscustomobject]) { return ($Value | ConvertTo-Json -Compress -Depth 20) }
    return $Value
}

function Get-SceneRows {
    param($Data)

    $rows = @()
    foreach ($sceneName in ($Data.scenes.PSObject.Properties.Name | Sort-Object)) {
        $scene = $Data.scenes.$sceneName
        $rows += [ordered]@{
            SceneID    = $scene.id
            Chapter    = $scene.chapter
            Title      = $scene.title
            Background = $scene.background
            Music      = $scene.music
            NextScene  = $scene.next_scene
            Effect     = $scene.effect
        }
    }
    return $rows
}

function Get-DialogRows {
    param($Data)

    $rows = @()
    foreach ($sceneName in ($Data.scenes.PSObject.Properties.Name | Sort-Object)) {
        $scene = $Data.scenes.$sceneName
        $dialogues = @($scene.dialogues) | Sort-Object { $_.order }
        foreach ($line in $dialogues) {
            $condition = $line.condition
            $rows += [ordered]@{
                SceneID        = $sceneName
                Order          = $line.order
                Speaker        = $line.speaker
                Text           = $line.text
                Style          = $line.style
                Portrait       = $line.portrait
                ConditionKey   = $(if ($null -ne $condition) { $condition.flag_key } else { $null })
                ConditionValue = $(if ($null -ne $condition) { Normalize-Value $condition.flag_value } else { $null })
                Label          = $line.label
            }
        }
    }
    return $rows
}

function Get-ChoiceRows {
    param($Data)

    $rows = @()
    foreach ($sceneName in ($Data.scenes.PSObject.Properties.Name | Sort-Object)) {
        $scene = $Data.scenes.$sceneName
        $choices = @($scene.choices) | Sort-Object { $_.order }
        foreach ($choice in $choices) {
            $rows += [ordered]@{
                SceneID      = $sceneName
                Order        = $choice.order
                Text         = $choice.text
                FlagKey      = $choice.flag_key
                FlagValue    = Normalize-Value $choice.flag_value
                NextScene    = $choice.next_scene
                NextDialogue = $choice.next_dialogue
            }
        }
    }
    return $rows
}

function Get-BranchRows {
    param($Data)

    $rows = @()
    foreach ($sceneName in ($Data.scenes.PSObject.Properties.Name | Sort-Object)) {
        $scene = $Data.scenes.$sceneName
        $branches = @($scene.branches) | Sort-Object { $_.order }
        foreach ($branch in $branches) {
            $rows += [ordered]@{
                SceneID   = $sceneName
                FlagKey   = $branch.flag_key
                FlagValue = Normalize-Value $branch.flag_value
                NextScene = $branch.next_scene
                Order     = $branch.order
            }
        }
    }
    return $rows
}

function Get-EvidenceRows {
    param($Data)

    $rows = @()
    foreach ($sceneName in ($Data.scenes.PSObject.Properties.Name | Sort-Object)) {
        $scene = $Data.scenes.$sceneName
        foreach ($ev in @($scene.evidence)) {
            $rows += [ordered]@{
                EvidenceID  = $ev.evidence_id
                SceneId     = $sceneName
                Trigger     = Normalize-Value $ev.trigger
                Name        = $ev.name
                Description = $ev.description
                Image       = $ev.image
            }
        }
    }
    return $rows | Sort-Object SceneId, EvidenceID
}

function Get-HeaderMap {
    param($ListObject)

    $map = [ordered]@{}
    $headers = @($ListObject.HeaderRowRange.Value2)
    if ($headers.Count -eq 1) {
        for ($i = 1; $i -le $ListObject.ListColumns.Count; $i++) {
            $name = [string]$headers[0, $i]
            $map[$name] = $i
        }
    } else {
        for ($i = 1; $i -le $ListObject.ListColumns.Count; $i++) {
            $name = [string]$headers[$i]
            $map[$name] = $i
        }
    }
    return $map
}

function Fill-TableData {
    param(
        $Worksheet,
        [object[]]$Rows
    )

    $table = $Worksheet.ListObjects.Item(1)
    $headerMap = Get-HeaderMap $table
    $columnCount = $table.ListColumns.Count

    $topLeft = $table.Range.Cells.Item(1, 1)
    $newRowCount = [Math]::Max($Rows.Count + 1, 2)
    $newRange = $Worksheet.Range(
        $topLeft,
        $Worksheet.Cells.Item($topLeft.Row + $newRowCount - 1, $topLeft.Column + $columnCount - 1)
    )
    $table.Resize($newRange)

    if ($null -ne $table.DataBodyRange) {
        $table.DataBodyRange.ClearContents() | Out-Null
    }

    for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
        $row = $Rows[$rowIndex]
        foreach ($key in $row.Keys) {
            if ($headerMap.Contains($key)) {
                $target = $table.DataBodyRange.Cells.Item($rowIndex + 1, $headerMap[$key])
                $target.Value2 = $row[$key]
            }
        }
    }
}

$data = Read-GameData -Path $InputPath

$sheetRows = [ordered]@{
    SceneTable    = @(Get-SceneRows -Data $data)
    DialogTable   = @(Get-DialogRows -Data $data)
    ChoiceTable   = @(Get-ChoiceRows -Data $data)
    BranchTable   = @(Get-BranchRows -Data $data)
    EvidenceTable = @(Get-EvidenceRows -Data $data)
}

$excel = $null
$workbook = $null

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    $workbook = $excel.Workbooks.Open($WorkbookPath)

    foreach ($sheetName in $sheetRows.Keys) {
        $worksheet = $workbook.Worksheets.Item($sheetName)
        Fill-TableData -Worksheet $worksheet -Rows $sheetRows[$sheetName]
    }

    $workbook.Save()
    Write-Output "완료: $WorkbookPath"
    Write-Output "  Scene 수: $($sheetRows['SceneTable'].Count)"
}
finally {
    if ($workbook -ne $null) {
        $workbook.Close($true)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
    }
    if ($excel -ne $null) {
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
