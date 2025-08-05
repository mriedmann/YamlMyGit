# Diff Improvements

## Overview

The diff functionality has been significantly improved to show proper line-by-line changes instead of just displaying entire files side by side. The application now writes changes directly to the original files using the File System Access API instead of creating shadow files.

## What Changed

### Before
- Simple side-by-side display of original vs modified files
- No line-by-line change detection
- No visual indicators for added/removed lines
- No change statistics
- Trailing newlines treated as significant changes
- Shadow files created instead of writing to original files
- No discard functionality
- No real file system integration

### After
- **Line-by-line diff**: Shows specific changes to individual lines
- **Visual indicators**: 
  - `+` for added lines (green background)
  - `-` for removed lines (red background)
  - ` ` (space) for unchanged lines
- **Change statistics**: Shows count of added/removed lines
- **Smart matching**: Uses look-ahead algorithm to better match similar lines
- **Trailing newline normalization**: Ignores superfluous trailing newline differences
- **Direct file writing**: Changes are written directly to original files when approved
- **Discard functionality**: Discard individual files or all changes at once
- **Real File System Access API**: Uses modern browser APIs for secure file access

## How It Works

### Diff Algorithm
The new diff uses a sophisticated algorithm that:

1. **Normalizes text** by removing trailing newlines and standardizing line endings
2. **Compares lines sequentially** between original and modified content
3. **Looks ahead** up to 3 lines to find matches when lines don't align
4. **Handles insertions and deletions** intelligently
5. **Preserves context** by showing unchanged lines around changes

### Text Normalization
The diff algorithm now normalizes text before comparison:
- Converts Windows line endings (`\r\n`) to Unix (`\n`)
- Converts Mac line endings (`\r`) to Unix (`\n`)
- Removes trailing newlines to avoid false positives

### Change Management
The application now provides comprehensive change management:
- **Individual file discard**: X button on each file in diff view
- **Bulk discard**: "Discard All Changes" button in approval view
- **Direct file writing**: Changes written to original files when approved
- **Real-time tracking**: Changes tracked as you edit

### File System Access API Integration
The application now uses the File System Access API for real file operations:
- **Directory handles**: Stored for persistent access to the selected directory
- **File handles**: Stored for each file to enable direct writing
- **Writable streams**: Used to write changes back to files
- **New file creation**: Creates new files in the selected directory
- **Error handling**: Comprehensive error handling for file operations

### Example Output
```
  name: UserService
- version: 1.5.2
+ version: 1.6.0
  environment: staging
+ description: User management and authentication service
  features:
    - authentication
    - authorization
+   - user-management
+   - password-reset
  database:
    host: staging-db.example.com
    port: 5432
    ssl: false
+   maxConnections: 50
  cache:
-   enabled: false
+   enabled: true
    ttl: 1800
+   maxSize: 500
+ logging:
+   level: info
+   format: json
```

## Features

### Visual Indicators
- **Green background** (`bg-green-900/20`) for added lines
- **Red background** (`bg-red-900/20`) for removed lines
- **Normal text** for unchanged lines
- **Line numbers** shown for each line
- **Change icons** (`+`, `-`, ` `) for quick identification
- **Discard buttons** (X) on each file for individual control

### Statistics
- Shows total number of added lines
- Shows total number of removed lines
- Displays in the file header: `-5 +12` (5 removed, 12 added)

### Smart Matching
- Handles insertions and deletions gracefully
- Preserves line context around changes
- Better handles YAML indentation and structure
- Ignores trailing newline differences

### Trailing Newline Handling
- **Normalizes line endings** across different operating systems
- **Removes trailing newlines** before comparison
- **Prevents false positives** from editor auto-formatting
- **Focuses on actual content changes** rather than formatting

### Change Control
- **Individual file discard**: Remove changes for specific files
- **Bulk discard**: Revert all changes at once
- **Direct file writing**: Write approved changes to original files
- **Real-time status**: Track which files have changes

### File System Integration
- **Secure access**: Browser prompts for permission before accessing files
- **Direct writing**: Changes written directly to original files
- **New file creation**: New files created in the selected directory
- **Cross-platform**: Works on Windows, Mac, and Linux
- **No server required**: All operations happen locally in the browser

## Technical Implementation

### New Files
- `src/utils/diffUtils.ts` - Contains the diff algorithm and utilities
- `src/types/fileSystem.d.ts` - TypeScript definitions for File System Access API

### Key Functions
- `normalizeText()` - Normalizes text by removing trailing newlines and standardizing line endings
- `computeInlineDiff()` - Main diff algorithm with text normalization
- `computeDiff()` - Simple diff for basic cases
- `writeFileToFilesystem()` - Writes content to files using File System Access API
- `createNewFile()` - Creates new files in the selected directory
- `DiffLine` interface - TypeScript interface for diff lines
- `DiffResult` interface - TypeScript interface for diff results

### Integration
- Updated `DirectorySelector.tsx` to store directory and file handles
- Updated `DiffViewer.tsx` to use the new diff utilities and add discard buttons
- Updated `ApprovalPanel.tsx` to write changes directly to files using File System Access API
- Updated `MainContent.tsx` to pass discard handlers
- Updated `App.tsx` to implement discard functionality
- Added File System Access API type definitions

## Testing

The diff functionality has been tested with:
- Simple line changes (version numbers)
- Complex insertions (new sections)
- Deletions (removed properties)
- Mixed changes (both additions and deletions)
- YAML-specific formatting
- **Trailing newline scenarios** (same content with different trailing newlines)
- **Cross-platform line endings** (Windows, Mac, Unix)
- **Individual file discard** functionality
- **Bulk discard** functionality
- **File System Access API** integration

## Browser Compatibility

The diff functionality works in all modern browsers as it's purely client-side JavaScript with no external dependencies. The File System Access API requires:
- Chrome 86+
- Edge 86+
- Opera 72+

Firefox and Safari do not currently support the File System Access API.

## Security

The File System Access API provides secure access to files:
- Users must explicitly grant permission to access directories
- Access is limited to the selected directory and its subdirectories
- No files can be accessed without user consent
- All operations happen locally in the browser 