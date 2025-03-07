import { pipe } from "@effect/data/Function"
import * as Layer from "@effect/io/Layer"
import * as FileSystem from "@effect/platform-node/FileSystem"
import * as Etag from "@effect/platform-node/Http/Etag"
import * as Platform from "@effect/platform/Http/Platform"
import * as ServerResponse from "@effect/platform/Http/ServerResponse"
import * as Mime from "mime"
import * as Fs from "node:fs"
import { Readable } from "node:stream"

/** @internal */
export const make = Platform.make({
  fileResponse(path, status, statusText, headers, start, end, contentLength) {
    const stream = Fs.createReadStream(path, { start, end })
    return ServerResponse.raw(stream, {
      headers: {
        ...headers,
        "content-type": headers["content-type"] ?? Mime.getType(path) ?? "application/octet-stream",
        "content-length": contentLength.toString()
      },
      status,
      statusText
    })
  },
  fileWebResponse(file, status, statusText, headers, _options) {
    return ServerResponse.raw(Readable.fromWeb(file.stream() as any), {
      headers: {
        ...headers,
        "content-type": headers["content-type"] ?? Mime.getType(file.name) ?? "application/octet-stream",
        "content-length": file.size.toString()
      },
      status,
      statusText
    })
  }
})

/** @internal */
export const layer = pipe(
  Layer.effect(Platform.Platform, make),
  Layer.use(FileSystem.layer),
  Layer.use(Etag.layer)
)
