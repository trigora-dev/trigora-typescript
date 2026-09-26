# @trigora/client

Client for starting and controlling Trigora executions.

```ts
import { createClient } from '@trigora/client';

async function approval() {
  return { result: 42, review: 'ok' };
}

const trigora = createClient();
const run = await trigora.start(approval, {});
await run.send('approved', 'ok');
const report = await run.result();
```

A token selects Trigora Cloud (`TRIGORA_API_BASE_URL`, default `https://api.trigora.dev`). Without a token the client uses `trigora dev` (`TRIGORA_RUNTIME_URL`, default `http://127.0.0.1:3477`). After you kill and restart the CLI, `run.send` / `run.result` still work against the same `run.id`.

## API

- `whoAmI()`
- `listProjects()` / `createProject()`
- `deployProgram()`
- `listPrograms()` / `getProgram()` / `listProgramVersions()`
- `start(program, input)` / `listExecutions()` / `getExecution(id)`
- `run.id` / `run.send(event, payload)` / `run.cancel()` / `run.result()`

`listPrograms`, `listProgramVersions`, and `listExecutions` take an optional `{ limit, cursor }`. `program` may be a named async function or a program id string. `event` may be an `event()` definition from `@trigora/sdk` or an event name string.

This package is MIT. It does not import the TCC engine.

## License

MIT
