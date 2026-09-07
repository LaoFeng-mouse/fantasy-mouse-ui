param(
  [ValidateSet('Ui','Smoke','Render')][string]$Mode = 'Ui',
  [string]$RenderPath,
  [ValidateSet('empty-library','indexing','indexed','search','open-result','import-failed')][string]$RenderState = 'empty-library',
  [ValidateRange(0,30)][int]$AutoCloseSeconds = 0
)

function New-ArchiveLanternWindow {
  param([object]$State)
  $xamlPath = Join-Path $PSScriptRoot 'ArchiveLantern.xaml'
  [xml]$xaml = Get-Content -LiteralPath $xamlPath -Raw
  $reader = [System.Xml.XmlNodeReader]::new($xaml)
  $window = [Windows.Markup.XamlReader]::Load($reader)
  $names = @(
    'SearchBox','SearchButton','FailImportButton','ImportButton','WorkspaceTitle','WorkspaceSubtitle','ResultCount','ArchiveList',
    'EmptyPanel','EmptyImportButton','EmptyImage','IndexingPanel','IndexingImage','IndexingFile','IndexProgress',
    'ProgressText','RecoveryPanel','RecoveryImage','ErrorText','RetryButton','CancelRetryButton','NoResultsPanel',
    'NoResultsText','ClearSearchButton','DetailsTitle','DetailsPath','TagPanel','TagBox','AddTagButton',
    'OpenViewerPanel','ViewerText','BackButton','OpenButton','StatusText'
  )
  $controls = @{}
  foreach ($name in $names) { $controls[$name] = $window.FindName($name) }
  $State.Context = [pscustomobject]@{ Window = $window; Controls = $controls }

  $controls.ImportButton.Add_Click({ Start-ArchiveImportUi -State $State })
  $controls.EmptyImportButton.Add_Click({ Start-ArchiveImportUi -State $State })
  $controls.FailImportButton.Add_Click({ Import-Archive -State $State -Fail })
  $controls.RetryButton.Add_Click({ Start-ArchiveRetryUi -State $State })
  $controls.CancelRetryButton.Add_Click({ Set-ArchiveState -State $State -Phase 'indexed' -Status 'Import cancelled. Existing library unchanged.' })
  $controls.SearchButton.Add_Click({ Search-Archive -State $State -Query $controls.SearchBox.Text })
  $controls.SearchBox.Add_KeyDown({ param($sender, $eventArgs); if ($eventArgs.Key -eq [Windows.Input.Key]::Enter) { Search-Archive -State $State -Query $sender.Text; $eventArgs.Handled = $true } })
  $controls.ClearSearchButton.Add_Click({ $controls.SearchBox.Clear(); Set-ArchiveState -State $State -Phase 'search' -Status 'Search cleared. Showing the full library.'; $controls.SearchBox.Focus() })
  $controls.ArchiveList.Add_SelectionChanged({ if ($controls.ArchiveList.SelectedItem) { $State.SelectedItem = $controls.ArchiveList.SelectedItem; Update-ArchiveView -State $State } })
  $controls.ArchiveList.Add_KeyDown({ param($sender, $eventArgs); if ($eventArgs.Key -eq [Windows.Input.Key]::Enter -and $sender.SelectedItem) { Open-ArchiveResult -State $State; $eventArgs.Handled = $true } })
  $controls.AddTagButton.Add_Click({ Add-ArchiveTag -State $State -Tag $controls.TagBox.Text; $controls.TagBox.Clear() })
  $controls.OpenButton.Add_Click({ Open-ArchiveResult -State $State })
  $controls.BackButton.Add_Click({ Set-ArchiveState -State $State -Phase 'search' -Status 'Returned to search results.'; $controls.ArchiveList.Focus() })

  Set-ArchiveImages -State $State
  Update-ArchiveView -State $State
  return $window
}

function New-ArchiveState {
  $items = [Collections.ArrayList]::new()
  $journey = [Collections.ArrayList]::new()
  $null = $journey.Add('empty-library')
  return [pscustomobject]@{
    Phase = 'empty-library'
    Items = $items
    Results = @()
    SelectedFiles = @()
    SelectedItem = $null
    Query = ''
    Status = 'Library ready. Import files to begin.'
    Error = ''
    Progress = 0
    Journey = $journey
    Context = $null
  }
}

