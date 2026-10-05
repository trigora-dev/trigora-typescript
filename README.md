<p align="center">
  <a href="https://trigora.dev">
    <img src="https://trigora.dev/ts-banner.png" alt="Trigora / TypeScript — durable execution without history replay." width="100%" />
  </a>
</p>

# Trigora for TypeScript

**Durable execution for TypeScript without history replay.**

Build long-lived agents and programs that can wait on events, call external systems, invoke durable child executions, and recover after failure from committed continuation state.

Trigora uses **Transparent Continuation Checkpointing (TCC)** underneath rather than reconstructing program state by replaying completed execution history.

## Install

```sh
npm install @trigora/sdk @trigora/client trigora
```

- `@trigora/sdk` — author durable TypeScript programs
- `@trigora/client` — start and control executions through the Trigora API
- `trigora` — CLI and local runtime

## Quickstart

Initialize a project:

```sh
trigora init
```

Start the local runtime:

```sh
trigora dev
```

Deploy to Trigora Cloud:

```sh
trigora deploy
```

See the [quickstart](https://trigora.dev/docs/quickstart) for a complete example.

## Durable programs

Trigora programs can:

- run external effects;
- wait for events;
- sleep durably;
- invoke child executions;
- use structured concurrency;
- recover after worker or process failure.

Only state that crosses a durable boundary needs a stable durable representation.

The TypeScript frontend implements a declared language subset rather than arbitrary JavaScript execution. See the [language documentation](https://trigora.dev/docs) and the [TCC TypeScript semantics](https://github.com/trigora-dev/tcc-engine/blob/main/spec/typescript-subset.md).

## Packages

### `@trigora/sdk`

The TypeScript authoring surface for Trigora programs.

### `@trigora/client`

The TypeScript client for Trigora Cloud.

Use it to work with projects, programs, executions, events, results, and other Cloud APIs.

## Ecosystem

- [Trigora](https://github.com/trigora-dev/trigora) — CLI, local runtime, contracts, and ecosystem overview
- [Trigora for Python](https://github.com/trigora-dev/trigora-python)
- [Trigora for Rust](https://github.com/trigora-dev/trigora-rust)
- [TCC Engine](https://github.com/trigora-dev/tcc-engine) — portable execution engine and specifications

## Links

- [Website](https://trigora.dev)
- [Documentation](https://trigora.dev/docs)
- [Trigora Cloud](https://cloud.trigora.dev)
- [Research](https://trigora.dev/research)
- [Technical report](https://trigora.dev/research/whitepaper)

## License

MIT © 2026 Trigora, Inc.
