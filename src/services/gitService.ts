import * as git from 'isomorphic-git';
import OPFS from './opfsFsAdapter';

// Ensure polyfills are loaded
import '../polyfills';

export interface GitStatus {
  isGitRepository: boolean;
  currentBranch: string;
  hasChanges: boolean;
  stagedFiles: string[];
  unstagedFiles: string[];
  untrackedFiles: string[];
}

export interface GitCommitResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}

export class GitService {
  private fs: any;
  private dir: string;

  constructor(fs: any, dir: string) {
    this.fs = fs;
    this.dir = dir;
  }

  /**
   * Check if the directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const entries = await this.fs.promises.readdir('.');
      return entries.includes('.git');
    } catch {
      return false;
    }
  }

  /**
   * Get the git status of the repository
   */
  async getStatus(): Promise<GitStatus> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return {
          isGitRepository: false,
          currentBranch: '',
          hasChanges: false,
          stagedFiles: [],
          unstagedFiles: [],
          untrackedFiles: []
        };
      }

      let currentBranch = 'main';
      try {
        currentBranch = await git.currentBranch({ fs: this.fs, dir: this.dir }) || 'main';
      } catch (error) {
        console.warn('Could not get current branch, defaulting to main:', error);
      }

      let status: [string, number, number, number][] = [];
      try {
        status = await git.statusMatrix({ fs: this.fs, dir: this.dir });
      } catch (error) {
        console.warn('Could not get status matrix, assuming no changes:', error);
      }

      const stagedFiles: string[] = [];
      const unstagedFiles: string[] = [];
      const untrackedFiles: string[] = [];

      for (const [filepath, head, workdir, stage] of status) {
        if (stage === 0 && workdir === 0) {
          // Untracked file
          untrackedFiles.push(filepath);
        } else if (head !== workdir) {
          // Modified file
          unstagedFiles.push(filepath);
        } else if (head !== stage) {
          // Staged file
          stagedFiles.push(filepath);
        }
      }

      return {
        isGitRepository: true,
        currentBranch,
        hasChanges: stagedFiles.length > 0 || unstagedFiles.length > 0 || untrackedFiles.length > 0,
        stagedFiles,
        unstagedFiles,
        untrackedFiles
      };
    } catch (error) {
      console.error('Error getting git status:', error);
      return {
        isGitRepository: false,
        currentBranch: '',
        hasChanges: false,
        stagedFiles: [],
        unstagedFiles: [],
        untrackedFiles: []
      };
    }
  }

  /**
   * Initialize a git repository if it doesn't exist
   */
  async initRepository(): Promise<boolean> {
    try {
      // First check if .git directory exists
      try {
        const entries = await this.fs.promises.readdir('.');
        if (entries.includes('.git')) {
          console.log('Git repository already exists (.git directory found)');
          return true;
        }
      } catch (error) {
        console.log('No existing git repository found, will initialize new one');
      }

      console.log('Initializing new git repository...');
      await git.init({ fs: this.fs, dir: this.dir });
      console.log('Git repository initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing git repository:', error);
      return false;
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<boolean> {
    try {
      await git.branch({ fs: this.fs, dir: this.dir, ref: branchName });
      return true;
    } catch (error) {
      console.error('Error creating branch:', error);
      return false;
    }
  }

  /**
   * Switch to a branch
   */
  async checkoutBranch(branchName: string): Promise<boolean> {
    try {
      await git.checkout({ fs: this.fs, dir: this.dir, ref: branchName });
      return true;
    } catch (error) {
      console.error('Error checking out branch:', error);
      return false;
    }
  }

  /**
   * Stage files for commit
   */
  async stageFiles(filePaths: string[]): Promise<boolean> {
    try {
      console.log('Staging files:', filePaths);
      for (const filePath of filePaths) {
        console.log('Staging file:', filePath);
        await git.add({ fs: this.fs, dir: this.dir, filepath: filePath });
      }
      console.log('Successfully staged all files');
      return true;
    } catch (error) {
      console.error('Error staging files:', error);
      throw error;
    }
  }

  /**
   * Commit staged changes
   */
  async commitChanges(message: string): Promise<GitCommitResult> {
    try {
      const commitHash = await git.commit({
        fs: this.fs,
        dir: this.dir,
        message,
        author: {
          name: 'YAML My Git',
          email: 'yaml-my-git@example.com'
        }
      });

      return {
        success: true,
        commitHash
      };
    } catch (error) {
      console.error('Error committing changes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of branches
   */
  async getBranches(): Promise<string[]> {
    try {
      const branches = await git.listBranches({ fs: this.fs, dir: this.dir });
      return branches;
    } catch (error) {
      console.error('Error getting branches:', error);
      return [];
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(limit: number = 10): Promise<any[]> {
    try {
      const commits = await git.log({ fs: this.fs, dir: this.dir, depth: limit });
      return commits;
    } catch (error) {
      console.error('Error getting commit history:', error);
      return [];
    }
  }
}

/**
 * Create a git service instance for a directory
 */
export async function createGitService(dirHandle: FileSystemDirectoryHandle): Promise<GitService | null> {
  try {
    // Ensure polyfills are available
    if (typeof window !== 'undefined' && !(window as any).Buffer) {
      console.warn('Buffer polyfill not available, Git operations may fail');
    }

          // Create the OPFS-compatible filesystem adapter
      const opfsAdapter = new OPFS({ rootPromise: Promise.resolve(dirHandle) });
      const fs = opfsAdapter;

    const gitService = new GitService(fs, '.');
    
    // Test the filesystem adapter
    try {
      console.log('Testing OPFS filesystem adapter...');
      const testEntries = await fs.promises.readdir('.');
      console.log('OPFS filesystem adapter test successful, found entries:', testEntries);
    } catch (error) {
      console.warn('OPFS filesystem adapter test failed:', error);
    }
    
    return gitService;
  } catch (error) {
    console.error('Error creating git service:', error);
    return null;
  }
} 