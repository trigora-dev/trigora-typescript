# @trigora/sdk

Authoring primitives for Trigora durable programs.

Write an ordinary default-exported async program entry. Make durable operations explicit. `trigora dev` compiles the supported subset and runs it on the local TCC engine.

```ts
import { effect, waitForEvent } from '@trigora/sdk';

export default async function approval() {
  const result = await effect('generate', () => 42);
  const review = await waitForEvent('approved');
  return { result, review };
}
```

There is no `defineFlow()` and no mandatory `ctx`. The local compiler supports `ts.subset.v1`: a default-exported async program entry with no parameters, or one plain parameter (`approval(input)`). An anonymous `export default async function ()` is valid; the artifact names that entry `"default"`. Not a second parameter, a default, a rest parameter, or a binding pattern. Effect keys and event names are string literals.

## Install

```bash
npm install @trigora/sdk trigora @trigora/client
```

## Program entry

Discover programs from `trigora.toml`:

```toml
[project]
name = "my-project"
programs = ["src/**/*.ts"]
```

Each matching file default-exports one async program entry. A named entry's function name is the program id. An anonymous default export uses the file name.

Triggers are configured in `trigora.toml` and deployed with the Trigora CLI. They are not SDK or client APIs.

## Primitives

- `effect(name, fn)` — durable side effect; `name` is required
- `sleep(ms)` — timer suspension
- `waitForEvent('approved')` — wait for an event
- `invoke('analyze', input)` — child execution. `input` is optional.
- `execution.id` / `execution.attempt` / `execution.signal` — current execution metadata

`event()` helpers exist for typed clients but are not required. Directly executing a program file will throw; start it with `@trigora/client` while `trigora dev` is running.

## Local preview

```bash
npx trigora init
npx trigora dev
trigora start approval
trigora send <id> approved --payload '"ok"'
```

See [`examples/approval`](../../examples/approval).

Webhook signature helpers remain available at `@trigora/sdk/stripe` and `@trigora/sdk/github`.

This package is MIT. The CLI may depend on separate `@tcc-engine/*` packages; those are not part of this SDK.

## License

MIT
