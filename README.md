# YAML My Git - Local Directory Editor

A modern web application for editing YAML configuration files using local directories and JSON schemas. Built with React, TypeScript, and the File System Access API.

## Features

- **Local Directory Support**: Select and load local directories containing YAML files
- **JSON Schema Validation**: Uses `schema.json` files to validate and generate forms
- **Form-based Editing**: Convert YAML content into editable forms based on schemas
- **Real-time Diff View**: See line-by-line changes with visual indicators
- **Direct File System Integration**: Write changes directly to original files using File System Access API
- **Discard Functionality**: Discard individual file changes or all changes at once
- **Modern UI**: Clean, responsive interface with dark theme

## Live Demo

The application is deployed on GitHub Pages and can be accessed at:
**https://[your-username].github.io/YamlMyGit/**

## Usage

1. **Select Directory**: Click "Select Directory" to choose a local directory containing YAML files
2. **Schema Validation**: The app will look for a `schema.json` file in the selected directory
3. **Edit Files**: Select YAML files from the sidebar and edit them using the generated forms
4. **Review Changes**: Use the diff view to see exactly what changes will be made
5. **Approve Changes**: Click "Approve & Write Changes" to save changes directly to the filesystem
6. **Discard Changes**: Use discard buttons to revert changes for individual files or all changes

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/[your-username]/YamlMyGit.git
cd YamlMyGit

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## File System Access API

This application uses the modern File System Access API to:
- Read files from local directories
- Write changes directly back to original files
- Create new files in the selected directory

### Browser Compatibility

The File System Access API is supported in:
- Chrome 86+
- Edge 86+
- Opera 72+

For other browsers, the application will show a compatibility message.

### Security

- The File System Access API requires explicit user permission
- Files are only accessed when the user grants permission
- No files are uploaded to external servers
- All processing happens locally in the browser

## Change Management

### Diff View
- Shows line-by-line changes with visual indicators
- Displays statistics (added/removed lines)
- Allows discarding individual file changes
- Normalizes whitespace to avoid false positives

### Approval Process
- Review all changes before applying
- Write changes directly to original files
- Create new files when needed
- Automatic redirect to edit view after approval

## CI/CD Pipeline

This project includes GitHub Actions workflows for:

### Testing (`test.yml`)
- Runs on push and pull requests
- Type checking with TypeScript
- Build verification
- Linting with ESLint

### Deployment (`deploy.yml`)
- Builds the project for production
- Deploys to GitHub Pages
- Only deploys from main/master branch
- Includes proper caching and concurrency controls

### Workflow Features
- **Concurrent Deployment Control**: Prevents multiple deployments from running simultaneously
- **Caching**: Uses npm cache for faster builds
- **Artifact Management**: Properly handles build artifacts for GitHub Pages
- **Environment Protection**: Uses GitHub Pages environment for deployment

## Project Structure

```
src/
├── components/          # React components
│   ├── ApprovalPanel.tsx
│   ├── DiffViewer.tsx
│   ├── DirectorySelector.tsx
│   ├── FileEditor.tsx
│   ├── FormField.tsx
│   ├── MainContent.tsx
│   └── Sidebar.tsx
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── fileSystem.d.ts
├── utils/              # Utility functions
│   ├── diffUtils.ts
│   ├── validation.ts
│   └── yamlUtils.ts
├── data/               # Mock data for development
│   └── mockData.ts
└── App.tsx             # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Browser Support

- **Chrome**: 86+ (Full support with File System Access API)
- **Edge**: 86+ (Full support with File System Access API)
- **Firefox**: Limited (No File System Access API support)
- **Safari**: Limited (No File System Access API support)

For browsers without File System Access API support, the application will display a compatibility message.
