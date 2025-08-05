# Deployment Guide

This guide will help you deploy YAML My Git to GitHub Pages using the included GitHub Actions workflow.

## Prerequisites

1. **GitHub Repository**: Make sure your project is pushed to a GitHub repository
2. **Repository Name**: The repository should be named `YamlMyGit` (or update the base path in `vite.config.ts`)
3. **Main Branch**: Ensure your main branch is named `main` or `master`

## Step-by-Step Deployment

### 1. Push Your Code

First, make sure all your changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 3. Configure GitHub Pages Environment (Optional but Recommended)

1. In the **Pages** section, click on **Environment** tab
2. Click **Configure** next to **github-pages**
3. Set **Environment protection rules**:
   - ✅ **Required reviewers**: Add yourself or team members
   - ✅ **Wait timer**: Set to 0 minutes
   - ✅ **Deployment branches**: Select `main` or `master`
4. Click **Save protection rules**

### 4. Trigger the Workflow

The deployment workflow will automatically trigger when you push to the main branch. You can also:

1. Go to **Actions** tab in your repository
2. Select **Build and Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### 5. Monitor Deployment

1. Go to **Actions** tab
2. Click on the running workflow
3. Monitor the build and deployment steps
4. Wait for the deployment to complete

### 6. Access Your Application

Once deployment is complete, your application will be available at:
```
https://[your-username].github.io/YamlMyGit/
```

## Workflow Details

### Build Workflow (`deploy.yml`)

The deployment workflow includes:

- **Build Job**: 
  - Sets up Node.js 18
  - Installs dependencies with caching
  - Builds the project for production
  - Uploads build artifacts

- **Deploy Job**:
  - Deploys to GitHub Pages
  - Only runs on main/master branch
  - Uses GitHub Pages environment for security

### Test Workflow (`test.yml`)

The test workflow includes:

- **Type Checking**: Runs TypeScript compilation
- **Linting**: Runs ESLint for code quality
- **Build Verification**: Ensures the project builds successfully

## Configuration Files

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/YamlMyGit/' : '/',
  // ... other config
});
```

**Important**: Update the base path if your repository has a different name.

### GitHub Actions (`.github/workflows/`)

- `deploy.yml`: Main deployment workflow
- `test.yml`: Testing and validation workflow

## Troubleshooting

### Common Issues

1. **404 Error on GitHub Pages**
   - Check that the base path in `vite.config.ts` matches your repository name
   - Ensure the repository is public or you have GitHub Pro for private repos

2. **Build Failures**
   - Check the Actions tab for error details
   - Ensure all dependencies are properly installed
   - Verify TypeScript compilation passes locally

3. **Permission Issues**
   - Ensure GitHub Pages is enabled in repository settings
   - Check that the workflow has proper permissions

4. **File System Access API Not Working**
   - GitHub Pages requires HTTPS (which it provides)
   - The File System Access API works correctly on GitHub Pages

### Debugging Steps

1. **Local Testing**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Check Workflow Logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Review step-by-step logs

3. **Verify Configuration**:
   - Check `vite.config.ts` base path
   - Verify workflow file syntax
   - Ensure all required files are committed

## Security Considerations

- **File System Access API**: Works securely on GitHub Pages with HTTPS
- **User Permissions**: Users must explicitly grant permission to access files
- **No Server Storage**: All file operations happen locally in the browser
- **Environment Protection**: GitHub Pages environment provides additional security

## Performance

- **Build Optimization**: Vite automatically optimizes the build for production
- **Caching**: GitHub Actions uses npm cache for faster builds
- **CDN**: GitHub Pages serves content through a global CDN
- **Compression**: Assets are automatically compressed (gzip)

## Maintenance

### Regular Updates

1. **Dependencies**: Keep dependencies updated
2. **Node.js**: Update Node.js version in workflows when needed
3. **Security**: Monitor for security advisories

### Monitoring

- **GitHub Actions**: Monitor workflow success rates
- **GitHub Pages**: Check deployment status
- **User Feedback**: Monitor issues and feature requests

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Verify configuration files
4. Test locally before pushing changes
5. Create an issue in the repository if problems persist 