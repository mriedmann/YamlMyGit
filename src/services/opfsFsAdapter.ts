type Stats = {
    type: 'dir' | 'file';
    size: number;
    mode: number;
    ctime: Date;
    ctimeMs: number;
    mtime: Date;
    mtimeMs: number;
    isFile(): boolean;
    isDirectory(): boolean;
    isSymbolicLink(): boolean;
};

type Dirent =
    | string
    | { name: string; isFile(): boolean; isDirectory(): boolean };

interface HandleResult {
    dir: FileSystemDirectoryHandle;
    name: string;
    fileHandle: FileSystemFileHandle | null;
    dirHandle: FileSystemDirectoryHandle | null;
}

export default class OPFS {
    [key: string]: any;

    private useSync: boolean;
    private verbose: boolean;
    private rootPromise: Promise<FileSystemDirectoryHandle>;
    private _dirCache: Map<string, FileSystemDirectoryHandle>;

    constructor(
        { rootPromise, useSync = true, verbose = false }: { rootPromise: Promise<FileSystemDirectoryHandle>; useSync?: boolean; verbose?: boolean }
    ) {
        this.useSync = useSync && 'createSyncAccessHandle' in (FileSystemFileHandle.prototype as any);
        this.verbose = verbose;
        this.rootPromise = rootPromise;
        this._dirCache = new Map();

        for (const method of [
            'readFile',
            'writeFile',
            'mkdir',
            'rmdir',
            'unlink',
            'readdir',
            'stat',
            'rename',
            'lstat',
            'symlink',
            'readlink',
            'backFile',
            'du',
        ]) {
            const original = this[method].bind(this);
            this[method] = async (...args: unknown[]): Promise<unknown> => {
                if (this.verbose) console.log(`[OPFS] ${method} called with args:`, args);
                try {
                    const result = await original(...args);
                    if (this.verbose) console.log(`[OPFS] ${method} returned:`, result);
                    return result;
                } catch (err: any) {
                    if (this.verbose) console.error(`[OPFS] ${method} threw error:`, err);
                    if (typeof err.code !== 'string') {
                        const error = new Error(err.message);
                        (error as any).code = 'UNKNOWN';
                        (error as any).original = err;
                        throw error;
                    }
                    throw err;
                }
            };
        }
    }

    private _normalize(path: string): string {
        if (typeof path !== 'string') throw new TypeError('Expected string path');
        const parts = path.split('/');
        const stack: string[] = [];
        for (const part of parts) {
            if (part === '' || part === '.') continue;
            if (part === '..') {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(part);
            }
        }
        return '/' + stack.join('/');
    }

    private _enoent(path: string): Error & { code: string } {
        const err = new Error(`ENOENT: No such file or directory, ${path}`) as any;
        err.code = 'ENOENT';
        return err;
    }

    private _clearDirCache(path: string = ''): void {
        path = this._normalize(path);
        for (const key of this._dirCache.keys()) {
            if (key === path || key.startsWith(path + '/')) {
                this._dirCache.delete(key);
            }
        }
    }

    private async _getHandle(
        path: string,
        opts: { create?: boolean; kind?: 'directory' } = {}
    ): Promise<HandleResult> {
        const cleanPath = path.replace(/^\/+/, '');
        const parts = cleanPath.split('/').filter(Boolean);
        let dir = await this.rootPromise;

        for (let i = 0; i < parts.length - 1; i++) {
            try {
                dir = await dir.getDirectoryHandle(parts[i], { create: opts.create });
            } catch (err) {
                if (!opts.create) throw this._enoent(path);
                throw err;
            }
        }

        const name = parts[parts.length - 1];
        try {
            if (opts.kind === 'directory') {
                const dirHandle = await dir.getDirectoryHandle(name, { create: opts.create });
                return { dir, name, dirHandle, fileHandle: null };
            } else {
                const fileHandle = await dir.getFileHandle(name, { create: opts.create });
                return { dir, name, fileHandle, dirHandle: null };
            }
        } catch (err) {
            if (!opts.create) return { dir, name, fileHandle: null, dirHandle: null };
            throw this._enoent(path);
        }
    }