function Set-ArchiveState {
  param([object]$State, [string]$Phase, [string]$Status, [switch]$Record)
  $State.Phase = $Phase
  if ($Status) { $State.Status = $Status }
  if ($Record -and ($State.Journey.Count -eq 0 -or $State.Journey[-1] -ne $Phase)) { $null = $State.Journey.Add($Phase) }
  if ($State.Context -and (Get-Command Update-ArchiveView -ErrorAction Ignore)) { Update-ArchiveView -State $State }
}

function Import-Archive {
  param([object]$State, [switch]$Fail)
  if ($State.SelectedFiles.Count -eq 0) { $State.SelectedFiles = @('River-Moss-Field-Notes.pdf') }
  Set-ArchiveState -State $State -Phase 'import' -Status 'Validating selected files locally.' -Record
  if ($Fail) {
    $State.Error = 'The selected file could not be read. Your library and file selection were preserved.'
    Set-ArchiveState -State $State -Phase 'import-failed' -Status $State.Error -Record
    return
  }
  $State.Progress = 62
  Set-ArchiveState -State $State -Phase 'indexing' -Status 'Indexing River-Moss-Field-Notes.pdf locally — 62%.' -Record
}

function Complete-ArchiveIndex {
  param([object]$State, [switch]$Duplicate)
  $existing = $State.Items | Where-Object Id -eq 'river-moss' | Select-Object -First 1
  if ($Duplicate -and $existing) {
    $originalTags = @($existing.Tags)
    Set-ArchiveState -State $State -Phase 'duplicate-detected' -Status 'Duplicate detected. Kept the canonical item and its metadata.'
    if (@($existing.Tags).Count -ne $originalTags.Count) { throw 'duplicate-metadata-changed' }
    Set-ArchiveState -State $State -Phase 'indexed' -Status 'Duplicate resolved. One canonical item remains.'
    return
  }
  if (-not $existing) {
    $item = [pscustomobject]@{
      Id = 'river-moss'
      Title = 'River Moss Field Notes'
      Path = 'C:\Research\River-Moss-Field-Notes.pdf'
      Tags = [Collections.ArrayList]::new()
    }
    $null = $State.Items.Add($item)
  }
  $State.Results = @($State.Items)
  $State.SelectedItem = $State.Items[0]
  $State.Progress = 100
  Set-ArchiveState -State $State -Phase 'indexed' -Status 'Indexed 1 item. Ready to tag or search.' -Record
}

function Add-ArchiveTag {
  param([object]$State, [string]$Tag)
  $clean = $Tag.Trim()
  if (-not $State.SelectedItem) { return }
  if (-not $clean) { $clean = 'botany' }
  if (-not $State.SelectedItem.Tags.Contains($clean)) { $null = $State.SelectedItem.Tags.Add($clean) }
  Set-ArchiveState -State $State -Phase 'tag' -Status "Added tag '$clean' to $($State.SelectedItem.Title)." -Record
}

function Search-Archive {
  param([object]$State, [string]$Query)
  $State.Query = $Query.Trim()
  $matches = if ($State.Query) {
    @($State.Items | Where-Object { $_.Title -like "*$($State.Query)*" -or @($_.Tags) -contains $State.Query })
  } else { @($State.Items) }
  $State.Results = $matches
  if ($matches.Count -eq 0) {
    Set-ArchiveState -State $State -Phase 'no-results' -Status "No archive items match '$($State.Query)'. Revise or clear search."
    return
  }
  $State.SelectedItem = $matches[0]
  Set-ArchiveState -State $State -Phase 'search' -Status "$($matches.Count) result found for '$($State.Query)'." -Record
}

function Open-ArchiveResult {
  param([object]$State)
  if (-not $State.SelectedItem) { return }
  Set-ArchiveState -State $State -Phase 'open-result' -Status "Opened $($State.SelectedItem.Title) locally." -Record
}

function Retry-ArchiveImport {
  param([object]$State)
  $beforeCount = $State.Items.Count
  $preserved = @($State.SelectedFiles)
  $State.Error = ''
  $State.Progress = 62
  Set-ArchiveState -State $State -Phase 'indexing' -Status 'Retrying preserved file selection — 62%.'
  if ($State.Items.Count -ne $beforeCount -or $State.SelectedFiles.Count -ne $preserved.Count) { throw 'retry-did-not-preserve-state' }
}

