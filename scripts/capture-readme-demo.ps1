param(
  [ValidateRange(1, 30)][int]$FrameRate = 12,
  [ValidateRange(1, 60)][int]$DurationSeconds = 22
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$workRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot 'work\readme-demo'))
$captureRoot = [IO.Path]::GetFullPath((Join-Path $workRoot ("capture-" + [Guid]::NewGuid().ToString('N'))))
$framesRoot = Join-Path $captureRoot 'frames'
$assetsRoot = Join-Path $repoRoot 'docs\assets'
$session = 'fantasy-mouse-readme-demo-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$server = $null
$opened = $false

if (-not $captureRoot.StartsWith($workRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Capture directory escaped the repository work directory.'
}

New-Item -ItemType Directory -Path $framesRoot,$assetsRoot -Force | Out-Null

function Invoke-PlaywrightCli {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  & npx --yes --package '@playwright/cli' playwright-cli "-s=$session" @Arguments
  if ($LASTEXITCODE -ne 0) { throw "playwright-cli failed with exit code $LASTEXITCODE" }
}

try {
  $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
  $listener.Start()
  $port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
  $listener.Stop()

  $pythonLauncher = (Get-Command py -ErrorAction Stop).Source
  $server = Start-Process -FilePath $pythonLauncher -ArgumentList @('-3','-m','http.server',"$port",'--bind','127.0.0.1') -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru
  $url = "http://127.0.0.1:$port/docs/demo/archive-lantern/"
  $ready = $false
  for ($attempt = 0; $attempt -lt 80; $attempt += 1) {
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1 | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if (-not $ready) { throw 'Timed out waiting for the local demo server.' }

  Invoke-PlaywrightCli open $url
  $opened = $true
  Invoke-PlaywrightCli resize 1280 720

  $frameCount = $FrameRate * $DurationSeconds
  $framePath = $framesRoot.Replace('\','/')
  $captureCode = @"
async (page) => {
  await page.waitForFunction(() => typeof window.setDemoFrame === 'function');
  await page.evaluate(() => document.fonts.ready);
  for (let frame = 0; frame < $frameCount; frame += 1) {
    await page.evaluate((value) => window.setDemoFrame(value), frame);
    const name = String(frame).padStart(3, '0');
    await page.screenshot({ path: '$framePath/frame-' + name + '.png', animations: 'disabled' });
  }
}
"@
  $captureFile = Join-Path $captureRoot 'capture.mjs'
  [IO.File]::WriteAllText($captureFile, $captureCode, [Text.UTF8Encoding]::new($false))
  Invoke-PlaywrightCli run-code --filename $captureFile

  $mp4Path = Join-Path $assetsRoot 'archive-lantern-demo.mp4'
  $gifPath = Join-Path $assetsRoot 'archive-lantern-demo.gif'
  $palettePath = Join-Path $captureRoot 'palette.png'
  $inputPattern = Join-Path $framesRoot 'frame-%03d.png'

  & ffmpeg -hide_banner -loglevel error -y -framerate $FrameRate -i $inputPattern -c:v libx264 -pix_fmt yuv420p -movflags +faststart $mp4Path
  if ($LASTEXITCODE -ne 0) { throw 'FFmpeg MP4 encoding failed.' }
  & ffmpeg -hide_banner -loglevel error -y -framerate $FrameRate -i $inputPattern -vf "fps=$FrameRate,scale=960:-1:flags=lanczos,palettegen=stats_mode=diff" $palettePath
  if ($LASTEXITCODE -ne 0) { throw 'FFmpeg palette generation failed.' }
  & ffmpeg -hide_banner -loglevel error -y -framerate $FrameRate -i $inputPattern -i $palettePath -lavfi "fps=$FrameRate,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" -loop 0 $gifPath
  if ($LASTEXITCODE -ne 0) { throw 'FFmpeg GIF encoding failed.' }

  $mp4Duration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $mp4Path)
  $gifDuration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $gifPath)
  if ($mp4Duration -lt 21.5 -or $mp4Duration -gt 22.5 -or $gifDuration -lt 21.5 -or $gifDuration -gt 22.5) {
    throw "Unexpected demo duration: MP4=$mp4Duration GIF=$gifDuration"
  }

  [ordered]@{
    ok = $true
    frames = $frameCount
    frameRate = $FrameRate
    mp4Duration = $mp4Duration
    gifDuration = $gifDuration
    mp4Bytes = (Get-Item -LiteralPath $mp4Path).Length
    gifBytes = (Get-Item -LiteralPath $gifPath).Length
  } | ConvertTo-Json -Compress
} finally {
  if ($opened) {
    try { Invoke-PlaywrightCli close } catch { }
  }
  if ($server -and -not $server.HasExited) {
    $server.Kill()
    $server.WaitForExit(5000) | Out-Null
  }
  if (Test-Path -LiteralPath $captureRoot) {
    Remove-Item -LiteralPath $captureRoot -Recurse -Force
  }
}
