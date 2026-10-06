# @trigora/client

TypeScript client for starting and controlling Trigora durable executions.

Use the same API locally with `trigora dev` or remotely with Trigora Cloud.

## Install

```bash
npm install @trigora/client
```

## Quick example

```ts
import { createClient } from '@trigora/client';

const trigora = createClient();

const run = await trigora.start('approval', {
  request: 'example'
});

await run.send('approved', 'ok');

const result = await run.result();

console.log(result);
```

`start()` also accepts a named async program function where supported:

```ts
async function approval() {
  return { result: 42 };
}

const run = await trigora.start(approval, {});
```

## Local and Cloud

By default, the client connects to the local runtime started by `trigora dev`.

```ts
const trigora = createClient();
```

To connect to Trigora Cloud:

```ts
const trigora = createClient({ remote: true });
```

Cloud requires a token. You can pass one directly or set `TRIGORA_TOKEN`.

```ts
const trigora = createClient({
  remote: true,
  token: process.env.TRIGORA_TOKEN
});
```

You can also connect to a custom endpoint:

```ts
const trigora = createClient({
  url: 'http://127.0.0.1:3477'
});
```

Endpoint defaults:

- Local runtime: `TRIGORA_RUNTIME_URL` or `http://127.0.0.1:3477`
- Trigora Cloud: `TRIGORA_API_BASE_URL` or `https://api.trigora.dev`

An explicit `url` overrides the default endpoint. An explicit `token` is sent with requests to that endpoint.

## API

Workspace and project operations:

- `whoAmI()`
- `listProjects()`
- `createProject()`

Programs:

- `deployProgram()`
- `listPrograms()`
- `getProgram()`
- `listProgramVersions()`

Executions:

- `start(program, input?)` — omitted input is `[]`; an explicit `{}` is one value
- `listExecutions()`
- `getExecution(id)`

Execution handle:

- `run.id`
- `run.send(event, payload)`
- `run.cancel()`
- `run.result()`

`listPrograms`, `listProgramVersions`, and `listExecutions` accept optional pagination:

```ts
{ limit, cursor }
```

`program` may be a program id string or a named async function.

`event` may be an event name string or an `event()` definition from `@trigora/sdk`.

## Learn more

- [Trigora documentation](https://trigora.dev/docs)
- [Client documentation](https://trigora.dev/docs/client)
- [Trigora Cloud](https://cloud.trigora.dev)

## License

MIT © 2026 Trigora, Inc.
