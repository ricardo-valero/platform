---
title: Sink.ts
nav_order: 14
parent: "@effect/platform-bun"
---

## Sink overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructor](#constructor)
  - [fromWritable](#fromwritable)
- [model](#model)
  - [FromWritableOptions](#fromwritableoptions)

---

# constructor

## fromWritable

**Signature**

```ts
export declare const fromWritable: <E, A>(
  evaluate: LazyArg<Writable>,
  onError: (error: unknown) => E,
  options?: FromWritableOptions | undefined
) => Sink<never, E, A, never, void>
```

Added in v1.0.0

# model

## FromWritableOptions

**Signature**

```ts
export declare const FromWritableOptions: FromWritableOptions
```

Added in v1.0.0
