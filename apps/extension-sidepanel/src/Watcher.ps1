# --- Parameters ---
param(
    # The root directory of your project or monorepo.
    [string] $RootPath = (Get-Location).Path,

    # File name for the aggregated output.
    [string] $OutputFileName = "Scrapter.txt",

    # Folders to exclude from the directory tree view.
    [string[]] $TreeExcludeFolders = @('node_modules', '.next', '.git', '__pycache__', '.venv', '.vscode', '.idea', 'dist', 'build', 'target', 'AgentUI', '.turbo', 'design', '.husky'),

    # Maximum depth for the directory tree.
    [int] $MaxDepth = 15,

    # File extensions to include in the output.
    [string[]] $IncludedExtensions = @('.py', '.yaml', '.env', '.js', '.ts', '.tsx', '.css', '.json', '.env', '.env.local', '.prisma'),

    # Directories to completely exclude from file content aggregation and project root detection.
    [string[]] $HardExcludeDirs = @('node_modules', '.git', '.venv', '__pycache__', 'dist', 'build', 'target', '.next', 'admin', '.turbo', 'database', 'Watcher.ps1', 'RunWatcher.cmd'),

    # Regex patterns to exclude specific files or paths from content aggregation and project root detection.
    [string[]] $ContentExcludePatterns = @(
        '\.venv[\\/]',
        '__pycache__',
        '\.pyc$',
        '\.log$',
        '\.tmp$',
        '\.bak$',
        '\.swp$',
        '\.db$',
        'lib[\\/]',
        'package-lock\.json',
        'yarn\.lock',
        'pnpm-lock\.yaml',
        'pnpm-workspace\.yaml'
        'react-loadable-manifest\.json',
        '\.git[\\/]',
        '\.vscode[\\/]',
        '\.idea[\\/]',
        'dist[\\/]',
        'build[\\/]',
        'target[\\/]'
    ),

    # File names that signify the root of a project in a monorepo.
    [string[]] $ProjectMarkerFiles = @('package.json', 'pom.xml', 'csproj', 'pyproject.toml')
)

# --- Function: Generate Directory Tree ---
function Get-DirectoryTree {
    param(
        [string] $BasePath,
        [string[]] $ExcludeFolders,
        [int] $Depth
    )
    $tree = New-Object System.Collections.Generic.List[string]
    try {
        $items = Get-ChildItem -LiteralPath $BasePath -Force -ErrorAction SilentlyContinue |
                 Where-Object { $_.Name -notin $ExcludeFolders } |
                 Sort-Object @{Expression={-not $_.PSIsContainer}}, Name

        foreach ($item in $items) {
            $prefix = if ($item.PSIsContainer) { "|-- $($item.Name)/" } else { "|-- $($item.Name)" }
            $tree.Add($prefix)
            if ($item.PSIsContainer -and $Depth -gt 1) {
                $subtree = Get-DirectoryTree -BasePath $item.FullName -ExcludeFolders $ExcludeFolders -Depth ($Depth - 1)
                $subtree | ForEach-Object { $tree.Add("|   $_") }
            }
        }
    } catch {
        $tree.Add("[Error generating tree for $BasePath]")
    }
    return $tree
}

