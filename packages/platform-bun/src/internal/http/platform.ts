import { pipe } from "@effect/data/Function"
import * as Layer from "@effect/io/Layer"
import * as FileSystem from "@effect/platform-bun/FileSystem"
import * as Etag from "@effect/platform-node/Http/Etag"
import * as Platform from "@effect/platform/Http/Platform"
import * as ServerResponse from "@effect/platform/Http/ServerResponse"

/** @internal */
export const make = Platform.make({
  fileResponse(path, status, statusText, headers, start, end, _contentLength) {
    let file = Bun.file(path)
    if (start > 0 || end !== undefined) {
      file = file.slice(start, end)
    }
    return ServerResponse.raw(file, { headers, status, statusText })
  },
  fileWebResponse(file, status, statusText, headers, _options) {
    return ServerResponse.raw(file, { headers, status, statusText })
  }
})

/** @internal */
export const layer = pipe(
  Layer.effect(Platform.Platform, make),
  Layer.use(FileSystem.layer),
  Layer.use(Etag.layer)
)