function Start-ArchiveImportUi {
  param([object]$State)
  $isDuplicate = $State.Items.Count -gt 0
  Import-Archive -State $State
  $timer = [Windows.Threading.DispatcherTimer]::new()
  $timer.Interval = [TimeSpan]::FromMilliseconds(900)
  $timer.Add_Tick({
    param($sender, $eventArgs)
    $sender.Stop()
    Complete-ArchiveIndex -State $State -Duplicate:$isDuplicate
  }.GetNewClosure())
  $timer.Start()
}

function Start-ArchiveRetryUi {
  param([object]$State)
  Retry-ArchiveImport -State $State
  $timer = [Windows.Threading.DispatcherTimer]::new()
  $timer.Interval = [TimeSpan]::FromMilliseconds(900)
  $timer.Add_Tick({
    param($sender, $eventArgs)
    $sender.Stop()
    Complete-ArchiveIndex -State $State -Duplicate:($State.Items.Count -gt 0)
  }.GetNewClosure())
  $timer.Start()
}

function Invoke-SmokeJourney {
  $state = New-ArchiveState
  Import-Archive -State $state
  Complete-ArchiveIndex -State $state
  Add-ArchiveTag -State $state -Tag 'botany'
  Search-Archive -State $state -Query 'botany'
  Open-ArchiveResult -State $state

  $recovery = New-ArchiveState
  Import-Archive -State $recovery
  Complete-ArchiveIndex -State $recovery
  Add-ArchiveTag -State $recovery -Tag 'preserved'
  $beforeTags = @($recovery.SelectedItem.Tags)
  Import-Archive -State $recovery -Fail
  Retry-ArchiveImport -State $recovery
  Complete-ArchiveIndex -State $recovery -Duplicate
  Search-Archive -State $recovery -Query 'missing-query'
  $noResults = $recovery.Phase -eq 'no-results'
  Search-Archive -State $recovery -Query 'preserved'
  $recoveryPassed = $beforeTags.Count -eq $recovery.SelectedItem.Tags.Count -and $noResults -and $recovery.Results.Count -eq 1

  [ordered]@{
    ok = (@($state.Journey) -join ',') -eq 'empty-library,import,indexing,indexed,tag,search,open-result'
    journey = @($state.Journey)
    recovery = if ($recoveryPassed) { 'passed' } else { 'failed' }
  } | ConvertTo-Json -Compress
}

if ($Mode -eq 'Smoke') {
  Invoke-SmokeJourney
  return
}

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

