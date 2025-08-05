# YAML My Git

A modern web application for editing YAML configuration files using local directories and JSON schemas, with integrated Git version control.

## Features

- **Local Directory Support**: Load and edit YAML files from local directories using the File System Access API
- **JSON Schema Validation**: Automatic validation using schema.json files
- **Git Integration**: Full Git repository support with isomorphic-git
  - Load existing Git repositories
  - Create new branches
  - Stage and commit changes
  - View Git status and history
- **Real-time Editing**: Live YAML editing with syntax highlighting
- **Change Management**: Track modifications with diff view and approval workflow
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Git Features

### Repository Loading
- Automatically detects Git repositories in selected directories
- Shows current branch and repository status
- Displays staged, modified, and untracked files

### Branch Management
- Create new branches from the Git panel
- Switch between existing branches
- View all available branches

### Commit Workflow
- Stage files for commit
- Write descriptive commit messages
- Commit changes directly from the approval panel
- View commit history and results

## Requirements

- Modern browser with File System Access API support (Chrome 86+, Edge 86+)
- Directory containing:
  - `schema.json` file for YAML validation
  - At least one `.yaml` or `.yml` file
- Git repository (optional, will be initialized if not present)

## Usage

1. **Select Directory**: Click "Select Directory" to choose a local directory
2. **Edit Files**: Use the editor to modify YAML files with schema validation
3. **Review Changes**: Switch to the Diff view to see all modifications
4. **Git Operations**: Use the Git tab to manage branches and commits
5. **Approve Changes**: Commit changes to files and optionally to Git

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Git Integration**: isomorphic-git
- **YAML Processing**: js-yaml
- **Build Tool**: Vite
- **Icons**: Lucide React

## Browser Support

This application requires modern browsers with support for:
- File System Access API
- ES2020+ features
- Web Workers (for isomorphic-git)

## License

MIT License - see LICENSE file for details.
