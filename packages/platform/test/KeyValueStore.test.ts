import { identity } from "@effect/data/Function"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as Schema from "@effect/schema/Schema"
import { afterEach } from "vitest"

export const testLayer = <E>(layer: Layer.Layer<never, E, KeyValueStore.KeyValueStore>) => {
  const run = <E, A>(effect: Effect.Effect<KeyValueStore.KeyValueStore, E, A>) =>
    Effect.runPromise(Effect.provideLayer(effect, layer))

  afterEach(() =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.clear)
    }))
  )

  it("set", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.set("/foo/bar", "bar"))

      const value = yield* _(kv.get("/foo/bar"))
      const length = yield* _(kv.size)

      expect(value).toEqual(Option.some("bar"))
      expect(length).toEqual(1)
    })))

  it("get/ missing", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.clear)
      const value = yield* _(kv.get("foo"))

      expect(value).toEqual(Option.none())
    })))

  it("remove", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.set("foo", "bar"))
      yield* _(kv.remove("foo"))

      const value = yield* _(kv.get("foo"))
      const length = yield* _(kv.size)

      expect(value).toEqual(Option.none())
      expect(length).toEqual(0)
    })))

  it("clear", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.set("foo", "bar"))
      yield* _(kv.clear)

      const value = yield* _(kv.get("foo"))
      const length = yield* _(kv.size)

      expect(value).toEqual(Option.none())
      expect(length).toEqual(0)
    })))

  it("modify", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)
      yield* _(kv.set("foo", "bar"))

      const value = yield* _(kv.modify("foo", (v) => v + "bar"))
      const length = yield* _(kv.size)

      expect(value).toEqual(Option.some("barbar"))
      expect(length).toEqual(1)
    })))

  it("modify - none", () =>
    run(Effect.gen(function*(_) {
      const kv = yield* _(KeyValueStore.KeyValueStore)

      const value = yield* _(kv.modify("foo", (v) => v + "bar"))
      const length = yield* _(kv.size)

      expect(value).toEqual(Option.none())
      expect(length).toEqual(0)
    })))
}

describe("KeyValueStore / layerMemory", () => testLayer(KeyValueStore.layerMemory))

describe("KeyValueStore / prefix", () => {
  it("prefixes the keys", () =>
    Effect.gen(function*(_) {
      const store = yield* _(KeyValueStore.KeyValueStore)
      const prefixed = KeyValueStore.prefix(store, "prefix/")

      yield* _(prefixed.set("foo", "bar"))
      yield* _(prefixed.modify("foo", (v) => v + "bar"))

      expect(yield* _(prefixed.get("foo"))).toEqual(Option.some("barbar"))
      expect(yield* _(prefixed.has("foo"))).toEqual(true)

      expect(yield* _(store.get("prefix/foo"))).toEqual(Option.some("barbar"))
      expect(yield* _(store.has("prefix/foo"))).toEqual(true)
    }).pipe(
      Effect.provideLayer(KeyValueStore.layerMemory),
      Effect.runPromise
    ))
})

class User extends Schema.Class({
  name: Schema.string,
  age: Schema.number
}) {}
const UserStore = KeyValueStore.layerSchema(User.schema())
const runUserStore = <E, A>(effect: Effect.Effect<KeyValueStore.SchemaStore<User>, E, A>) =>
  Effect.runPromise(Effect.provideLayer(effect, UserStore.layer.pipe(Layer.use(KeyValueStore.layerMemory))))

describe("KeyValueStore / SchemaStore", () => {
  it("encodes & decodes", () =>
    runUserStore(Effect.gen(function*(_) {
      const store = yield* _(UserStore.tag)
      yield* _(store.set("foo", new User({ name: "foo", age: 42 })))
      yield* _(store.modify("foo", (user) => new User({ ...user, age: 43 })))
      const value = yield* _(store.get("foo"), Effect.flatMap(identity))

      expect(value.name).toEqual("foo")
      expect(value.age).toEqual(43)
    })))

  it("prefix", () =>
    runUserStore(Effect.gen(function*(_) {
      const store = yield* _(UserStore.tag)
      const prefixed = KeyValueStore.prefix(store, "prefix/")
      yield* _(prefixed.set("foo", new User({ name: "foo", age: 42 })))
      const value = yield* _(store.get("prefix/foo"), Effect.flatMap(identity))

      expect(value.name).toEqual("foo")
      expect(value.age).toEqual(42)
    })))
})
