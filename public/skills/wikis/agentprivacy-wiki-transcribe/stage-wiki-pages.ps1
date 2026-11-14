#requires -Version 5.1
<#
.SYNOPSIS
  Stage generated *.page.json files as FedWiki page files (slug-named, no extension)
  ready to copy into a wiki's pages/ directory.

.DESCRIPTION
  FedWiki stores each page as a JSON file named by its slug with no extension, e.g.
  a page titled "Don't Panic Tour" lives at  pages/dont-panic-tour .
  This reads every *.page.json in -InDir, derives the slug from the page title using
  FedWiki's asSlug rule (spaces -> '-', strip non [A-Za-z0-9-], lowercase), and copies
  the JSON to -OutDir/<slug> (no extension).

.EXAMPLE
  ./stage-wiki-pages.ps1
  # then copy everything in <OutDir> into the wiki host's  ~/.wiki/pages/  directory
#>
param(
  [string] $InDir  = "$env:USERPROFILE\transcripts",
  [string] $OutDir = "$env:USERPROFILE\transcripts\wiki-pages"
)

function ConvertTo-Slug([string]$title) {
  (($title -replace '\s','-') -replace '[^A-Za-z0-9\-]','').ToLower()
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$pages = Get-ChildItem (Join-Path $InDir "*.page.json")
if (-not $pages) { Write-Output "No *.page.json files found in $InDir"; return }

foreach ($p in $pages) {
  $obj  = Get-Content $p.FullName -Raw | ConvertFrom-Json
  $slug = ConvertTo-Slug $obj.title
  $dest = Join-Path $OutDir $slug          # NOTE: no extension - that is the FedWiki page filename
  Copy-Item $p.FullName $dest -Force
  Write-Output ("{0,-32} ->  pages/{1}" -f $obj.title, $slug)
}
Write-Output ""
Write-Output "Staged $($pages.Count) page(s) in: $OutDir"
Write-Output "Copy the slug-named files there into the wiki host's pages/ directory"
Write-Output "  (e.g. ~/.wiki/pages/  or  ~/.wiki/<site>/pages/ )."
