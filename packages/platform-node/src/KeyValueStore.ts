/**
 * @since 1.0.0
 *
 * Also includes exports from [`@effect/platform/KeyValueStore`](https://effect-ts.github.io/platform/platform/KeyValueStore.ts.html).
 */
import * as Layer from "@effect/io/Layer"
import * as FileSystem from "@effect/platform-node/FileSystem"
import * as Path from "@effect/platform-node/Path"
import type * as PlatformError from "@effect/platform/Error"
import * as KeyValueStore from "@effect/platform/KeyValueStore"

export * from "@effect/platform/KeyValueStore"

/**
 * @since 1.0.0
 * @category layers
 */
export const layerFileSystem: (
  directory: string
) => Layer.Layer<never, PlatformError.PlatformError, KeyValueStore.KeyValueStore> = (directory: string) =>
  Layer.provide(
    Layer.merge(FileSystem.layer, Path.layer),
    KeyValueStore.layerFileSystem(directory)
  )