# --- Function: Find Project Roots in Monorepo ---
function Find-ProjectRoots {
    param(
        [string] $SearchPath,
        [string[]] $Markers,
        [string[]] $ExcludeDirNames,
        [string[]] $ExcludePathPatterns
    )
    $projectRoots = New-Object System.Collections.Generic.List[string]
    $projectRoots.Add($SearchPath) # Always include the main root as a project root

    # Pre-compile exclusion patterns for performance
    $compiledExcludePatterns = $ExcludePathPatterns | ForEach-Object { [regex]::new($_, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) }

    Get-ChildItem -Path $SearchPath -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $currentDir = $_
        $currentDirPath = $currentDir.FullName

        # Check against HardExcludeDirs and ContentExcludePatterns (for directories)
        $shouldExclude = $false
        foreach ($excludeName in $ExcludeDirNames) {
            # Use StartsWith for efficiency when checking paths if dir is at root level of exclusion,
            # or Contains if it could be nested. Here, we use a robust check for sub-paths.
            if ($currentDir.Name -eq $excludeName -or $currentDirPath.Contains("/${excludeName}/") -or $currentDirPath.Contains("\${excludeName}\")) {
                $shouldExclude = $true
                break
            }
        }
        if (-not $shouldExclude) {
            foreach ($pattern in $compiledExcludePatterns) {
                if ($pattern.IsMatch($currentDirPath)) {
                    $shouldExclude = $true
                    break
                }
            }
        }

        if ($shouldExclude) {
            return # Skip this directory and its subdirectories from being considered as project roots
        }

        # If not excluded, check for marker files to identify as a project root
        foreach ($marker in $Markers) {
            $markerPath = Join-Path $currentDirPath $marker
            if (Test-Path -LiteralPath $markerPath -PathType Leaf) {
                $projectRoots.Add($currentDirPath)
                break # Found a marker, no need to check others for this directory.
            }
        }
    }
    return $projectRoots | Sort-Object -Unique
}


