#requires -Version 5.1
<#
.SYNOPSIS
  Assemble a FedWiki (Smallest Federated Wiki) page JSON from supplied content,
  matching the "Video Template" page shape: a video item + Summary / Detail /
  See markdown blocks. The AI-written content (title, summary, bullets, actions)
  is passed in; this just does the mechanical JSON assembly with valid item IDs.

.EXAMPLE
  ./make-wiki-page.ps1 -Title "Session One" `
    -VideoUrl "http://<wiki-host>/assets/workshop-videos/session_01.mov" `
    -Caption "The first planning session." `
    -Summary "..." -KeyPoints @("a","b") -ActionItems @("x","y") `
    -See @("[[Workshop Videos]]","[[Video Template]]") `
    -OutFile "$env:USERPROFILE\transcripts\session_01.page.json"
#>
param(
  [string]   $Title,
  [string]   $VideoUrl,
  [string]   $Caption    = "",
  [string]   $Summary,
  [string[]] $KeyPoints  = @(),
  [string[]] $ActionItems= @(),
  [string[]] $See        = @("[[Workshop Videos]]","[[Video Template]]"),
  [Parameter(Mandatory)][string]   $OutFile,
  # Alternative to the individual params: a JSON file with fields
  # { title, videoUrl, caption, summary, keyPoints[], actionItems[], see[] }
  [string]   $FromJson,
  # Optional: a transcript .txt to embed as a collapsible "# Transcript" section.
  [string]   $TranscriptFile,
  # Optional: instead of embedding the transcript text, add an `assets` item whose
  # text is the page slug (the transcript files live in assets/<slug>/ for download).
  [switch]   $TranscriptAsset
)

if ($FromJson) {
  if (-not (Test-Path $FromJson)) { throw "FromJson not found: $FromJson" }
  # Read as UTF-8 explicitly; Get-Content on PS 5.1 misreads BOM-less UTF-8 as
  # ANSI and corrupts non-ASCII (em dashes, curly quotes) into mojibake.
  $c = [System.IO.File]::ReadAllText($FromJson, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
  if ($c.title)       { $Title       = $c.title }
  if ($c.videoUrl)    { $VideoUrl    = $c.videoUrl }
  if ($c.caption)     { $Caption     = $c.caption }
  if ($c.summary)     { $Summary     = $c.summary }
  if ($c.keyPoints)   { $KeyPoints   = @($c.keyPoints) }
  if ($c.actionItems) { $ActionItems = @($c.actionItems) }
  if ($c.see)         { $See         = @($c.see) }
}
if (-not $Title)    { throw "Title is required (param or -FromJson)" }
if (-not $VideoUrl) { throw "VideoUrl is required (param or -FromJson)" }
if (-not $Summary)  { throw "Summary is required (param or -FromJson)" }

function New-Id { -join ((1..16) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) }) }
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$story = New-Object System.Collections.ArrayList
function Add-Item($type,$text) { [void]$story.Add([ordered]@{ type=$type; id=(New-Id); text=$text }) }

Add-Item "video"    ("HTML5 mp4 $VideoUrl" + $(if ($Caption) { "`n$Caption" } else { "" }))
Add-Item "markdown" ("# Summary`n`n$Summary")
if ($KeyPoints.Count)   { Add-Item "markdown" ("## Key points`n`n" + (($KeyPoints   | ForEach-Object { "- $_" }) -join "`n")) }
if ($ActionItems.Count) { Add-Item "markdown" ("## Action items`n`n" + (($ActionItems | ForEach-Object { "- $_" }) -join "`n")) }
Add-Item "markdown" ("# See`n`n" + (($See | ForEach-Object { "- $_" }) -join "`n"))

# Transcript as a downloadable asset: add an `assets` item whose text is the page
# slug; the transcript files live in the wiki's assets/<slug>/ folder.
if ($TranscriptAsset) {
  $slug = (($Title -replace '\s','-') -replace '[^A-Za-z0-9\-]','').ToLower()
  Add-Item "markdown" "# Transcript"
  Add-Item "assets" $slug
}
# Otherwise, optionally collapse the whisper per-line segments into readable
# paragraphs and place them after a pagefold so they are collapsed by default.
elseif ($TranscriptFile -and (Test-Path $TranscriptFile)) {
  $raw = [System.IO.File]::ReadAllText($TranscriptFile, [System.Text.Encoding]::UTF8)
  $lines = ($raw -split "`r?`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
  $paras = @(); $buf = @()
  foreach ($ln in $lines) { $buf += $ln; if ($buf.Count -ge 6) { $paras += ($buf -join " "); $buf = @() } }
  if ($buf.Count) { $paras += ($buf -join " ") }
  Add-Item "pagefold" "transcript"
  Add-Item "markdown" ("# Transcript`n`n" + ($paras -join "`n`n"))
}
else {
  Add-Item "markdown" ("# Detail`n`nFull transcript and AI notes for this session.")
}

$page = [ordered]@{
  title   = $Title
  story   = $story
  journal = @( [ordered]@{ type="create"; id=(New-Id); item=[ordered]@{ title=$Title; story=@() }; date=$now } )
}

$json = $page | ConvertTo-Json -Depth 8
# Write UTF-8 WITHOUT BOM — FedWiki's JSON.parse rejects a leading BOM.
[System.IO.File]::WriteAllText($OutFile, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Wrote $OutFile"
