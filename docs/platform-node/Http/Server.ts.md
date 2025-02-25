---
title: Http/Server.ts
nav_order: 10
parent: "@effect/platform-node"
---

## Server overview

Added in v1.0.0

Also includes exports from [`@effect/platform/Http/Server`](https://effect-ts.github.io/platform/platform/Http/Server.ts.html).

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [layers](#layers)
  - [layer](#layer)
  - [layerConfig](#layerconfig)

---

# constructors

## make

**Signature**

```ts
export declare const make: (
  evaluate: LazyArg<Http.Server>,
  options: Net.ListenOptions
) => Effect.Effect<Scope.Scope, never, Server.Server>
```

Added in v1.0.0

# layers

## layer

**Signature**

```ts
export declare const layer: (
  evaluate: LazyArg<Http.Server<typeof Http.IncomingMessage, typeof Http.ServerResponse>>,
  options: Net.ListenOptions
) => Layer.Layer<never, never, Server.Server | Platform.Platform>
```

Added in v1.0.0

## layerConfig

**Signature**

```ts
export declare const layerConfig: (
  evaluate: LazyArg<Http.Server<typeof Http.IncomingMessage, typeof Http.ServerResponse>>,
  options: Config.Config.Wrap<Net.ListenOptions>
) => Layer.Layer<never, ConfigError.ConfigError, Server.Server | Platform.Platform>
```

Added in v1.0.0
