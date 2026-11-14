#requires -Version 5.1
<#
.SYNOPSIS
  Build a master workshop page that links every generated session page and
  attaches all produced files as a downloadable wiki assets folder.

.DESCRIPTION
  - Copies all artifacts (transcripts, subtitles, summaries, content/page JSON,
    master index, and the skill scripts) into the wiki's assets folder so they
    are downloadable via the assets plugin.
  - Builds a page (default title "Workshop Recordings") with: intro, a links
    list to every session page, a "how it was made" note, and an `assets` story
    item that renders the file listing.
  - Links the page from welcome-visitors. All files written UTF-8 without BOM.
#>
param(
  [string] $InDir       = "$env:USERPROFILE\transcripts",
  [string] $SkillDir    = $PSScriptRoot,
  [string] $PagesDir    = "$env:USERPROFILE\.wiki\pages",
  [string] $AssetsRoot  = "$env:USERPROFILE\.wiki\assets",
  [string] $AssetFolder = "workshop-recordings",
  [string] $Title       = "Workshop Recordings",
  [string] $WikiUrl     = "http://localhost:3030"
)

function New-Id { -join ((1..16) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) }) }
function Write-NoBom([string]$p,[string]$t){ [System.IO.File]::WriteAllText($p,$t,(New-Object System.Text.UTF8Encoding($false))) }
function ConvertTo-Slug([string]$s){ (($s -replace '\s','-') -replace '[^A-Za-z0-9\-]','').ToLower() }
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

# --- 1) copy artifacts into the wiki assets folder ---
$adir = Join-Path $AssetsRoot $AssetFolder
if (-not (Test-Path $adir)) { New-Item -ItemType Directory -Path $adir | Out-Null }
foreach ($pat in "*.txt","*.srt","*.vtt","*.summary.md","*.content.json","*.page.json") {
  Get-ChildItem (Join-Path $InDir $pat) -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "_batch_log.txt" } | Copy-Item -Destination $adir -Force
}
$skillSub = Join-Path $adir "skill"
if (-not (Test-Path $skillSub)) { New-Item -ItemType Directory -Path $skillSub | Out-Null }
Get-ChildItem (Join-Path $SkillDir "*") -Include "*.ps1","SKILL.md" -ErrorAction SilentlyContinue | Copy-Item -Destination $skillSub -Force
$fileCount = (Get-ChildItem $adir -Recurse -File).Count

# --- 2) collect session titles ---
$titles = Get-ChildItem (Join-Path $InDir "*.page.json") |
  ForEach-Object { (Get-Content $_.FullName -Raw | ConvertFrom-Json).title } |
  Where-Object { $_ -and $_ -ne $Title -and $_ -ne "Workshop Videos" } | Sort-Object -Unique
$links = ($titles | ForEach-Object { "- [[$_]]" }) -join "`n"

# --- 3) build the page ---
$story = New-Object System.Collections.ArrayList
function Add-Item($type,$text){ [void]$story.Add([ordered]@{ type=$type; id=(New-Id); text=$text }) }
$nl = [char]10
Add-Item "markdown" ("# $Title$nl$nl" + "Transcribed recordings from the workshop sessions. Each session page embeds the source video, an AI-generated summary (key points and action items), and the full collapsible transcript.")
Add-Item "markdown" ("# Sessions$nl$nl$links")
Add-Item "markdown" ("# How it was made$nl$nl" + "Videos were transcribed locally with whisper.cpp (large-v3-turbo), audio streamed from the workshop wiki and extracted with ffmpeg, then summarised and turned into these wiki pages by the agentprivacy-wiki-transcribe skill.")
Add-Item "markdown" ("# Files$nl$nl" + "Every transcript (.txt / .srt / .vtt), summary, generated page JSON, and the skill scripts are attached below for download.")
Add-Item "assets"   $AssetFolder
Add-Item "markdown" ("# See$nl$nl- [[Workshop Videos]]$nl- [[FedWiki Transcribe Skill]]$nl- [[Video Template]]")

$page = [ordered]@{
  title   = $Title
  story   = $story
  journal = @( [ordered]@{ type="create"; id=(New-Id); item=[ordered]@{ title=$Title; story=@() }; date=$now } )
}
$slug = ConvertTo-Slug $Title
Write-NoBom (Join-Path $PagesDir $slug) ($page | ConvertTo-Json -Depth 8)
Write-Output "Wrote page '$Title' (slug: $slug) with $($titles.Count) session links and $fileCount attached files."

# --- 4) ensure welcome-visitors links to it ---
try { $wv = (Invoke-WebRequest "$WikiUrl/welcome-visitors.json" -UseBasicParsing -TimeoutSec 8).Content | ConvertFrom-Json } catch { $wv = $null }
if ($wv) {
  $has = $false; foreach ($s in $wv.story) { if ($s.text -and $s.text -match [regex]::Escape($Title)) { $has = $true } }
  if (-not $has) {
    $li = [ordered]@{ type="paragraph"; id=(New-Id); text="Workshop recordings, summaries and transcripts: [[$Title]]" }
    $wv.story = @($wv.story) + $li
    if (-not $wv.journal) { $wv.journal = @() }
    $wv.journal = @($wv.journal) + ([ordered]@{ type="add"; id=$li.id; item=$li; date=$now })
    Write-NoBom (Join-Path $PagesDir "welcome-visitors") ($wv | ConvertTo-Json -Depth 12)
    Write-Output "Linked [[$Title]] from welcome-visitors."
  } else { Write-Output "welcome-visitors already links to $Title." }
}
