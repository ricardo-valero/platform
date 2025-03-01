---
title: FileSystem.ts
nav_order: 5
parent: "@effect/platform"
---

## FileSystem overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructor](#constructor)
  - [FileDescriptor](#filedescriptor)
  - [make](#make)
- [guard](#guard)
  - [isFile](#isfile)
- [model](#model)
  - [File (interface)](#file-interface)
  - [FileSystem (interface)](#filesystem-interface)
  - [OpenFlag (type alias)](#openflag-type-alias)
  - [SeekMode (type alias)](#seekmode-type-alias)
- [options](#options)
  - [AccessFileOptions (interface)](#accessfileoptions-interface)
  - [CopyOptions (interface)](#copyoptions-interface)
  - [MakeDirectoryOptions (interface)](#makedirectoryoptions-interface)
  - [MakeTempDirectoryOptions (interface)](#maketempdirectoryoptions-interface)
  - [MakeTempFileOptions (interface)](#maketempfileoptions-interface)
  - [OpenFileOptions (interface)](#openfileoptions-interface)
  - [ReadDirectoryOptions (interface)](#readdirectoryoptions-interface)
  - [RemoveOptions (interface)](#removeoptions-interface)
  - [SinkOptions (interface)](#sinkoptions-interface)
  - [StreamOptions (interface)](#streamoptions-interface)
  - [WriteFileOptions (interface)](#writefileoptions-interface)
  - [WriteFileStringOptions (interface)](#writefilestringoptions-interface)
- [sizes](#sizes)
  - [GiB](#gib)
  - [KiB](#kib)
  - [MiB](#mib)
  - [PiB](#pib)
  - [Size](#size)
  - [Size (type alias)](#size-type-alias)
  - [SizeInput (type alias)](#sizeinput-type-alias)
  - [TiB](#tib)
- [tag](#tag)
  - [FileSystem](#filesystem)
- [type id](#type-id)
  - [FileTypeId](#filetypeid)
  - [FileTypeId (type alias)](#filetypeid-type-alias)
- [utils](#utils)
  - [File (namespace)](#file-namespace)
    - [Info (interface)](#info-interface)
    - [Descriptor (type alias)](#descriptor-type-alias)
    - [Type (type alias)](#type-type-alias)

---

# constructor

## FileDescriptor

**Signature**

```ts
export declare const FileDescriptor: Brand.Brand.Constructor<File.Descriptor>
```

Added in v1.0.0

## make

**Signature**

```ts
export declare const make: (
  impl: Omit<FileSystem, 'exists' | 'readFileString' | 'stream' | 'sink' | 'writeFileString'>
) => FileSystem
```

Added in v1.0.0

# guard

## isFile

**Signature**

```ts
export declare const isFile: (u: unknown) => u is File
```

Added in v1.0.0

# model

## File (interface)

**Signature**

```ts
export interface File {
  readonly [FileTypeId]: FileTypeId
  readonly fd: File.Descriptor
  readonly stat: Effect.Effect<never, PlatformError, File.Info>
  readonly seek: (offset: SizeInput, from: SeekMode) => Effect.Effect<never, never, void>
  readonly read: (buffer: Uint8Array) => Effect.Effect<never, PlatformError, Size>
  readonly readAlloc: (size: SizeInput) => Effect.Effect<never, PlatformError, Option<Uint8Array>>
  readonly truncate: (length?: SizeInput) => Effect.Effect<never, PlatformError, void>
  readonly write: (buffer: Uint8Array) => Effect.Effect<never, PlatformError, Size>
  readonly writeAll: (buffer: Uint8Array) => Effect.Effect<never, PlatformError, void>
}
```

Added in v1.0.0

## FileSystem (interface)

**Signature**

```ts
export interface FileSystem {
  /**
   * Check if a file can be accessed.
   * You can optionally specify the level of access to check for.
   */
  readonly access: (path: string, options?: AccessFileOptions) => Effect.Effect<never, PlatformError, void>
  /**
   * Copy a file or directory from `fromPath` to `toPath`.
   *
   * Equivalent to `cp -r`.
   */
  readonly copy: (fromPath: string, toPath: string, options?: CopyOptions) => Effect.Effect<never, PlatformError, void>
  /**
   * Copy a file from `fromPath` to `toPath`.
   */
  readonly copyFile: (fromPath: string, toPath: string) => Effect.Effect<never, PlatformError, void>
  /**
   * Change the permissions of a file.
   */
  readonly chmod: (path: string, mode: number) => Effect.Effect<never, PlatformError, void>
  /**
   * Change the owner and group of a file.
   */
  readonly chown: (path: string, uid: number, gid: number) => Effect.Effect<never, PlatformError, void>
  /**
   * Check if a path exists.
   */
  readonly exists: (path: string) => Effect.Effect<never, PlatformError, boolean>
  /**
   * Create a hard link from `fromPath` to `toPath`.
   */
  readonly link: (fromPath: string, toPath: string) => Effect.Effect<never, PlatformError, void>
  /**
   * Create a directory at `path`. You can optionally specify the mode and
   * whether to recursively create nested directories.
   */
  readonly makeDirectory: (path: string, options?: MakeDirectoryOptions) => Effect.Effect<never, PlatformError, void>
  /**
   * Create a temporary directory.
   *
   * By default the directory will be created inside the system's default
   * temporary directory, but you can specify a different location by setting
   * the `directory` option.
   *
   * You can also specify a prefix for the directory name by setting the
   * `prefix` option.
   */
  readonly makeTempDirectory: (options?: MakeTempDirectoryOptions) => Effect.Effect<never, PlatformError, string>
  /**
   * Create a temporary directory inside a scope.
   *
   * Functionally equivalent to `makeTempDirectory`, but the directory will be
   * automatically deleted when the scope is closed.
   */
  readonly makeTempDirectoryScoped: (options?: MakeTempDirectoryOptions) => Effect.Effect<Scope, PlatformError, string>
  /**
   * Create a temporary file.
   * The directory creation is functionally equivalent to `makeTempDirectory`.
   * The file name will be a randomly generated string.
   */
  readonly makeTempFile: (options?: MakeTempFileOptions) => Effect.Effect<never, PlatformError, string>
  /**
   * Create a temporary file inside a scope.
   *
   * Functionally equivalent to `makeTempFile`, but the file will be
   * automatically deleted when the scope is closed.
   */
  readonly makeTempFileScoped: (options?: MakeTempFileOptions) => Effect.Effect<Scope, PlatformError, string>
  /**
   * Open a file at `path` with the specified `options`.
   *
   * The file handle will be automatically closed when the scope is closed.
   */
  readonly open: (path: string, options?: OpenFileOptions) => Effect.Effect<Scope, PlatformError, File>
  /**
   * List the contents of a directory.
   *
   * You can recursively list the contents of nested directories by setting the
   * `recursive` option.
   */
  readonly readDirectory: (
    path: string,
    options?: ReadDirectoryOptions
  ) => Effect.Effect<never, PlatformError, ReadonlyArray<string>>
  /**
   * Read the contents of a file.
   */
  readonly readFile: (path: string) => Effect.Effect<never, PlatformError, Uint8Array>
  /**
   * Read the contents of a file.
   */
  readonly readFileString: (path: string, encoding?: string) => Effect.Effect<never, PlatformError, string>
  /**
   * Read the destination of a symbolic link.
   */
  readonly readLink: (path: string) => Effect.Effect<never, PlatformError, string>
  /**
   * Resolve a path to its canonicalized absolute pathname.
   */
  readonly realPath: (path: string) => Effect.Effect<never, PlatformError, string>
  /**
   * Remove a file or directory.
   *
   * By setting the `recursive` option to `true`, you can recursively remove
   * nested directories.
   */
  readonly remove: (path: string, options?: RemoveOptions) => Effect.Effect<never, PlatformError, void>
  /**
   * Rename a file or directory.
   */
  readonly rename: (oldPath: string, newPath: string) => Effect.Effect<never, PlatformError, void>
  /**
   * Create a writable `Sink` for the specified `path`.
   */
  readonly sink: (path: string, options?: SinkOptions) => Sink<never, PlatformError, Uint8Array, never, void>
  /**
   * Get information about a file at `path`.
   */
  readonly stat: (path: string) => Effect.Effect<never, PlatformError, File.Info>
  /**
   * Create a readable `Stream` for the specified `path`.
   *
   * Changing the `bufferSize` option will change the internal buffer size of
   * the stream. It defaults to `4`.
   *
   * The `chunkSize` option will change the size of the chunks emitted by the
   * stream. It defaults to 64kb.
   *
   * Changing `offset` and `bytesToRead` will change the offset and the number
   * of bytes to read from the file.
   */
  readonly stream: (path: string, options?: StreamOptions) => Stream<never, PlatformError, Uint8Array>
  /**
   * Create a symbolic link from `fromPath` to `toPath`.
   */
  readonly symlink: (fromPath: string, toPath: string) => Effect.Effect<never, PlatformError, void>
  /**
   * Truncate a file to a specified length. If the `length` is not specified,
   * the file will be truncated to length `0`.
   */
  readonly truncate: (path: string, length?: SizeInput) => Effect.Effect<never, PlatformError, void>
  /**
   * Change the file system timestamps of the file at `path`.
   */
  readonly utimes: (
    path: string,
    atime: Date | number,
    mtime: Date | number
  ) => Effect.Effect<never, PlatformError, void>
  /**
   * Write data to a file at `path`.
   */
  readonly writeFile: (
    path: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ) => Effect.Effect<never, PlatformError, void>
  /**
   * Write a string to a file at `path`.
   */
  readonly writeFileString: (
    path: string,
    data: string,
    options?: WriteFileStringOptions
  ) => Effect.Effect<never, PlatformError, void>
}
```

Added in v1.0.0

## OpenFlag (type alias)

**Signature**

```ts
export type OpenFlag = 'r' | 'r+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+'
```

Added in v1.0.0

## SeekMode (type alias)

**Signature**

```ts
export type SeekMode = 'start' | 'current'
```

Added in v1.0.0

# options

## AccessFileOptions (interface)

**Signature**

```ts
export interface AccessFileOptions {
  readonly ok?: boolean
  readonly readable?: boolean
  readonly writable?: boolean
}
```

Added in v1.0.0

## CopyOptions (interface)

**Signature**

```ts
export interface CopyOptions {
  readonly overwrite?: boolean
  readonly preserveTimestamps?: boolean
}
```

Added in v1.0.0

## MakeDirectoryOptions (interface)

**Signature**

```ts
export interface MakeDirectoryOptions {
  readonly recursive?: boolean
  readonly mode?: number
}
```

Added in v1.0.0

## MakeTempDirectoryOptions (interface)

**Signature**

```ts
export interface MakeTempDirectoryOptions {
  readonly directory?: string
  readonly prefix?: string
}
```

Added in v1.0.0

## MakeTempFileOptions (interface)

**Signature**

```ts
export interface MakeTempFileOptions {
  readonly directory?: string
  readonly prefix?: string
}
```

Added in v1.0.0

## OpenFileOptions (interface)

**Signature**

```ts
export interface OpenFileOptions {
  readonly flag?: OpenFlag
  readonly mode?: number
}
```

Added in v1.0.0

## ReadDirectoryOptions (interface)

**Signature**

```ts
export interface ReadDirectoryOptions {
  readonly recursive?: boolean
}
```

Added in v1.0.0

## RemoveOptions (interface)

**Signature**

```ts
export interface RemoveOptions {
  readonly recursive?: boolean
}
```

Added in v1.0.0

## SinkOptions (interface)

**Signature**

```ts
export interface SinkOptions extends OpenFileOptions {}
```

Added in v1.0.0

## StreamOptions (interface)

**Signature**

```ts
export interface StreamOptions {
  readonly bufferSize?: number
  readonly bytesToRead?: SizeInput
  readonly chunkSize?: SizeInput
  readonly offset?: SizeInput
}
```

Added in v1.0.0

## WriteFileOptions (interface)

**Signature**

```ts
export interface WriteFileOptions {
  readonly flag?: OpenFlag
  readonly mode?: number
}
```

Added in v1.0.0

## WriteFileStringOptions (interface)

**Signature**

```ts
export interface WriteFileStringOptions {
  readonly flag?: OpenFlag
  readonly mode?: number
}
```

Added in v1.0.0

# sizes

## GiB

**Signature**

```ts
export declare const GiB: (n: number) => Size
```

Added in v1.0.0

## KiB

**Signature**

```ts
export declare const KiB: (n: number) => Size
```

Added in v1.0.0

## MiB

**Signature**

```ts
export declare const MiB: (n: number) => Size
```

Added in v1.0.0

## PiB

**Signature**

```ts
export declare const PiB: (n: number) => Size
```

Added in v1.0.0

## Size

**Signature**

```ts
export declare const Size: (bytes: SizeInput) => Size
```

Added in v1.0.0

## Size (type alias)

Represents a size in bytes.

**Signature**

```ts
export type Size = Brand.Branded<bigint, 'Size'>
```

Added in v1.0.0

## SizeInput (type alias)

Represents a size in bytes.

**Signature**

```ts
export type SizeInput = bigint | number | Size
```

Added in v1.0.0

## TiB

**Signature**

```ts
export declare const TiB: (n: number) => Size
```

Added in v1.0.0

# tag

## FileSystem

**Signature**

```ts
export declare const FileSystem: Tag<FileSystem, FileSystem>
```

Added in v1.0.0

# type id

## FileTypeId

**Signature**

```ts
export declare const FileTypeId: typeof FileTypeId
```

Added in v1.0.0

## FileTypeId (type alias)

**Signature**

```ts
export type FileTypeId = typeof FileTypeId
```

Added in v1.0.0

# utils

## File (namespace)

Added in v1.0.0

### Info (interface)

**Signature**

```ts
export interface Info {
  readonly type: Type
  readonly mtime: Option<Date>
  readonly atime: Option<Date>
  readonly birthtime: Option<Date>
  readonly dev: number
  readonly ino: Option<number>
  readonly mode: number
  readonly nlink: Option<number>
  readonly uid: Option<number>
  readonly gid: Option<number>
  readonly rdev: Option<number>
  readonly size: Size
  readonly blksize: Option<Size>
  readonly blocks: Option<number>
}
```

Added in v1.0.0

### Descriptor (type alias)

**Signature**

```ts
export type Descriptor = Brand.Branded<number, 'FileDescriptor'>
```

Added in v1.0.0

### Type (type alias)

**Signature**

```ts
export type Type =
  | 'File'
  | 'Directory'
  | 'SymbolicLink'
  | 'BlockDevice'
  | 'CharacterDevice'
  | 'FIFO'
  | 'Socket'
  | 'Unknown'
```

Added in v1.0.0
