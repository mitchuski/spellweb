#requires -Version 5.1
<#
.SYNOPSIS
  Build/refresh a "Workshop Videos" hub page that links to every generated video
  page, and ensure the wiki home page (welcome-visitors) links to that hub.

.DESCRIPTION
  FedWiki navigation is link-driven: a page is only reachable if something links
  to it. This scans the generated *.page.json files for their titles, writes a
  hub page (slug: workshop-videos) listing them all as [[wiki links]], and patches
  welcome-visitors so the hub is reachable from the front door. All files are
  written UTF-8 without BOM (FedWiki's JSON.parse rejects a BOM).
#>
param(
  [string] $InDir    = "$env:USERPROFILE\transcripts",
  [string] $PagesDir = "$env:USERPROFILE\.wiki\pages",
  [string] $WikiUrl  = "http://localhost:3030"
)

function New-Id { -join ((1..16) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) }) }
function Write-NoBom([string]$path,[string]$text) {
  [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))
}
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
if (-not (Test-Path $PagesDir)) { New-Item -ItemType Directory -Path $PagesDir | Out-Null }

# --- collect titles from generated pages (exclude the hub itself) ---
$titles = Get-ChildItem (Join-Path $InDir "*.page.json") |
  ForEach-Object { (Get-Content $_.FullName -Raw | ConvertFrom-Json).title } |
  Where-Object { $_ -and $_ -ne "Workshop Videos" } | Sort-Object -Unique
if (-not $titles) { Write-Output "No generated pages found in $InDir"; return }
$links = ($titles | ForEach-Object { "- [[$_]]" }) -join "`n"

# --- write the hub page ---
$hub = [ordered]@{
  title = "Workshop Videos"
  story = @(
    [ordered]@{ type="markdown"; id=(New-Id); text="# Workshop Videos`n`nTranscribed workshop sessions with AI-generated summaries. Each page embeds the source video and a detailed summary with key points and action items." },
    [ordered]@{ type="markdown"; id=(New-Id); text="# Sessions`n`n$links" }
  )
  journal = @( [ordered]@{ type="create"; id=(New-Id); item=[ordered]@{ title="Workshop Videos"; story=@() }; date=$now } )
}
Write-NoBom (Join-Path $PagesDir "workshop-videos") ($hub | ConvertTo-Json -Depth 8)
Write-Output "Wrote hub page 'Workshop Videos' with $($titles.Count) link(s)."

# --- ensure welcome-visitors links to the hub ---
try { $wv = (Invoke-WebRequest "$WikiUrl/welcome-visitors.json" -UseBasicParsing -TimeoutSec 8).Content | ConvertFrom-Json } catch { $wv = $null }
if (-not $wv) {
  $wv = [ordered]@{ title="Welcome Visitors"; story=@(); journal=@() }
}
$already = $false
foreach ($s in $wv.story) { if ($s.text -and $s.text -match "Workshop Videos") { $already = $true } }
if (-not $already) {
  $linkItem = [ordered]@{ type="paragraph"; id=(New-Id); text="Workshop video transcripts and summaries: [[Workshop Videos]]" }
  $wv.story = @($wv.story) + $linkItem
  if (-not $wv.journal) { $wv.journal = @() }
  $wv.journal = @($wv.journal) + ([ordered]@{ type="add"; id=$linkItem.id; item=$linkItem; date=$now })
  Write-NoBom (Join-Path $PagesDir "welcome-visitors") ($wv | ConvertTo-Json -Depth 12)
  Write-Output "Patched welcome-visitors with a [[Workshop Videos]] link."
} else {
  Write-Output "welcome-visitors already links to Workshop Videos."
}
