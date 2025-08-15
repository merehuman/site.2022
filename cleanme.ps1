# CleanMe Script - Project Cleanup Utility
# This script cleans up development artifacts and temporary files before pushing to GitHub

param(
    [switch]$Force,
    [switch]$DryRun,
    [switch]$Help
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "CleanMe Script - Project Cleanup Utility" $Cyan
    Write-ColorOutput "==========================================" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" $Yellow
    Write-ColorOutput "  .\cleanme.ps1 [options]" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Options:" $Yellow
    Write-ColorOutput "  -Force     Skip confirmation prompts" $Yellow
    Write-ColorOutput "  -DryRun    Show what would be deleted without actually deleting" $Yellow
    Write-ColorOutput "  -Help      Show this help message" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "This script will clean up:" $Yellow
    Write-ColorOutput "  - node_modules directories" $Yellow
    Write-ColorOutput "  - package-lock.json files in subdirectories" $Yellow
    Write-ColorOutput "  - IDE-specific directories (.vs, .cursor)" $Yellow
    Write-ColorOutput "  - Temporary files and logs" $Yellow
    Write-ColorOutput "  - OS-specific files" $Yellow
    Write-ColorOutput ""
}

if ($Help) {
    Show-Help
    exit 0
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-ColorOutput "Warning: This doesn't appear to be a git repository!" $Red
    Write-ColorOutput "Make sure you're running this script from the project root." $Yellow
    if (-not $Force) {
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    }
}

# Define items to clean up
$itemsToClean = @(
    # Node.js related
    "node_modules",
    "package-lock.json",
    
    # IDE and editor files
    ".vs",
    ".cursor",
    ".vscode",
    ".idea",
    "*.sublime-*",
    
    # Temporary files
    "*.tmp",
    "*.temp",
    "*.log",
    "*.cache",
    "*.bak",
    "*.swp",
    "*.swo",
    "*~",
    
    # OS-specific files
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "*.lnk",
    
    # Build artifacts (if any)
    "dist",
    "build",
    "out",
    ".next",
    
    # Coverage and test files
    "coverage",
    ".nyc_output",
    "*.lcov",
    
    # Environment files (be careful!)
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local"
)

# Items to clean up in subdirectories only
$subdirItemsToClean = @(
    "node_modules",
    "package-lock.json",
    ".git",
    ".gitignore"
)

Write-ColorOutput "CleanMe Script - Starting cleanup process..." $Cyan
Write-ColorOutput "=============================================" $Cyan

if ($DryRun) {
    Write-ColorOutput "DRY RUN MODE - No files will actually be deleted" $Yellow
    Write-ColorOutput ""
}

# Function to safely remove items
function Remove-ItemSafely {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        if ($DryRun) {
            Write-ColorOutput "[DRY RUN] Would remove: $Path" $Yellow
        } else {
            try {
                if (Test-Path $Path -PathType Container) {
                    Remove-Item $Path -Recurse -Force -ErrorAction Stop
                } else {
                    Remove-Item $Path -Force -ErrorAction Stop
                }
                Write-ColorOutput "✓ Removed: $Description" $Green
            } catch {
                Write-ColorOutput "✗ Failed to remove: $Path - $($_.Exception.Message)" $Red
            }
        }
    } else {
        Write-ColorOutput "- Skipped (not found): $Description" $Cyan
    }
}

# Clean up main directory items
Write-ColorOutput "Cleaning main directory..." $Cyan
foreach ($item in $itemsToClean) {
    $fullPath = Join-Path (Get-Location) $item
    if (Test-Path $fullPath) {
        Remove-ItemSafely -Path $fullPath -Description $item
    }
}

# Clean up subdirectories
Write-ColorOutput ""
Write-ColorOutput "Cleaning subdirectories..." $Cyan

# Get all subdirectories
$subdirs = Get-ChildItem -Directory -Recurse -Depth 1 | Where-Object { 
    $_.Name -notin @("node_modules", ".git", ".vs", ".cursor") 
}

foreach ($subdir in $subdirs) {
    Write-ColorOutput "Checking: $($subdir.Name)" $Cyan
    
    foreach ($item in $subdirItemsToClean) {
        $itemPath = Join-Path $subdir.FullName $item
        if (Test-Path $itemPath) {
            $description = "$($subdir.Name)/$item"
            Remove-ItemSafely -Path $itemPath -Description $description
        }
    }
}

# Special handling for external library directories
Write-ColorOutput ""
Write-ColorOutput "Checking external library directories..." $Cyan

$externalLibs = @("leader-line-new-master", "anseki-leader-line-6c26a9d")
foreach ($lib in $externalLibs) {
    if (Test-Path $lib) {
        Write-ColorOutput "Found external library: $lib" $Yellow
        if (-not $Force -and -not $DryRun) {
            $response = Read-Host "Remove development files from $lib? (y/N)"
            if ($response -eq "y" -or $response -eq "Y") {
                $devFiles = @("node_modules", "package-lock.json", ".git", "test")
                foreach ($file in $devFiles) {
                    $filePath = Join-Path $lib $file
                    Remove-ItemSafely -Path $filePath -Description "$lib/$file"
                }
            }
        } elseif ($DryRun) {
            Write-ColorOutput "[DRY RUN] Would check for development files in: $lib" $Yellow
        }
    }
}

# Final summary
Write-ColorOutput ""
Write-ColorOutput "=============================================" $Cyan
if ($DryRun) {
    Write-ColorOutput "DRY RUN COMPLETED - No files were actually deleted" $Yellow
    Write-ColorOutput "Run without -DryRun to perform actual cleanup" $Yellow
} else {
    Write-ColorOutput "Cleanup completed successfully!" $Green
    Write-ColorOutput "Your project is now ready to push to GitHub." $Green
}

Write-ColorOutput ""
Write-ColorOutput "Next steps:" $Cyan
Write-ColorOutput "1. Review the changes with: git status" $Yellow
Write-ColorOutput "2. Add files: git add ." $Yellow
Write-ColorOutput "3. Commit: git commit -m 'Clean up project files'" $Yellow
Write-ColorOutput "4. Push: git push" $Yellow