    public async readFile(
        path: string,
        options: { encoding?: 'utf8' } = {}
    ): Promise<string | Uint8Array> {
        path = this._normalize(path);
        const { fileHandle } = await this._getHandle(path);
        if (!fileHandle) throw this._enoent(path);

        if (this.useSync) {
            const access = await (fileHandle as any).createSyncAccessHandle();
            const size = access.getSize();
            const buffer = new Uint8Array(size);
            access.read(buffer);
            access.close();
            return options.encoding === 'utf8'
                ? new TextDecoder().decode(buffer)
                : buffer;
        } else {
            const file = await fileHandle.getFile();
            const buffer = new Uint8Array(await file.arrayBuffer());
            return options.encoding === 'utf8'
                ? new TextDecoder().decode(buffer)
                : buffer;
        }
    }

    public async writeFile(
        path: string,
        data: string | Uint8Array,
        options: {} = {}
    ): Promise<void> {
        path = this._normalize(path);
        this._clearDirCache(path);
        const { fileHandle } = await this._getHandle(path, { create: true });
        const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;

        if (this.useSync) {
            const access = await (fileHandle as any).createSyncAccessHandle();
            access.truncate(0);
            access.write(buffer);
            access.close();
        } else {
            const writable = await fileHandle!.createWritable();
            await writable.write(buffer);
            await writable.close();
        }
    }

    public async mkdir(path: string): Promise<void> {
        path = this._normalize(path);
        this._clearDirCache(path);
        const parts = path.split('/').filter(Boolean);
        let dir = await this.rootPromise;
        for (const part of parts) {
            const subPath = '/' + parts.slice(0, parts.indexOf(part) + 1).join('/');
            if (this._dirCache.has(subPath)) {
                dir = this._dirCache.get(subPath)!;
            } else {
                dir = await dir.getDirectoryHandle(part, { create: true });
                this._dirCache.set(subPath, dir);
            }
        }
    }

    public async rmdir(path: string): Promise<void> {
        path = this._normalize(path);
        this._clearDirCache(path);
        const limitConcurrency = async <T, R>(
            items: T[],
            maxConcurrent: number,
            taskFn: (item: T) => Promise<R>
        ): Promise<R[]> => {
            const queue = [...items];
            const results: R[] = [];
            const workers = Array.from({ length: maxConcurrent }).map(async () => {
                while (queue.length) {
                    const item = queue.shift()!;
                    results.push(await taskFn(item));
                }
            });
            await Promise.all(workers);
            return results;
        };

        if (path === '/' || path === '') {
            const root = await this.rootPromise;
            const entries: string[] = [];
            for await (const [name] of root.entries()) {
                entries.push(name);
            }
            await limitConcurrency(entries, 10, (name) =>
                root.removeEntry(name, { recursive: true })
            );
            return;
        }

        const parts = path.split('/').filter(Boolean);
        const name = parts.pop()!;
        let dir = await this.rootPromise;
        for (const part of parts) {
            dir = await dir.getDirectoryHandle(part);
        }
        try {
            await dir.removeEntry(name, { recursive: true });
        } catch {
            throw this._enoent(path);
        }
    }

    public async unlink(path: string): Promise<void> {
        path = this._normalize(path);
        this._clearDirCache(path);
        const { dir, name, fileHandle } = await this._getHandle(path);
        if (!fileHandle) throw this._enoent(path);
        try {
            await dir.removeEntry(name);
        } catch {
            throw this._enoent(path);
        }
    }