function Set-ArchiveImages {
  param([object]$State)
  $controls = $State.Context.Controls
  $assets = Join-Path $PSScriptRoot 'assets'
  $map = @{
    EmptyImage = 'librarian-empty.png'
    IndexingImage = 'librarian-indexing.png'
    RecoveryImage = 'librarian-recovery.png'
  }
  foreach ($entry in $map.GetEnumerator()) {
    $bitmap = [Windows.Media.Imaging.BitmapImage]::new()
    $bitmap.BeginInit()
    $bitmap.UriSource = [Uri]::new((Join-Path $assets $entry.Value), [UriKind]::Absolute)
    $bitmap.CacheOption = [Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    $bitmap.EndInit()
    $controls[$entry.Key].Source = $bitmap
  }
}

function Set-Visibility {
  param([object]$Control, [bool]$Visible)
  $Control.Visibility = if ($Visible) { [Windows.Visibility]::Visible } else { [Windows.Visibility]::Collapsed }
}

function Update-ArchiveView {
  param([object]$State)
  $c = $State.Context.Controls
  $phase = $State.Phase
  Set-Visibility $c.EmptyPanel ($phase -eq 'empty-library')
  Set-Visibility $c.IndexingPanel ($phase -in @('import','indexing'))
  Set-Visibility $c.RecoveryPanel ($phase -eq 'import-failed')
  Set-Visibility $c.NoResultsPanel ($phase -eq 'no-results')
  $showList = $phase -in @('indexed','tag','search','open-result','duplicate-detected')
  Set-Visibility $c.ArchiveList $showList
  Set-Visibility $c.OpenViewerPanel ($phase -eq 'open-result')

  $visibleItems = if ($phase -in @('search','open-result','no-results')) { @($State.Results) } else { @($State.Items) }
  $c.ArchiveList.ItemsSource = $null
  $c.ArchiveList.ItemsSource = [object[]]@($visibleItems)
  if ($State.SelectedItem -and $visibleItems.Count) { $c.ArchiveList.SelectedItem = $State.SelectedItem }
  $c.ResultCount.Text = "$($visibleItems.Count) item$($(if ($visibleItems.Count -eq 1) { '' } else { 's' }))"
  $c.WorkspaceTitle.Text = if ($phase -eq 'search') { 'Search results' } elseif ($phase -eq 'open-result') { 'Open archive item' } else { 'Your archive' }
  $c.WorkspaceSubtitle.Text = if ($phase -eq 'empty-library') { 'Import files to build a searchable local library.' } elseif ($phase -eq 'indexing') { 'Building a private local index.' } else { 'Search, tag, and open your indexed research.' }
  $c.IndexProgress.Value = $State.Progress
  $c.ProgressText.Text = "$($State.Progress)% · Reading title, notes, and local text"
  $c.StatusText.Text = $State.Status
  $c.ErrorText.Text = if ($State.Error) { $State.Error } else { 'The selected file could not be read. Your library and file selection were preserved.' }

  $selected = $State.SelectedItem
  $c.DetailsTitle.Text = if ($selected) { $selected.Title } else { 'Select an item' }
  $c.DetailsPath.Text = if ($selected) { $selected.Path } else { '—' }
  $c.OpenButton.IsEnabled = [bool]$selected
  $c.TagPanel.Children.Clear()
  if ($selected) {
    foreach ($tag in @($selected.Tags)) {
      $tagButton = [Windows.Controls.Button]::new()
      $tagButton.Content = "#$tag"
      $tagButton.Margin = [Windows.Thickness]::new(0,0,8,8)
      $tagButton.ToolTip = "Tag $tag"
      $null = $c.TagPanel.Children.Add($tagButton)
    }
  }
  if ($phase -eq 'open-result' -and $selected) { $c.ViewerText.Text = "$($selected.Title) opened locally. The original file remains at $($selected.Path)." }
}

function Save-WindowPng {
  param([Windows.Window]$Window, [string]$Path)
  $Window.Width = 1440
  $Window.Height = 900
  $Window.Left = -20000
  $Window.Top = -20000
  $Window.ShowInTaskbar = $false
  $Window.ShowActivated = $false
  $Window.Show()
  try {
    $Window.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::Render)
    $Window.UpdateLayout()
    $bitmap = [Windows.Media.Imaging.RenderTargetBitmap]::new(1440,900,96,96,[Windows.Media.PixelFormats]::Pbgra32)
    $bitmap.Render($Window)
    $encoder = [Windows.Media.Imaging.PngBitmapEncoder]::new(); $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
    $stream = [IO.File]::Open($Path,[IO.FileMode]::Create); try { $encoder.Save($stream) } finally { $stream.Dispose() }
  } finally {
    $Window.Close()
  }
}

if ([Threading.Thread]::CurrentThread.ApartmentState -ne [Threading.ApartmentState]::STA) {
  throw 'Archive Lantern UI and Render modes require pwsh -Sta.'
}

$archiveState = New-ArchiveState
switch ($RenderState) {
  'indexing' { Import-Archive -State $archiveState }
  'indexed' { Import-Archive -State $archiveState; Complete-ArchiveIndex -State $archiveState }
  'search' { Import-Archive -State $archiveState; Complete-ArchiveIndex -State $archiveState; Add-ArchiveTag -State $archiveState -Tag 'botany'; Search-Archive -State $archiveState -Query 'botany' }
  'open-result' { Import-Archive -State $archiveState; Complete-ArchiveIndex -State $archiveState; Add-ArchiveTag -State $archiveState -Tag 'botany'; Search-Archive -State $archiveState -Query 'botany'; Open-ArchiveResult -State $archiveState }
  'import-failed' { Import-Archive -State $archiveState -Fail }
}
$archiveWindow = New-ArchiveLanternWindow -State $archiveState

if ($Mode -eq 'Render') {
  if (-not $RenderPath -or -not [IO.Path]::IsPathRooted($RenderPath)) { throw 'Render mode requires an absolute -RenderPath.' }
  $directory = Split-Path -Parent $RenderPath
  if (-not (Test-Path -LiteralPath $directory)) { $null = New-Item -ItemType Directory -Path $directory }
  Save-WindowPng -Window $archiveWindow -Path $RenderPath
  return
}

if ($AutoCloseSeconds -gt 0) {
  $closeTimer = [Windows.Threading.DispatcherTimer]::new()
  $closeTimer.Interval = [TimeSpan]::FromSeconds($AutoCloseSeconds)
  $closeTimer.Add_Tick({ param($sender, $eventArgs); $sender.Stop(); $archiveWindow.Close() })
  $closeTimer.Start()
}
$null = $archiveWindow.ShowDialog()
