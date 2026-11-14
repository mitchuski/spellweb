#requires -Version 5.1
<#
.SYNOPSIS
  Convert generated session pages so the transcript is a downloadable ASSET
  (assets/<slug>/) instead of raw text embedded in the page JSON.

.DESCRIPTION
  For every <base>.content.json in -InDir:
    1. derive the page slug from its title,
    2. copy that session's .txt / .srt / .vtt into the wiki's assets/<slug>/
       folder (named <slug>.txt etc. so downloads are self-describing),
    3. regenerate <base>.page.json with -TranscriptAsset (adds a "# Transcript"
       heading + an `assets` item whose text is the slug; no inline transcript),
    4. stage + seed the page into the wiki.
  Keeps the page title/slug unchanged so existing links keep resolving.
#>
param(
  [string] $InDir      = "$env:USERPROFILE\transcripts",
  [string] $PagesDir   = "$env:USERPROFILE\.wiki\pages",
  [string] $AssetsRoot = "$env:USERPROFILE\.wiki\assets",
  [string] $SkillDir   = $PSScriptRoot
)
function ConvertTo-Slug([string]$s){ (($s -replace '\s','-') -replace '[^A-Za-z0-9\-]','').ToLower() }
$gen = Join-Path $SkillDir "make-wiki-page.ps1"

$n=0
Get-ChildItem (Join-Path $InDir "*.content.json") | ForEach-Object {
  $base  = $_.Name -replace '\.content\.json$',''
  $title = ([System.IO.File]::ReadAllText($_.FullName,[System.Text.Encoding]::UTF8) | ConvertFrom-Json).title
  $slug  = ConvertTo-Slug $title
  $adir  = Join-Path $AssetsRoot $slug
  if (-not (Test-Path $adir)) { New-Item -ItemType Directory -Path $adir | Out-Null }
  foreach ($ext in "txt","srt","vtt") {
    $srcf = Join-Path $InDir "$base.$ext"
    if (Test-Path $srcf) { Copy-Item $srcf (Join-Path $adir "$slug.$ext") -Force }
  }
  & $gen -FromJson $_.FullName -TranscriptAsset -OutFile (Join-Path $InDir "$base.page.json") | Out-Null
  Write-Output ("{0,-34} -> assets/{1}/ ({2} files)" -f $title, $slug, (Get-ChildItem $adir -File).Count)
  $n++
}
& (Join-Path $SkillDir "stage-wiki-pages.ps1") | Out-Null
Copy-Item (Join-Path $InDir "wiki-pages\*") $PagesDir -Force
Write-Output "Converted $n session pages to transcript-as-asset and re-seeded."
