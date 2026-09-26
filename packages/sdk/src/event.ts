import { resolveEventName, type EventDefinition } from '@trigora/contracts';

export type { EventDefinition };
export { resolveEventName };

export function event<TPayload = unknown>(name: string): EventDefinition<TPayload> {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error('Event name must be a non-empty string.');
  }

  return { name: trimmed };
}
