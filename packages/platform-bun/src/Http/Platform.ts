/**
 * @since 1.0.0
 *
 * Also includes exports from [`@effect/platform/Http/Platform`](https://effect-ts.github.io/platform/platform/Http/Platform.ts.html).
 */
import type * as Effect from "@effect/io/Effect"
import type * as Layer from "@effect/io/Layer"
import type * as FileSystem from "@effect/platform-bun/FileSystem"
import * as internal from "@effect/platform-bun/internal/http/platform"
import type * as Etag from "@effect/platform/Http/Etag"
import type * as Platform from "@effect/platform/Http/Platform"

/**
 * @since 1.0.0
 */
export * from "@effect/platform/Http/Platform"

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: Effect.Effect<FileSystem.FileSystem | Etag.Generator, never, Platform.Platform> = internal.make

/**
 * @since 1.0.0
 * @category layers
 */
export const layer: Layer.Layer<never, never, Platform.Platform> = internal.layer
