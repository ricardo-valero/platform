import * as Effect from "@effect/io/Effect"
import * as Http from "@effect/platform-node/HttpServer"
import { runMain } from "@effect/platform-node/Runtime"
import { createServer } from "node:http"

const ServerLive = Http.server.layer(() => createServer(), { port: 3000 })

Http.server.serve(Effect.succeed(Http.response.text("Hello World"))).pipe(
  Effect.scoped,
  Effect.provideLayer(ServerLive),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
