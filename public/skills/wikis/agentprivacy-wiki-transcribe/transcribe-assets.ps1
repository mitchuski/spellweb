#requires -Version 5.1
<#
.SYNOPSIS
  Transcribe every video in a FedWiki assets folder using whisper.cpp.

.DESCRIPTION
  1. Enumerates files via the FedWiki assets plugin endpoint:
        GET {WikiBase}/plugin/assets/list?assets={AssetsFolder}   ->  {"files":[...]}
  2. For each video, streams it over the network and extracts a 16 kHz mono WAV
     with ffmpeg (no multi-GB download saved to disk).
  3. Transcribes the WAV with whisper.cpp (whisper-cli) producing .txt/.srt/.vtt.
  4. Deletes the temporary WAV (unless -KeepWav).

  Idempotent: a video whose <base>.txt already exists (non-empty) is skipped,
  so the batch can be safely re-run / resumed.

.EXAMPLE
  ./transcribe-assets.ps1 -WikiBase http://<wiki-host> -AssetsFolder workshop-videos
#>
param(
  [string]   $WikiBase     = "",   # e.g. http://<wiki-host> (required),
  [string]   $AssetsFolder = "workshop-videos",
  [string]   $OutDir       = "$env:USERPROFILE\transcripts",
  [string]   $Model        = "$env:USERPROFILE\whisper.cpp\models\ggml-large-v3-turbo-q5_0.bin",
  [string]   $Cli          = "$env:USERPROFILE\whisper.cpp\build\bin\Release\whisper-cli.exe",
  [string]   $Ffmpeg       = "ffmpeg",   # on PATH, or a full path to ffmpeg(.exe)
  [string[]] $Exclude      = @(),
  [string[]] $Include      = @(),   # if set, ONLY these exact filenames are processed
  [int]      $Threads      = 16,
  [switch]   $KeepWav,
  [string]   $Language     = "en"
)

$ErrorActionPreference = "Stop"
$videoExt = @(".mov",".mp4",".m4v",".webm",".mkv",".avi",".m4a",".mp3",".wav")

function Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg
  Write-Output $line
  Add-Content -Path (Join-Path $OutDir "_batch_log.txt") -Value $line
}

# --- preflight -------------------------------------------------------------
if (-not $WikiBase) { throw "Set -WikiBase (e.g. http://<wiki-host>)" }
foreach ($p in @($Model,$Cli)) {
  if (-not (Test-Path $p)) { throw "Missing required path: $p" }
}
if (-not (Get-Command $Ffmpeg -ErrorAction SilentlyContinue)) { throw "ffmpeg not found: $Ffmpeg (put it on PATH or pass -Ffmpeg)" }
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

# --- enumerate assets ------------------------------------------------------
$listUrl = "$WikiBase/plugin/assets/list?assets=$([uri]::EscapeDataString($AssetsFolder))"
Log "Listing assets: $listUrl"
$req = [System.Net.HttpWebRequest]::Create($listUrl)
$req.Method = "GET"; $req.Accept = "application/json"; $req.Timeout = 30000
$resp = $req.GetResponse()
$sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
$json = $sr.ReadToEnd() | ConvertFrom-Json
$sr.Close(); $resp.Close()
if ($json.error) { throw "assets/list error: $($json.error)" }

$files = @($json.files | Where-Object { $videoExt -contains ([IO.Path]::GetExtension($_).ToLower()) })
$files = @($files | Where-Object { $Exclude -notcontains $_ })
if ($Include.Count) { $files = @($files | Where-Object { $Include -contains $_ }) }
Log ("Found {0} media file(s) to consider." -f $files.Count)

# Native tools (ffmpeg/whisper) write progress to stderr; under "Stop" PowerShell
# 5.1 turns that stderr into a terminating error. Switch to manual exit-code checks.
$ErrorActionPreference = "Continue"

# --- process ---------------------------------------------------------------
$done = 0; $skipped = 0; $failed = 0; $n = 0
foreach ($f in $files) {
  $n++
  $base = ([IO.Path]::GetFileNameWithoutExtension($f) -replace '[^\w\-]','_')
  $txt  = Join-Path $OutDir "$base.txt"
  $wav  = Join-Path $OutDir "$base.wav"
  $ofb  = Join-Path $OutDir $base

  if ((Test-Path $txt) -and ((Get-Item $txt).Length -gt 0)) {
    Log ("[{0}/{1}] SKIP (already done): {2}" -f $n,$files.Count,$f); $skipped++; continue
  }

  $url = "$WikiBase/assets/$([uri]::EscapeDataString($AssetsFolder))/$([uri]::EscapeDataString($f))"
  Log ("[{0}/{1}] {2}  ->  {3}.*" -f $n,$files.Count,$f,$base)

  # 1) extract audio (stream from network) - verbose output to per-file log
  Log "   extracting audio..."
  & $Ffmpeg -hide_banner -loglevel error -y -i $url -vn -ar 16000 -ac 1 -c:a pcm_s16le $wav 2>&1 |
    Out-File -FilePath "$ofb.ffmpeg.log" -Encoding utf8
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $wav)) {
    Log "   ffmpeg FAILED (exit $LASTEXITCODE) - see $base.ffmpeg.log - skipping"; $failed++; continue
  }
  $wavMB = (Get-Item $wav).Length / 1MB
  Log ("   wav ready: {0:N1} MB" -f $wavMB)

  # 2) transcribe - verbose whisper output to per-file log
  Log "   transcribing..."
  & $Cli -m $Model -f $wav -t $Threads -l $Language -otxt -osrt -ovtt -of $ofb 2>&1 |
    Out-File -FilePath "$ofb.whisper.log" -Encoding utf8
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $txt)) {
    Log "   whisper FAILED (exit $LASTEXITCODE) - see $base.whisper.log - keeping wav"; $failed++; continue
  }

  # loop-guard: whisper can fall into a degenerate repetition loop (a line/name
  # repeated for the rest of the file). Detect it and retry once with -mc 0
  # (no prior-text context), which breaks the feedback that sustains the loop.
  $tl = [System.IO.File]::ReadAllLines($txt, [System.Text.Encoding]::UTF8)
  $mx = 0; $c2 = 1; $pv = $null
  foreach ($ln in $tl) { $tt = $ln.Trim(); if ($tt -eq $pv) { $c2++; if ($c2 -gt $mx) { $mx = $c2 } } else { $c2 = 1; $pv = $tt } }
  if ($mx -ge 30) {
    Log "   loop detected (repeat run $mx) - retrying with -mc 0"
    & $Cli -m $Model -f $wav -t $Threads -l $Language -mc 0 -otxt -osrt -ovtt -of $ofb 2>&1 |
      Out-File -FilePath "$ofb.whisper.log" -Encoding utf8
  }

  # 3) cleanup
  if (-not $KeepWav) { Remove-Item $wav -ErrorAction SilentlyContinue }
  Log ("   DONE -> {0}.txt / .srt / .vtt" -f $base); $done++
}

Log ("BATCH COMPLETE: {0} done, {1} skipped, {2} failed (of {3})." -f $done,$skipped,$failed,$files.Count)
