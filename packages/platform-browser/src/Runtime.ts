/**
 * @since 1.0.0
 */
import type * as Effect from "@effect/io/Effect"
import * as internal from "@effect/platform-browser/internal/runtime"

/**
 * @since 1.0.0
 * @category runtime
 */
export const runMain: <E, A>(effect: Effect.Effect<never, E, A>) => void = internal.runMain
