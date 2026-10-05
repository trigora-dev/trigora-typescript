# @trigora/sdk

TypeScript authoring SDK for Trigora durable programs.

Build long-running programs that can call external systems, wait for events, sleep durably, invoke child executions, and recover from committed continuation state.

## Install

```bash
npm install @trigora/sdk
```

## Quick example

```ts
import { effect, waitForEvent } from '@trigora/sdk';

export default async function approval(input) {
  const result = await effect('generate', () => 42);
  const review = await waitForEvent('approved');

  return { result, review };
}
```

Run it locally with:

```bash
trigora dev
trigora start approval --input '{"request":"example"}'
```

## Program entry

Trigora discovers programs from the paths configured in `trigora.toml`:

```toml
[project]
name = "my-project"
programs = ["src/**/*.ts"]
```

Each matching file default-exports one async program entry.

```ts
export default async function research(topic, depth = topic) {
  // ...
}
```

The TypeScript frontend implements `ts.subset.v1`.

Program parameters may be plain identifiers. Defaults may reference earlier parameters only. Missing arguments remain `undefined` unless a supported default applies, and extra arguments are ignored.

Rest parameters and optional `?` parameters are not supported.

An anonymous default export is also valid:

```ts
export default async function () {
  // ...
}
```

Its artifact entry name is `"default"`.

## Durable primitives

- `effect(name, fn)` — run a durable external effect
- `sleep(ms)` — suspend on a durable timer
- `waitForEvent(name)` — wait for an external event
- `invoke(program, input)` — invoke a durable child execution
- `execution.id` — current execution id
- `execution.attempt` — current attempt
- `execution.signal` — execution cancellation signal

Effect keys and event names are string literals in the current TypeScript subset.

## Local development

```bash
trigora init
trigora dev
trigora start approval
trigora send <execution> approved --payload '"ok"'
trigora result <execution>
```

Programs execute through the Trigora runtime rather than by running the source file directly.

## Typed events

`event()` can be used to define typed events shared between program and client code.

## Integrations

Webhook signature helpers are available at:

```ts
@trigora/sdk/stripe
@trigora/sdk/github
```

These are optional TypeScript convenience utilities.

## Learn more

- [Quickstart](https://trigora.dev/docs/quickstart)
- [Trigora documentation](https://trigora.dev/docs)
- [TCC TypeScript semantics](https://github.com/trigora-dev/tcc-engine/blob/main/spec/typescript-subset.md)

## License

MIT © 2026 Trigora, Inc.
