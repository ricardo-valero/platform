import * as Context from "@effect/data/Context"
import type * as Etag from "@effect/platform/Http/Etag"

/** @internal */
export const GeneratorTypeId: Etag.GeneratorTypeId = Symbol.for(
  "@effect/platform/Http/Etag/Generator"
) as Etag.GeneratorTypeId

/** @internal */
export const tag = Context.Tag<Etag.Generator>(GeneratorTypeId)

/** @internal */
export const toString = (self: Etag.Etag): string => {
  switch (self._tag) {
    case "Weak":
      return `W/"${self.value}"`
    case "Strong":
      return `"${self.value}"`
  }
}
