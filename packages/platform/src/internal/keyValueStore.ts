import * as Context from "@effect/data/Context"
import { dual, pipe } from "@effect/data/Function"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as FileSystem from "@effect/platform/FileSystem"
import type * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as Path from "@effect/platform/Path"
import * as Schema from "@effect/schema/Schema"

/** @internal */
export const TypeId: KeyValueStore.TypeId = Symbol.for(
  "@effect/platform/KeyValueStore"
) as KeyValueStore.TypeId

/** @internal */
export const keyValueStoreTag = Context.Tag<KeyValueStore.KeyValueStore>(TypeId)

/** @internal */
export const make: (
  impl:
    & Omit<KeyValueStore.KeyValueStore, KeyValueStore.TypeId | "has" | "modify" | "isEmpty" | "forSchema">
    & Partial<KeyValueStore.KeyValueStore>
) => KeyValueStore.KeyValueStore = (impl) =>
  keyValueStoreTag.of({
    [TypeId]: TypeId,
    has: (key) => Effect.map(impl.get(key), Option.isSome),
    isEmpty: Effect.map(impl.size, (size) => size === 0),
    modify: (key, f) =>
      Effect.flatMap(
        impl.get(key),
        (o) => {
          if (Option.isNone(o)) {
            return Effect.succeedNone
          }
          const newValue = f(o.value)
          return Effect.as(
            impl.set(key, newValue),
            Option.some(newValue)
          )
        }
      ),
    forSchema(schema) {
      return makeSchemaStore(this, schema)
    },
    ...impl
  })

/** @internal */
export const prefix = dual<
  (prefix: string) => <S extends KeyValueStore.KeyValueStore.AnyStore>(self: S) => S,
  <S extends KeyValueStore.KeyValueStore.AnyStore>(self: S, prefix: string) => S
>(
  2,
  ((self: KeyValueStore.KeyValueStore, prefix: string): KeyValueStore.KeyValueStore => ({
    ...self,
    get: (key) => self.get(`${prefix}${key}`),
    set: (key, value) => self.set(`${prefix}${key}`, value),
    remove: (key) => self.remove(`${prefix}${key}`),
    has: (key) => self.has(`${prefix}${key}`),
    modify: (key, f) => self.modify(`${prefix}${key}`, f)
  })) as any
)

/** @internal */
export const SchemaStoreTypeId: KeyValueStore.SchemaStoreTypeId = Symbol.for(
  "@effect/platform/KeyValueStore/SchemaStore"
) as KeyValueStore.SchemaStoreTypeId

/** @internal */
const makeSchemaStore = <I, A>(
  store: KeyValueStore.KeyValueStore,
  schema: Schema.Schema<I, A>
): KeyValueStore.SchemaStore<A> => {
  const jsonSchema = Schema.compose(Schema.ParseJson, schema)
  const parse = Schema.parse(jsonSchema)
  const encode = Schema.encode(jsonSchema)

  const get = (key: string) =>
    Effect.flatMap(
      store.get(key),
      Option.match({
        onNone: () => Effect.succeedNone,
        onSome: (value) => Effect.asSome(parse(value))
      })
    )

  const set = (key: string, value: A) => Effect.flatMap(encode(value), (json) => store.set(key, json))

  const modify = (key: string, f: (value: A) => A) =>
    Effect.flatMap(
      get(key),
      (o) => {
        if (Option.isNone(o)) {
          return Effect.succeedNone
        }
        const newValue = f(o.value)
        return Effect.as(
          set(key, newValue),
          Option.some(newValue)
        )
      }
    )

  return {
    [SchemaStoreTypeId]: SchemaStoreTypeId,
    get,
    set,
    modify,
    remove: store.remove,
    clear: store.clear,
    size: store.size,
    has: store.has,
    isEmpty: store.isEmpty
  }
}

/** @internal */
export const layerMemory = Layer.sync(keyValueStoreTag, () => {
  const store = new Map<string, string>()

  return make({
    get: (key: string) => Effect.sync(() => Option.fromNullable(store.get(key))),
    set: (key: string, value: string) => Effect.sync(() => store.set(key, value)),
    remove: (key: string) => Effect.sync(() => store.delete(key)),
    clear: Effect.sync(() => store.clear()),
    size: Effect.sync(() => store.size)
  })
})

/** @internal */
export const layerFileSystem = (directory: string) =>
  Layer.effect(
    keyValueStoreTag,
    Effect.gen(function*(_) {
      const fs = yield* _(FileSystem.FileSystem)
      const path = yield* _(Path.Path)
      const keyPath = (key: string) => path.join(directory, encodeURIComponent(key))

      if (!(yield* _(fs.exists(directory)))) {
        yield* _(fs.makeDirectory(directory, { recursive: true }))
      }

      return make({
        get: (key: string) =>
          pipe(
            Effect.map(fs.readFileString(keyPath(key)), Option.some),
            Effect.catchTag(
              "SystemError",
              (sysError) => sysError.reason === "NotFound" ? Effect.succeed(Option.none()) : Effect.fail(sysError)
            )
          ),
        set: (key: string, value: string) => fs.writeFileString(keyPath(key), value),
        remove: (key: string) => fs.remove(keyPath(key)),
        has: (key: string) => fs.exists(keyPath(key)),
        clear: Effect.zipRight(
          fs.remove(directory, { recursive: true }),
          fs.makeDirectory(directory, { recursive: true })
        ),
        size: Effect.map(
          fs.readDirectory(directory),
          (files) => files.length
        )
      })
    })
  )

/** @internal */
export const layerSchema = <I, A>(
  schema: Schema.Schema<I, A>,
  tagIdentifier?: unknown
) => {
  const tag = Context.Tag<KeyValueStore.SchemaStore<A>>(tagIdentifier)
  const layer = Layer.effect(tag, Effect.map(keyValueStoreTag, (store) => store.forSchema(schema)))
  return { tag, layer } as const
}