# --- Function: Aggregate Project Content ---
function Update-ProjectContextFile {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $outputFilePath = Join-Path $RootPath $OutputFileName

    # Add the output file to the exclusion patterns to prevent it from including itself.
    $localContentExcludePatterns = $ContentExcludePatterns + [regex]::Escape($outputFilePath)

    # Find all project roots based on marker files, respecting exclusions.
    $projectRoots = Find-ProjectRoots -SearchPath $RootPath -Markers $ProjectMarkerFiles -ExcludeDirNames $HardExcludeDirs -ExcludePathPatterns $ContentExcludePatterns

    $output = New-Object System.Collections.Generic.List[string]
    $output.Add("MONOREPO OVERVIEW")
    $output.Add("===================================")
    $output.Add("Root Path: $RootPath")
    $output.Add("Generated On: $(Get-Date)")
    $output.Add("Detected Projects: $($projectRoots.Count)")
    $output.Add("")

    # --- Generate Overall Directory Tree ---
    $output.Add("--- OVERALL DIRECTORY TREE (Max Depth: $MaxDepth) ---")
    $output.AddRange([string[]](Get-DirectoryTree -BasePath $RootPath -ExcludeFolders $TreeExcludeFolders -Depth $MaxDepth))
    $output.Add("--- END OVERALL DIRECTORY TREE ---")
    $output.Add("")

    # --- Optimized File Collection (Scan once, filter once) ---
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting global file collection and filtering..." -ForegroundColor Cyan

    # 1. Get ALL files recursively ONCE from the root path
    $allFilesUnderRoot = Get-ChildItem -Path $RootPath -Recurse -File -ErrorAction SilentlyContinue

    # 2. Pre-compile regex patterns for faster matching during filtering
    $compiledExcludePatterns = $localContentExcludePatterns | ForEach-Object { [regex]::new($_, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) }

    # 3. Filter these files efficiently based on all exclusion rules
    $eligibleFiles = New-Object System.Collections.Generic.List[System.IO.FileInfo]
    foreach ($file in $allFilesUnderRoot) {
        # Check included extensions first (fastest check)
        if ($file.Extension -notin $IncludedExtensions) {
            continue # Skip this file
        }

        # Check against HardExcludeDirs (e.g., node_modules, .git)
        $shouldExcludeFile = $false
        foreach ($excludeDir in $HardExcludeDirs) {
            # Check if the file's full path contains a segment matching an excluded directory
            # Using -like for flexibility with path separators
            if ($file.FullName -like "*\${excludeDir}\*" -or $file.FullName -like "*/${excludeDir}/*") {
                $shouldExcludeFile = $true
                break
            }
        }
        if ($shouldExcludeFile) {
            continue # Skip this file
        }

        # Check against regex patterns
        foreach ($pattern in $compiledExcludePatterns) {
            if ($pattern.IsMatch($file.FullName)) {
                $shouldExcludeFile = $true
                break
            }
        }
        if ($shouldExcludeFile) {
            continue # Skip this file
        }

        # If it passed all checks, add it to the eligible list
        $eligibleFiles.Add($file)
    }

    # Sort the eligible files once
    $sortedEligibleFiles = $eligibleFiles | Sort-Object FullName

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Found $($sortedEligibleFiles.Count) eligible files after global scan and filtering." -ForegroundColor Cyan

    # --- Process Each Project ---
    foreach ($projectRoot in $projectRoots) {
        $relativeProjectPath = if ($projectRoot -ne $RootPath) {
            $projectRoot.Substring($RootPath.Length).TrimStart('\','/')
        } else {
            "ROOT"
        }
        $output.Add("PROJECT: $relativeProjectPath")
        $output.Add("-----------------------------------")

        # Select files from the already filtered $sortedEligibleFiles that belong to this specific projectRoot
        # Use StartsWith for efficient path matching. Ensure correct path separator.
        $projectFiles = $sortedEligibleFiles | Where-Object {
            $filePath = $_.FullName
            # Ensure path matches with either Windows or Unix separators at the end of the project root
            # Adding a trailing slash to the projectRoot for accurate StartsWith matching
            $filePath.StartsWith("$projectRoot\", [System.StringComparison]::OrdinalIgnoreCase) -or `
            $filePath.StartsWith("$projectRoot/", [System.StringComparison]::OrdinalIgnoreCase) -or `
            ($projectRoot -eq $RootPath -and $filePath -eq $RootPath) # Handle the root path itself if it's a file
        }

        $output.Add("File Count: $($projectFiles.Count)")
        $output.Add("")

        foreach ($file in $projectFiles) {
            $relativePath = $file.FullName.Substring($projectRoot.Length).TrimStart('\','/')
            $output.Add("### FILE: $relativePath")
            try {
                $content = [System.IO.File]::ReadAllText($file.FullName)
                if ([string]::IsNullOrWhiteSpace($content)) {
                    $output.Add('[File is empty]')
                } else {
                    $output.Add($content)
                }
            } catch {
                $output.Add("[Error reading file: $($_.Exception.Message)]")
            }
            $output.Add("")
        }
        $output.Add("")
    }

    try {
        [System.IO.File]::WriteAllLines($outputFilePath, $output, [System.Text.Encoding]::UTF8)
        $stopwatch.Stop()
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Successfully updated '$OutputFileName' (took $($stopwatch.Elapsed.TotalMilliseconds)ms)." -ForegroundColor Green
    } catch {
        Write-Error "Failed to write to '$outputFilePath': $($_.Exception.Message)"
    }
}

# --- Main Execution ---
Clear-Host
Write-Host "Starting Project Context Aggregator..."
Write-Host "Root Path: $RootPath"
Write-Host "Output File: $(Join-Path $RootPath $OutputFileName)"
Write-Host "Watching for changes. Press CTRL+C to stop."
Write-Host "-----------------------------------"
Write-Host ""

# Initial update.
Update-ProjectContextFile

# File system watcher to monitor for changes.
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $RootPath
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'LastWrite, FileName, DirectoryName'

# --- Watcher Loop ---
try {
    while ($true) {
        # Wait for a change event with a timeout of 5 seconds.
        $result = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::All, 5000)

        if ($result.TimedOut) {
            continue
        }

        # A change was detected, wait a moment for more changes to settle.
        Start-Sleep -Seconds 1 # Give the file system a moment to settle down after a flurry of changes

        # Drain any other pending events to avoid rapid successive updates.
        # This loop consumes all pending events from the watcher within 200ms intervals.
        # This helps to debounce multiple events that might fire for a single save operation.
        while ($watcher.WaitForChanged([System.IO.WatcherChangeTypes]::All, 200).TimedOut -eq $false) {}

        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected. Updating context file..." -ForegroundColor Yellow
        Update-ProjectContextFile
    }
}
catch {
    Write-Host "An error occurred in the watcher."
    Write-Error $_
}
finally {
    $watcher.Dispose()
    Write-Host "Watcher stopped."
}