    public async readdir(
        path: string,
        options: { withFileTypes?: boolean } = {}
    ): Promise<Dirent[]> {
        path = this._normalize(path);
        const parts = path.split('/').filter(Boolean);
        let dir = await this.rootPromise;
        for (let i = 0; i < parts.length; i++) {
            const currentPath = '/' + parts.slice(0, i + 1).join('/');
            if (this._dirCache.has(currentPath)) {
                dir = this._dirCache.get(currentPath)!;
                continue;
            }
            dir = await dir.getDirectoryHandle(parts[i]);
            this._dirCache.set(currentPath, dir);
        }
        const entries: Dirent[] = [];
        for await (const [name, handle] of dir.entries()) {
            if (options.withFileTypes) {
                entries.push({
                    name,
                    isFile: () => handle.kind === 'file',
                    isDirectory: () => handle.kind === 'directory',
                });
            } else {
                entries.push(name);
            }
        }
        return entries;
    }

    public async stat(path: string): Promise<Stats> {
        path = this._normalize(path);
        const defaultDate = new Date(0);
        if (path === '/' || path === '') {
            return {
                type: 'dir',
                size: 0,
                mode: 0o040755,
                ctime: defaultDate,
                ctimeMs: 0,
                mtime: defaultDate,
                mtimeMs: 0,
                isFile: () => false,
                isDirectory: () => true,
                isSymbolicLink: () => false,
            };
        }
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop()!;
        let dir = await this.rootPromise;
        for (let i = 0; i < parts.length; i++) {
            const currentPath = '/' + parts.slice(0, i + 1).join('/');
            if (this._dirCache.has(currentPath)) {
                dir = this._dirCache.get(currentPath)!;
                continue;
            }
            try {
                dir = await dir.getDirectoryHandle(parts[i]);
                this._dirCache.set(currentPath, dir);
            } catch {
                throw this._enoent(path);
            }
        }

        const [fileResult, dirResult] = await Promise.allSettled([
            dir.getFileHandle(name),
            dir.getDirectoryHandle(name),
        ]);

        if (dirResult.status === 'fulfilled') {
            return {
                type: 'dir',
                size: 0,
                mode: 0o040755,
                ctime: defaultDate,
                ctimeMs: 0,
                mtime: defaultDate,
                mtimeMs: 0,
                isFile: () => false,
                isDirectory: () => true,
                isSymbolicLink: () => false,
            };
        }

        if (fileResult.status === 'fulfilled') {
            const fileHandle = fileResult.value;
            const file = await fileHandle.getFile();
            let mtime = new Date(file.lastModified ?? Date.now());
            if (isNaN(mtime.valueOf())) mtime = defaultDate;
            return {
                type: 'file',
                size: file.size,
                mode: 0o100644,
                ctime: mtime,
                ctimeMs: mtime.getTime(),
                mtime,
                mtimeMs: mtime.getTime(),
                isFile: () => true,
                isDirectory: () => false,
                isSymbolicLink: () => false,
            };
        }
        throw this._enoent(path);
    }

    public async rename(oldPath: string, newPath: string): Promise<void> {
        oldPath = this._normalize(oldPath);
        newPath = this._normalize(newPath);
        this._clearDirCache(oldPath);
        this._clearDirCache(newPath);
        const data = await this.readFile(oldPath);
        await this.writeFile(newPath, data as Uint8Array | string);
        await this.unlink(oldPath);
    }

    public async lstat(path: string): Promise<Stats> {
        return this.stat(path);
    }

    public async symlink(): Promise<never> {
        const err = new Error('symlink() is not supported in OPFS') as any;
        err.code = 'ENOTSUP';
        throw err;
    }

    public async readlink(): Promise<never> {
        const err = new Error('readlink() is not supported in OPFS') as any;
        err.code = 'ENOTSUP';
        throw err;
    }

    public async backFile(path: string): Promise<Stats> {
        path = this._normalize(path);
        try {
            return await this.stat(path);
        } catch (err: any) {
            if (err.code === 'ENOENT') throw err;
            throw this._enoent(path);
        }
    }

    public async du(path: string): Promise<{ path: string; size: number }> {
        path = this._normalize(path);
        const stat = await this.stat(path);
        return { path, size: stat.size };
    }
}
